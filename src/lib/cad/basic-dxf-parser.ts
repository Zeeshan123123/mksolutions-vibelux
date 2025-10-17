// Basic DXF parser for room boundaries
export interface DXFEntity {
  type: 'LINE' | 'POLYLINE' | 'CIRCLE' | 'ARC';
  layer?: string;
  color?: number;
  data: any;
}

export interface DXFBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export class BasicDXFParser {
  private entities: DXFEntity[] = [];
  
  async parse(file: File): Promise<{ entities: DXFEntity[], bounds: DXFBounds }> {
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    
    let i = 0;
    while (i < lines.length) {
      const code = lines[i].trim();
      const value = lines[i + 1]?.trim();
      
      if (code === '0' && value === 'LINE') {
        const line = this.parseLine(lines, i);
        if (line) this.entities.push(line);
      } else if (code === '0' && value === 'POLYLINE') {
        const polyline = this.parsePolyline(lines, i);
        if (polyline) this.entities.push(polyline);
      } else if (code === '0' && value === 'CIRCLE') {
        const circle = this.parseCircle(lines, i);
        if (circle) this.entities.push(circle);
      }
      
      i += 2;
    }
    
    const bounds = this.calculateBounds();
    return { entities: this.entities, bounds };
  }
  
  private parseLine(lines: string[], startIndex: number): DXFEntity | null {
    const entity: DXFEntity = {
      type: 'LINE',
      data: { x1: 0, y1: 0, x2: 0, y2: 0 }
    };
    
    let i = startIndex;
    while (i < lines.length && lines[i].trim() !== '0') {
      const code = parseInt(lines[i].trim());
      const value = lines[i + 1]?.trim();
      
      switch (code) {
        case 8: // Layer name
          entity.layer = value;
          break;
        case 10: // Start point X
          entity.data.x1 = parseFloat(value);
          break;
        case 20: // Start point Y
          entity.data.y1 = parseFloat(value);
          break;
        case 11: // End point X
          entity.data.x2 = parseFloat(value);
          break;
        case 21: // End point Y
          entity.data.y2 = parseFloat(value);
          break;
        case 62: // Color
          entity.color = parseInt(value);
          break;
      }
      i += 2;
    }
    
    return entity;
  }
  
  private parsePolyline(lines: string[], startIndex: number): DXFEntity | null {
    const entity: DXFEntity = {
      type: 'POLYLINE',
      data: { vertices: [] }
    };
    
    let i = startIndex;
    let inVertex = false;
    let currentVertex = { x: 0, y: 0 };
    
    while (i < lines.length) {
      const code = lines[i].trim();
      const value = lines[i + 1]?.trim();
      
      if (code === '0' && value === 'VERTEX') {
        inVertex = true;
        if (currentVertex.x !== 0 || currentVertex.y !== 0) {
          entity.data.vertices.push({ ...currentVertex });
        }
        currentVertex = { x: 0, y: 0 };
      } else if (code === '0' && value === 'SEQEND') {
        if (currentVertex.x !== 0 || currentVertex.y !== 0) {
          entity.data.vertices.push({ ...currentVertex });
        }
        break;
      } else if (inVertex) {
        const codeNum = parseInt(code);
        switch (codeNum) {
          case 10: // X coordinate
            currentVertex.x = parseFloat(value);
            break;
          case 20: // Y coordinate
            currentVertex.y = parseFloat(value);
            break;
        }
      } else {
        const codeNum = parseInt(code);
        switch (codeNum) {
          case 8: // Layer name
            entity.layer = value;
            break;
          case 62: // Color
            entity.color = parseInt(value);
            break;
        }
      }
      
      i += 2;
    }
    
    return entity.data.vertices.length > 0 ? entity : null;
  }
  
  private parseCircle(lines: string[], startIndex: number): DXFEntity | null {
    const entity: DXFEntity = {
      type: 'CIRCLE',
      data: { centerX: 0, centerY: 0, radius: 0 }
    };
    
    let i = startIndex;
    while (i < lines.length && lines[i].trim() !== '0') {
      const code = parseInt(lines[i].trim());
      const value = lines[i + 1]?.trim();
      
      switch (code) {
        case 8: // Layer name
          entity.layer = value;
          break;
        case 10: // Center X
          entity.data.centerX = parseFloat(value);
          break;
        case 20: // Center Y
          entity.data.centerY = parseFloat(value);
          break;
        case 40: // Radius
          entity.data.radius = parseFloat(value);
          break;
        case 62: // Color
          entity.color = parseInt(value);
          break;
      }
      i += 2;
    }
    
    return entity;
  }
  
  private calculateBounds(): DXFBounds {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    this.entities.forEach(entity => {
      if (entity.type === 'LINE') {
        minX = Math.min(minX, entity.data.x1, entity.data.x2);
        minY = Math.min(minY, entity.data.y1, entity.data.y2);
        maxX = Math.max(maxX, entity.data.x1, entity.data.x2);
        maxY = Math.max(maxY, entity.data.y1, entity.data.y2);
      } else if (entity.type === 'POLYLINE') {
        entity.data.vertices.forEach((v: any) => {
          minX = Math.min(minX, v.x);
          minY = Math.min(minY, v.y);
          maxX = Math.max(maxX, v.x);
          maxY = Math.max(maxY, v.y);
        });
      } else if (entity.type === 'CIRCLE') {
        minX = Math.min(minX, entity.data.centerX - entity.data.radius);
        minY = Math.min(minY, entity.data.centerY - entity.data.radius);
        maxX = Math.max(maxX, entity.data.centerX + entity.data.radius);
        maxY = Math.max(maxY, entity.data.centerY + entity.data.radius);
      }
    });
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
  // Convert DXF entities to room boundaries
  extractRoomBoundaries(): { width: number, height: number, walls: any[] } {
    const bounds = this.calculateBounds();
    
    // Find perimeter walls (typically on WALL or 0 layer)
    const wallEntities = this.entities.filter(e => 
      !e.layer || e.layer === '0' || e.layer.toUpperCase().includes('WALL')
    );
    
    // Convert to normalized coordinates (0,0 origin)
    const walls = wallEntities.map(entity => {
      if (entity.type === 'LINE') {
        return {
          type: 'wall',
          x1: entity.data.x1 - bounds.minX,
          y1: entity.data.y1 - bounds.minY,
          x2: entity.data.x2 - bounds.minX,
          y2: entity.data.y2 - bounds.minY
        };
      }
      return null;
    }).filter(Boolean);
    
    return {
      width: bounds.width,
      height: bounds.height,
      walls
    };
  }
}