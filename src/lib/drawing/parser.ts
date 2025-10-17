/**
 * Drawing parser for PDF and image files
 * Extracts dimensions, room layouts, and specifications
 */

import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import {
  DrawingDimensions,
  RoomSpecification,
  ParsedDrawing,
  ExtractedText,
  Point2D,
  WallSegment,
  DrawingParseOptions,
  DoorSpecification
} from './types';

export class DrawingParser {
  private static instance: DrawingParser;
  private ocrWorker: Tesseract.Worker | null = null;

  static getInstance(): DrawingParser {
    if (!DrawingParser.instance) {
      DrawingParser.instance = new DrawingParser();
    }
    return DrawingParser.instance;
  }

  /**
   * Parse PDF drawing file
   */
  async parsePDF(
    file: File | ArrayBuffer,
    options: DrawingParseOptions = {}
  ): Promise<ParsedDrawing> {
    try {
      const pdfData = file instanceof File ? await file.arrayBuffer() : file;
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      
      // Get specified page or first page
      const pageNumber = options.pageNumber || 1;
      const page = await pdf.getPage(pageNumber);
      
      // Extract text content
      const textContent = await page.getTextContent();
      const extractedText = this.parseTextContent(textContent);
      
      // Convert PDF page to image for OCR and dimension detection
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Perform OCR if needed
      if (options.detectText && extractedText.length === 0) {
        const ocrText = await this.performOCR(canvas);
        extractedText.push(...ocrText);
      }
      
      // Extract dimensions and room specifications
      const dimensions = this.extractDimensions(extractedText);
      const rooms = this.extractRooms(extractedText, dimensions);
      
      // Calculate scale if not provided
      const scale = options.scale || this.detectScale(extractedText);
      
      return {
        rooms,
        scale,
        unit: options.unit || this.detectUnit(extractedText) || 'ft',
        totalArea: this.calculateTotalArea(rooms),
        boundingBox: this.calculateBoundingBox(rooms),
        extractedText,
        confidence: this.calculateConfidence(rooms, extractedText)
      };
      
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Parse image drawing file
   */
  async parseImage(
    file: File | HTMLImageElement,
    options: DrawingParseOptions = {}
  ): Promise<ParsedDrawing> {
    try {
      // Convert to canvas for processing
      const canvas = await this.imageToCanvas(file);
      
      // Enhance contrast if requested
      if (options.enhanceContrast) {
        this.enhanceImageContrast(canvas);
      }
      
      // Perform OCR
      const extractedText = await this.performOCR(canvas);
      
      // Extract dimensions and room specifications
      const dimensions = this.extractDimensions(extractedText);
      const rooms = this.extractRooms(extractedText, dimensions);
      
      // Detect edges and walls
      const walls = this.detectWalls(canvas);
      if (walls.length > 0 && rooms.length > 0) {
        rooms[0].walls = walls;
      }
      
      return {
        rooms,
        scale: options.scale || this.detectScale(extractedText),
        unit: options.unit || this.detectUnit(extractedText) || 'ft',
        totalArea: this.calculateTotalArea(rooms),
        boundingBox: this.calculateBoundingBox(rooms),
        extractedText,
        confidence: this.calculateConfidence(rooms, extractedText)
      };
      
    } catch (error) {
      console.error('Error parsing image:', error);
      throw new Error(`Failed to parse image: ${error.message}`);
    }
  }

  /**
   * Extract dimensions from text
   */
  private extractDimensions(textItems: ExtractedText[]): DrawingDimensions[] {
    const dimensions: DrawingDimensions[] = [];
    const dimensionPattern = /(\d+)['']?\s*[-x]\s*(\d+)['']?/gi;
    const singleDimensionPattern = /(\d+)['']?\s*-?\s*(\d+)[""]?/gi;
    
    for (const item of textItems) {
      if (item.type === 'dimension' || item.text.match(dimensionPattern)) {
        const matches = item.text.matchAll(dimensionPattern);
        for (const match of matches) {
          dimensions.push({
            width: parseFloat(match[1]),
            height: parseFloat(match[2]),
            unit: 'ft'
          });
        }
      }
    }
    
    return dimensions;
  }

  /**
   * Extract room specifications from text and dimensions
   */
  private extractRooms(
    textItems: ExtractedText[],
    dimensions: DrawingDimensions[]
  ): RoomSpecification[] {
    const rooms: RoomSpecification[] = [];
    
    // Group text items by proximity
    const textGroups = this.groupTextByProximity(textItems);
    
    // Match room names with dimensions
    for (const group of textGroups) {
      const roomNameItem = group.find(item => 
        item.type === 'label' && item.text.toLowerCase().includes('room')
      );
      
      if (roomNameItem) {
        const nearestDimension = this.findNearestDimension(
          roomNameItem.position,
          dimensions,
          textItems
        );
        
        if (nearestDimension) {
          const room: RoomSpecification = {
            id: `room_${rooms.length + 1}`,
            name: roomNameItem.text,
            dimensions: nearestDimension,
            area: nearestDimension.width * nearestDimension.height,
            perimeter: 2 * (nearestDimension.width + nearestDimension.height),
            walls: [],
            doors: this.extractDoors(group),
            windows: [],
            obstacles: [],
            metadata: {
              createdAt: new Date(),
              source: 'pdf'
            }
          };
          
          rooms.push(room);
        }
      }
    }
    
    // If no rooms found but dimensions exist, create generic room
    if (rooms.length === 0 && dimensions.length > 0) {
      const largestDimension = dimensions.reduce((prev, current) => 
        (prev.width * prev.height > current.width * current.height) ? prev : current
      );
      
      rooms.push({
        id: 'room_1',
        name: 'Flower Room',
        dimensions: largestDimension,
        area: largestDimension.width * largestDimension.height,
        perimeter: 2 * (largestDimension.width + largestDimension.height),
        walls: [],
        doors: [],
        windows: [],
        obstacles: [],
        metadata: {
          createdAt: new Date(),
          source: 'pdf'
        }
      });
    }
    
    return rooms;
  }

  /**
   * Perform OCR on canvas
   */
  private async performOCR(canvas: HTMLCanvasElement): Promise<ExtractedText[]> {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker();
      await this.ocrWorker.loadLanguage('eng');
      await this.ocrWorker.initialize('eng');
    }
    
    const result = await this.ocrWorker.recognize(canvas);
    const extractedText: ExtractedText[] = [];
    
    for (const word of result.data.words) {
      const type = this.classifyText(word.text);
      extractedText.push({
        text: word.text,
        position: {
          x: word.bbox.x0,
          y: word.bbox.y0
        },
        type,
        confidence: word.confidence
      });
    }
    
    return extractedText;
  }

  /**
   * Classify text type based on content
   */
  private classifyText(text: string): ExtractedText['type'] {
    const dimensionPattern = /\d+['"]?\s*[-x]\s*\d+['"]?/i;
    const labelPattern = /room|space|area|zone/i;
    const annotationPattern = /note|typ|ref/i;
    
    if (dimensionPattern.test(text)) return 'dimension';
    if (labelPattern.test(text)) return 'label';
    if (annotationPattern.test(text)) return 'annotation';
    return 'title';
  }

  /**
   * Detect unit from text
   */
  private detectUnit(textItems: ExtractedText[]): 'ft' | 'in' | 'm' | 'cm' | null {
    for (const item of textItems) {
      if (item.text.includes("'") || item.text.includes('ft')) return 'ft';
      if (item.text.includes('"') || item.text.includes('in')) return 'in';
      if (item.text.includes('m')) return 'm';
      if (item.text.includes('cm')) return 'cm';
    }
    return null;
  }

  /**
   * Detect scale from drawing
   */
  private detectScale(textItems: ExtractedText[]): number {
    const scalePattern = /scale[:\s]+1[:\s]+(\d+)/i;
    
    for (const item of textItems) {
      const match = item.text.match(scalePattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }
    
    // Default scale
    return 1;
  }

  /**
   * Parse text content from PDF
   */
  private parseTextContent(textContent: any): ExtractedText[] {
    const extractedText: ExtractedText[] = [];
    
    for (const item of textContent.items) {
      if (item.str && item.str.trim()) {
        extractedText.push({
          text: item.str,
          position: {
            x: item.transform[4],
            y: item.transform[5]
          },
          type: this.classifyText(item.str),
          confidence: 1.0
        });
      }
    }
    
    return extractedText;
  }

  /**
   * Detect walls using edge detection
   */
  private detectWalls(canvas: HTMLCanvasElement): WallSegment[] {
    const walls: WallSegment[] = [];
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple edge detection for straight lines
    // This is a simplified version - real implementation would use more sophisticated algorithms
    const edges = this.detectEdges(imageData);
    const lines = this.detectLines(edges);
    
    // Convert detected lines to wall segments
    lines.forEach((line, index) => {
      walls.push({
        id: `wall_${index + 1}`,
        startPoint: line.start,
        endPoint: line.end,
        thickness: 6, // Default 6 inch walls
        height: 10, // Default 10 ft height
        type: 'interior'
      });
    });
    
    return walls;
  }

  /**
   * Simple edge detection
   */
  private detectEdges(imageData: ImageData): ImageData {
    // Simplified Sobel edge detection
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const output = new Uint8ClampedArray(src.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Sobel X
        const pixelX = (
          -1 * src[idx - 4 - width * 4] +
          -2 * src[idx - 4] +
          -1 * src[idx - 4 + width * 4] +
          src[idx + 4 - width * 4] +
          2 * src[idx + 4] +
          src[idx + 4 + width * 4]
        );
        
        // Sobel Y
        const pixelY = (
          -1 * src[idx - width * 4 - 4] +
          -2 * src[idx - width * 4] +
          -1 * src[idx - width * 4 + 4] +
          src[idx + width * 4 - 4] +
          2 * src[idx + width * 4] +
          src[idx + width * 4 + 4]
        );
        
        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        output[idx] = output[idx + 1] = output[idx + 2] = magnitude > 128 ? 255 : 0;
        output[idx + 3] = 255;
      }
    }
    
    return new ImageData(output, width, height);
  }

  /**
   * Detect lines from edges (simplified Hough transform)
   */
  private detectLines(edges: ImageData): Array<{start: Point2D, end: Point2D}> {
    // This is a placeholder - real implementation would use Hough transform
    return [];
  }

  /**
   * Group text by proximity
   */
  private groupTextByProximity(textItems: ExtractedText[]): ExtractedText[][] {
    const groups: ExtractedText[][] = [];
    const threshold = 50; // pixels
    
    const used = new Set<number>();
    
    for (let i = 0; i < textItems.length; i++) {
      if (used.has(i)) continue;
      
      const group = [textItems[i]];
      used.add(i);
      
      for (let j = i + 1; j < textItems.length; j++) {
        if (used.has(j)) continue;
        
        const distance = this.calculateDistance(
          textItems[i].position,
          textItems[j].position
        );
        
        if (distance < threshold) {
          group.push(textItems[j]);
          used.add(j);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Find nearest dimension to a position
   */
  private findNearestDimension(
    position: Point2D,
    dimensions: DrawingDimensions[],
    textItems: ExtractedText[]
  ): DrawingDimensions | null {
    // For now, return the first dimension
    // Real implementation would match based on proximity
    return dimensions[0] || null;
  }

  /**
   * Extract doors from text group
   */
  private extractDoors(textGroup: ExtractedText[]): DoorSpecification[] {
    const doors: DoorSpecification[] = [];
    
    const doorItem = textGroup.find(item => 
      item.text.toLowerCase().includes('door')
    );
    
    if (doorItem) {
      doors.push({
        id: 'door_1',
        position: doorItem.position,
        width: 3, // Standard door width
        height: 7, // Standard door height
        orientation: 'east', // Default orientation
        type: 'single'
      });
    }
    
    return doors;
  }

  /**
   * Calculate total area
   */
  private calculateTotalArea(rooms: RoomSpecification[]): number {
    return rooms.reduce((total, room) => total + room.area, 0);
  }

  /**
   * Calculate bounding box
   */
  private calculateBoundingBox(rooms: RoomSpecification[]): { min: Point2D, max: Point2D } {
    if (rooms.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }
    
    // For now, use first room dimensions
    const room = rooms[0];
    return {
      min: { x: 0, y: 0 },
      max: { x: room.dimensions.width, y: room.dimensions.height }
    };
  }

  /**
   * Calculate parsing confidence
   */
  private calculateConfidence(rooms: RoomSpecification[], textItems: ExtractedText[]): number {
    if (rooms.length === 0) return 0;
    
    const avgTextConfidence = textItems.reduce((sum, item) => sum + item.confidence, 0) / textItems.length;
    const roomConfidence = rooms.length > 0 ? 0.8 : 0.2;
    
    return (avgTextConfidence + roomConfidence) / 2;
  }

  /**
   * Convert image to canvas
   */
  private async imageToCanvas(image: File | HTMLImageElement): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    if (image instanceof File) {
      const img = new Image();
      const url = URL.createObjectURL(image);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      URL.revokeObjectURL(url);
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    }
    
    return canvas;
  }

  /**
   * Enhance image contrast
   */
  private enhanceImageContrast(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const factor = 1.5; // Contrast factor
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, (data[i] - 128) * factor + 128);
      data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128);
      data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(p1: Point2D, p2: Point2D): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Cleanup OCR worker
   */
  async cleanup(): Promise<void> {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

// Export singleton instance
export const drawingParser = DrawingParser.getInstance();