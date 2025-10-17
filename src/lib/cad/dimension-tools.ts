/**
 * Professional Dimension Tools for CAD
 * Supports aligned, linear, angular, radial, and chain dimensions
 */

import { GridService } from './grid-service';

export type DimensionType = 'linear' | 'aligned' | 'angular' | 'radial' | 'diameter' | 'ordinate';
export type DimensionStyle = 'architectural' | 'engineering' | 'decimal';

export interface DimensionPoint {
  x: number;
  y: number;
}

export interface DimensionStyle {
  name: string;
  textHeight: number;
  arrowSize: number;
  extensionLineOffset: number;
  extensionLineExtension: number;
  dimensionLineSpacing: number;
  textOffset: number;
  precision: number;
  suffix: string;
  prefix: string;
  suppressLeadingZeros: boolean;
  suppressTrailingZeros: boolean;
  textColor: string;
  lineColor: string;
  arrowType: 'closed' | 'open' | 'dot' | 'tick' | 'oblique';
}

export interface Dimension {
  id: string;
  type: DimensionType;
  points: DimensionPoint[];
  value: number;
  text: string;
  style: DimensionStyle;
  layer: string;
  visible: boolean;
  locked: boolean;
}

export class DimensionTools {
  private gridService: GridService;
  private currentStyle: DimensionStyle;
  private dimensions: Map<string, Dimension> = new Map();

  // Predefined dimension styles
  static readonly STYLES = {
    ARCHITECTURAL: {
      name: 'Architectural',
      textHeight: 3,
      arrowSize: 2.5,
      extensionLineOffset: 1,
      extensionLineExtension: 2,
      dimensionLineSpacing: 8,
      textOffset: 1,
      precision: 3,
      suffix: '"',
      prefix: '',
      suppressLeadingZeros: true,
      suppressTrailingZeros: true,
      textColor: '#FFFFFF',
      lineColor: '#00FFFF',
      arrowType: 'tick' as const
    },
    ENGINEERING: {
      name: 'Engineering',
      textHeight: 0.125,
      arrowSize: 0.125,
      extensionLineOffset: 0.0625,
      extensionLineExtension: 0.125,
      dimensionLineSpacing: 0.375,
      textOffset: 0.0625,
      precision: 2,
      suffix: '',
      prefix: '',
      suppressLeadingZeros: false,
      suppressTrailingZeros: false,
      textColor: '#FFFFFF',
      lineColor: '#00FFFF',
      arrowType: 'closed' as const
    },
    DECIMAL: {
      name: 'Decimal',
      textHeight: 2.5,
      arrowSize: 2.5,
      extensionLineOffset: 0.625,
      extensionLineExtension: 1.25,
      dimensionLineSpacing: 10,
      textOffset: 0.625,
      precision: 2,
      suffix: '',
      prefix: '',
      suppressLeadingZeros: false,
      suppressTrailingZeros: true,
      textColor: '#FFFFFF',
      lineColor: '#00FFFF',
      arrowType: 'closed' as const
    }
  };

  constructor(gridService: GridService) {
    this.gridService = gridService;
    this.currentStyle = DimensionTools.STYLES.ARCHITECTURAL;
  }

  /**
   * Create a linear dimension (horizontal or vertical)
   */
  createLinearDimension(
    point1: DimensionPoint,
    point2: DimensionPoint,
    offset: number,
    isVertical: boolean = false
  ): Dimension {
    const id = `dim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const distance = isVertical 
      ? Math.abs(point2.y - point1.y)
      : Math.abs(point2.x - point1.x);

    const dimension: Dimension = {
      id,
      type: 'linear',
      points: [point1, point2, { x: offset, y: offset }], // Third point is offset
      value: distance,
      text: this.formatDimensionText(distance),
      style: { ...this.currentStyle },
      layer: 'G-ANNO-DIMS',
      visible: true,
      locked: false
    };

    this.dimensions.set(id, dimension);
    return dimension;
  }

  /**
   * Create an aligned dimension (at any angle)
   */
  createAlignedDimension(
    point1: DimensionPoint,
    point2: DimensionPoint,
    offset: number
  ): Dimension {
    const id = `dim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const dimension: Dimension = {
      id,
      type: 'aligned',
      points: [point1, point2, { x: offset, y: offset }],
      value: distance,
      text: this.formatDimensionText(distance),
      style: { ...this.currentStyle },
      layer: 'G-ANNO-DIMS',
      visible: true,
      locked: false
    };

    this.dimensions.set(id, dimension);
    return dimension;
  }

  /**
   * Create an angular dimension
   */
  createAngularDimension(
    center: DimensionPoint,
    point1: DimensionPoint,
    point2: DimensionPoint,
    radius: number
  ): Dimension {
    const id = `dim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const angle1 = Math.atan2(point1.y - center.y, point1.x - center.x);
    const angle2 = Math.atan2(point2.y - center.y, point2.x - center.x);
    let angle = (angle2 - angle1) * (180 / Math.PI);
    
    if (angle < 0) angle += 360;
    if (angle > 180) angle = 360 - angle;

    const dimension: Dimension = {
      id,
      type: 'angular',
      points: [center, point1, point2, { x: radius, y: 0 }],
      value: angle,
      text: `${angle.toFixed(this.currentStyle.precision)}°`,
      style: { ...this.currentStyle },
      layer: 'G-ANNO-DIMS',
      visible: true,
      locked: false
    };

    this.dimensions.set(id, dimension);
    return dimension;
  }

  /**
   * Create a radial dimension
   */
  createRadialDimension(
    center: DimensionPoint,
    point: DimensionPoint
  ): Dimension {
    const id = `dim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const radius = Math.sqrt(dx * dx + dy * dy);

    const dimension: Dimension = {
      id,
      type: 'radial',
      points: [center, point],
      value: radius,
      text: `R${this.formatDimensionText(radius)}`,
      style: { ...this.currentStyle },
      layer: 'G-ANNO-DIMS',
      visible: true,
      locked: false
    };

    this.dimensions.set(id, dimension);
    return dimension;
  }

  /**
   * Create a diameter dimension
   */
  createDiameterDimension(
    center: DimensionPoint,
    point1: DimensionPoint,
    point2: DimensionPoint
  ): Dimension {
    const id = `dim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const diameter = Math.sqrt(dx * dx + dy * dy);

    const dimension: Dimension = {
      id,
      type: 'diameter',
      points: [center, point1, point2],
      value: diameter,
      text: `⌀${this.formatDimensionText(diameter)}`,
      style: { ...this.currentStyle },
      layer: 'G-ANNO-DIMS',
      visible: true,
      locked: false
    };

    this.dimensions.set(id, dimension);
    return dimension;
  }

  /**
   * Create chain dimensions
   */
  createChainDimensions(
    points: DimensionPoint[],
    offset: number,
    isVertical: boolean = false
  ): Dimension[] {
    const dimensions: Dimension[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const dim = this.createLinearDimension(
        points[i],
        points[i + 1],
        offset,
        isVertical
      );
      dimensions.push(dim);
    }

    // Add overall dimension
    if (points.length > 2) {
      const overall = this.createLinearDimension(
        points[0],
        points[points.length - 1],
        offset + this.currentStyle.dimensionLineSpacing,
        isVertical
      );
      dimensions.push(overall);
    }

    return dimensions;
  }

  /**
   * Format dimension text based on current style
   */
  private formatDimensionText(value: number): string {
    const { precision, prefix, suffix, suppressLeadingZeros, suppressTrailingZeros } = this.currentStyle;
    
    // Use grid service for proper formatting
    let text = this.gridService.formatDimension(value, precision);
    
    // Apply prefix/suffix
    text = prefix + text + suffix;
    
    return text;
  }

  /**
   * Render dimension on canvas
   */
  renderDimension(ctx: CanvasRenderingContext2D, dimension: Dimension): void {
    if (!dimension.visible) return;

    ctx.save();
    
    // Set styles
    ctx.strokeStyle = dimension.style.lineColor;
    ctx.fillStyle = dimension.style.textColor;
    ctx.lineWidth = 0.5;
    ctx.font = `${dimension.style.textHeight}px Arial`;
    
    switch (dimension.type) {
      case 'linear':
        this.renderLinearDimension(ctx, dimension);
        break;
      case 'aligned':
        this.renderAlignedDimension(ctx, dimension);
        break;
      case 'angular':
        this.renderAngularDimension(ctx, dimension);
        break;
      case 'radial':
        this.renderRadialDimension(ctx, dimension);
        break;
      case 'diameter':
        this.renderDiameterDimension(ctx, dimension);
        break;
    }
    
    ctx.restore();
  }

  /**
   * Render linear dimension
   */
  private renderLinearDimension(ctx: CanvasRenderingContext2D, dimension: Dimension): void {
    const [p1, p2, offsetPoint] = dimension.points;
    const isVertical = Math.abs(p2.x - p1.x) < Math.abs(p2.y - p1.y);
    
    // Calculate dimension line position
    const dimLineY = isVertical ? offsetPoint.x : p1.y + offsetPoint.y;
    const dimLineX = isVertical ? p1.x + offsetPoint.x : offsetPoint.x;
    
    // Draw extension lines
    ctx.beginPath();
    if (isVertical) {
      // Vertical dimension
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(dimLineX + dimension.style.extensionLineExtension, p1.y);
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(dimLineX + dimension.style.extensionLineExtension, p2.y);
    } else {
      // Horizontal dimension
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p1.x, dimLineY + dimension.style.extensionLineExtension);
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x, dimLineY + dimension.style.extensionLineExtension);
    }
    ctx.stroke();
    
    // Draw dimension line
    ctx.beginPath();
    if (isVertical) {
      ctx.moveTo(dimLineX, p1.y);
      ctx.lineTo(dimLineX, p2.y);
    } else {
      ctx.moveTo(p1.x, dimLineY);
      ctx.lineTo(p2.x, dimLineY);
    }
    ctx.stroke();
    
    // Draw arrows
    this.drawArrow(ctx, dimension.style, isVertical ? dimLineX : p1.x, isVertical ? p1.y : dimLineY, isVertical ? 90 : 0);
    this.drawArrow(ctx, dimension.style, isVertical ? dimLineX : p2.x, isVertical ? p2.y : dimLineY, isVertical ? -90 : 180);
    
    // Draw text
    const textWidth = ctx.measureText(dimension.text).width;
    const textX = isVertical ? dimLineX + dimension.style.textOffset : (p1.x + p2.x) / 2 - textWidth / 2;
    const textY = isVertical ? (p1.y + p2.y) / 2 : dimLineY - dimension.style.textOffset;
    
    // Clear background for text
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(textX - 2, textY - dimension.style.textHeight, textWidth + 4, dimension.style.textHeight + 4);
    
    // Draw text
    ctx.fillStyle = dimension.style.textColor;
    ctx.fillText(dimension.text, textX, textY);
  }

  /**
   * Draw dimension arrow
   */
  private drawArrow(ctx: CanvasRenderingContext2D, style: DimensionStyle, x: number, y: number, angle: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    
    switch (style.arrowType) {
      case 'closed':
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-style.arrowSize, -style.arrowSize / 2);
        ctx.lineTo(-style.arrowSize, style.arrowSize / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'tick':
        ctx.beginPath();
        ctx.moveTo(-style.arrowSize / 2, -style.arrowSize / 2);
        ctx.lineTo(style.arrowSize / 2, style.arrowSize / 2);
        ctx.stroke();
        break;
      case 'dot':
        ctx.beginPath();
        ctx.arc(0, 0, style.arrowSize / 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }

  /**
   * Set dimension style
   */
  setStyle(style: DimensionStyle): void {
    this.currentStyle = style;
  }

  /**
   * Get all dimensions
   */
  getAllDimensions(): Dimension[] {
    return Array.from(this.dimensions.values());
  }

  /**
   * Delete dimension
   */
  deleteDimension(id: string): void {
    this.dimensions.delete(id);
  }

  /**
   * Clear all dimensions
   */
  clearAll(): void {
    this.dimensions.clear();
  }
}

export default DimensionTools;