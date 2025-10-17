/**
 * Professional Grid Service with Architectural Snap Increments
 * Provides industry-standard grid snapping for CAD operations
 */

export interface GridSettings {
  visible: boolean;
  snapEnabled: boolean;
  snapIncrement: number;
  majorGridLines: number;
  gridStyle: 'dots' | 'lines' | 'crosses';
  gridColor: string;
  majorGridColor: string;
  unit: 'imperial' | 'metric';
}

export interface SnapPoint {
  x: number;
  y: number;
  type: 'grid' | 'endpoint' | 'midpoint' | 'center' | 'intersection' | 'perpendicular';
}

export class GridService {
  private settings: GridSettings = {
    visible: true,
    snapEnabled: true,
    snapIncrement: 0.25, // 1/4" default
    majorGridLines: 12, // Major grid every 12 units (1 foot)
    gridStyle: 'dots',
    gridColor: '#333333',
    majorGridColor: '#555555',
    unit: 'imperial'
  };

  // Standard architectural increments
  static readonly ARCHITECTURAL_INCREMENTS = [
    { label: '1\'', value: 12, fraction: '12"' },
    { label: '6"', value: 6, fraction: '1/2\'' },
    { label: '3"', value: 3, fraction: '1/4\'' },
    { label: '1"', value: 1, fraction: '1"' },
    { label: '1/2"', value: 0.5, fraction: '1/2"' },
    { label: '1/4"', value: 0.25, fraction: '1/4"' },
    { label: '1/8"', value: 0.125, fraction: '1/8"' },
    { label: '1/16"', value: 0.0625, fraction: '1/16"' },
    { label: '1/32"', value: 0.03125, fraction: '1/32"' }
  ];

  static readonly METRIC_INCREMENTS = [
    { label: '1m', value: 1000 },
    { label: '500mm', value: 500 },
    { label: '100mm', value: 100 },
    { label: '50mm', value: 50 },
    { label: '25mm', value: 25 },
    { label: '10mm', value: 10 },
    { label: '5mm', value: 5 },
    { label: '1mm', value: 1 }
  ];

  constructor(initialSettings?: Partial<GridSettings>) {
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  /**
   * Snap a point to the nearest grid increment
   */
  snapToGrid(point: { x: number; y: number }): SnapPoint {
    if (!this.settings.snapEnabled) {
      return { ...point, type: 'grid' };
    }

    const increment = this.settings.snapIncrement;
    return {
      x: Math.round(point.x / increment) * increment,
      y: Math.round(point.y / increment) * increment,
      type: 'grid'
    };
  }

  /**
   * Get object snap points for professional CAD operations
   */
  getObjectSnapPoints(
    objects: any[], 
    cursor: { x: number; y: number }, 
    snapRadius: number = 10
  ): SnapPoint[] {
    const snapPoints: SnapPoint[] = [];

    objects.forEach(obj => {
      // Endpoint snaps
      if (obj.type === 'line') {
        snapPoints.push(
          { x: obj.start.x, y: obj.start.y, type: 'endpoint' },
          { x: obj.end.x, y: obj.end.y, type: 'endpoint' }
        );
        
        // Midpoint snap
        snapPoints.push({
          x: (obj.start.x + obj.end.x) / 2,
          y: (obj.start.y + obj.end.y) / 2,
          type: 'midpoint'
        });
      }

      // Center snaps for circles/fixtures
      if (obj.type === 'circle' || obj.type === 'fixture') {
        snapPoints.push({
          x: obj.center.x,
          y: obj.center.y,
          type: 'center'
        });
      }
    });

    // Filter by distance to cursor
    return snapPoints.filter(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - cursor.x, 2) + 
        Math.pow(point.y - cursor.y, 2)
      );
      return distance <= snapRadius;
    });
  }

  /**
   * Render grid on canvas
   */
  renderGrid(
    ctx: CanvasRenderingContext2D, 
    viewport: { x: number; y: number; width: number; height: number; zoom: number }
  ) {
    if (!this.settings.visible) return;

    const { snapIncrement, majorGridLines, gridStyle, gridColor, majorGridColor } = this.settings;
    
    ctx.save();
    
    // Calculate grid bounds
    const startX = Math.floor(viewport.x / snapIncrement) * snapIncrement;
    const endX = viewport.x + viewport.width / viewport.zoom;
    const startY = Math.floor(viewport.y / snapIncrement) * snapIncrement;
    const endY = viewport.y + viewport.height / viewport.zoom;

    // Draw grid
    for (let x = startX; x <= endX; x += snapIncrement) {
      const isMajor = x % (snapIncrement * majorGridLines) === 0;
      ctx.strokeStyle = isMajor ? majorGridColor : gridColor;
      ctx.lineWidth = isMajor ? 0.5 : 0.25;
      
      if (gridStyle === 'lines') {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      } else if (gridStyle === 'dots') {
        for (let y = startY; y <= endY; y += snapIncrement) {
          ctx.fillStyle = isMajor ? majorGridColor : gridColor;
          ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }
    }

    if (gridStyle === 'lines') {
      for (let y = startY; y <= endY; y += snapIncrement) {
        const isMajor = y % (snapIncrement * majorGridLines) === 0;
        ctx.strokeStyle = isMajor ? majorGridColor : gridColor;
        ctx.lineWidth = isMajor ? 0.5 : 0.25;
        
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Update grid settings
   */
  updateSettings(settings: Partial<GridSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): GridSettings {
    return { ...this.settings };
  }

  /**
   * Convert between units
   */
  convertUnits(value: number, from: 'imperial' | 'metric', to: 'imperial' | 'metric'): number {
    if (from === to) return value;
    
    if (from === 'imperial' && to === 'metric') {
      return value * 25.4; // inches to mm
    } else {
      return value / 25.4; // mm to inches
    }
  }

  /**
   * Format dimension text
   */
  formatDimension(value: number, precision: number = 3): string {
    if (this.settings.unit === 'imperial') {
      const feet = Math.floor(value / 12);
      const inches = value % 12;
      
      if (feet > 0 && inches > 0) {
        return `${feet}'-${this.formatInches(inches, precision)}"`;
      } else if (feet > 0) {
        return `${feet}'`;
      } else {
        return `${this.formatInches(inches, precision)}"`;
      }
    } else {
      // Metric
      if (value >= 1000) {
        return `${(value / 1000).toFixed(precision)}m`;
      } else {
        return `${value.toFixed(0)}mm`;
      }
    }
  }

  private formatInches(inches: number, precision: number): string {
    // Convert to fraction if close to standard fraction
    const fractions = [
      { value: 0.0625, display: '1/16' },
      { value: 0.125, display: '1/8' },
      { value: 0.1875, display: '3/16' },
      { value: 0.25, display: '1/4' },
      { value: 0.3125, display: '5/16' },
      { value: 0.375, display: '3/8' },
      { value: 0.4375, display: '7/16' },
      { value: 0.5, display: '1/2' },
      { value: 0.5625, display: '9/16' },
      { value: 0.625, display: '5/8' },
      { value: 0.6875, display: '11/16' },
      { value: 0.75, display: '3/4' },
      { value: 0.8125, display: '13/16' },
      { value: 0.875, display: '7/8' },
      { value: 0.9375, display: '15/16' }
    ];

    const whole = Math.floor(inches);
    const fraction = inches - whole;
    
    // Find closest fraction
    let closestFraction = null;
    let minDiff = Infinity;
    
    fractions.forEach(f => {
      const diff = Math.abs(fraction - f.value);
      if (diff < minDiff && diff < 0.01) {
        minDiff = diff;
        closestFraction = f;
      }
    });

    if (closestFraction) {
      return whole > 0 ? `${whole} ${closestFraction.display}` : closestFraction.display;
    } else {
      return inches.toFixed(precision);
    }
  }
}

export default GridService;