/**
 * Advanced Object Snap System
 * Professional-grade snapping with intelligent inference and constraint solving
 */

export interface SnapPoint {
  x: number;
  y: number;
  z?: number;
  type: ObjectSnapType;
  entity: any;
  priority: number;
  tooltip: string;
  inferredFrom?: SnapPoint[];
}

export enum ObjectSnapType {
  // Basic snaps
  ENDPOINT = 'endpoint',
  MIDPOINT = 'midpoint',
  CENTER = 'center',
  NODE = 'node',
  QUADRANT = 'quadrant',
  
  // Intersection snaps
  INTERSECTION = 'intersection',
  APPARENT_INTERSECTION = 'apparent_intersection',
  EXTENDED_INTERSECTION = 'extended_intersection',
  
  // Geometric snaps
  PERPENDICULAR = 'perpendicular',
  TANGENT = 'tangent',
  NEAREST = 'nearest',
  PARALLEL = 'parallel',
  EXTENSION = 'extension',
  
  // Advanced snaps
  INSERT = 'insert',
  GRID = 'grid',
  BEARING = 'bearing',
  MULTIPLE = 'multiple',
  
  // Architectural snaps
  WALL_CENTERLINE = 'wall_centerline',
  DOOR_CENTER = 'door_center',
  WINDOW_CENTER = 'window_center',
  COLUMN_CENTER = 'column_center',
  
  // Custom inference
  INFERRED_INTERSECTION = 'inferred_intersection',
  PROJECTED_POINT = 'projected_point',
  CONSTRAINT_POINT = 'constraint_point'
}

export interface SnapSettings {
  enabled: Set<ObjectSnapType>;
  snapRadius: number;
  autoSnap: boolean;
  showTooltips: boolean;
  polarTracking: boolean;
  polarAngles: number[];
  objectTracking: boolean;
  inferConstraints: boolean;
  architecturalMode: boolean;
}

export class AdvancedObjectSnaps {
  private settings: SnapSettings;
  private entities: Map<string, any> = new Map();
  private snapCache: Map<string, SnapPoint[]> = new Map();
  private lastSnapPoint: SnapPoint | null = null;
  private trackingPoints: SnapPoint[] = [];
  
  constructor() {
    this.settings = {
      enabled: new Set([
        ObjectSnapType.ENDPOINT,
        ObjectSnapType.MIDPOINT,
        ObjectSnapType.CENTER,
        ObjectSnapType.INTERSECTION,
        ObjectSnapType.PERPENDICULAR,
        ObjectSnapType.NEAREST
      ]),
      snapRadius: 10,
      autoSnap: true,
      showTooltips: true,
      polarTracking: true,
      polarAngles: [0, 15, 30, 45, 60, 90, 120, 135, 150, 180],
      objectTracking: true,
      inferConstraints: true,
      architecturalMode: false
    };
  }

  /**
   * Find all snap points near cursor position
   */
  findSnapPoints(
    cursorX: number, 
    cursorY: number, 
    entities: any[],
    excludeTypes: ObjectSnapType[] = []
  ): SnapPoint[] {
    const snapPoints: SnapPoint[] = [];
    const snapRadius = this.settings.snapRadius;

    // Clear cache if entities changed
    this.updateEntityCache(entities);

    for (const entity of entities) {
      const entitySnaps = this.getEntitySnapPoints(entity, excludeTypes);
      
      // Filter by distance
      const nearbySnaps = entitySnaps.filter(snap => {
        const distance = Math.sqrt(
          Math.pow(snap.x - cursorX, 2) + Math.pow(snap.y - cursorY, 2)
        );
        return distance <= snapRadius;
      });

      snapPoints.push(...nearbySnaps);
    }

    // Add inferred snap points
    if (this.settings.inferConstraints) {
      snapPoints.push(...this.inferSnapPoints(cursorX, cursorY, snapPoints));
    }

    // Add polar tracking points
    if (this.settings.polarTracking && this.lastSnapPoint) {
      snapPoints.push(...this.getPolarTrackingPoints(cursorX, cursorY));
    }

    // Add object tracking points
    if (this.settings.objectTracking) {
      snapPoints.push(...this.getObjectTrackingPoints(cursorX, cursorY, entities));
    }

    // Sort by priority and distance
    return this.prioritizeSnapPoints(snapPoints, cursorX, cursorY);
  }

  /**
   * Get snap points for a specific entity
   */
  private getEntitySnapPoints(entity: any, excludeTypes: ObjectSnapType[]): SnapPoint[] {
    const cacheKey = `${entity.id}_${entity.lastModified || Date.now()}`;
    
    if (this.snapCache.has(cacheKey)) {
      return this.snapCache.get(cacheKey)!.filter(
        snap => !excludeTypes.includes(snap.type)
      );
    }

    const snapPoints: SnapPoint[] = [];

    switch (entity.type) {
      case 'line':
        snapPoints.push(...this.getLineSnapPoints(entity));
        break;
      case 'circle':
        snapPoints.push(...this.getCircleSnapPoints(entity));
        break;
      case 'arc':
        snapPoints.push(...this.getArcSnapPoints(entity));
        break;
      case 'polyline':
        snapPoints.push(...this.getPolylineSnapPoints(entity));
        break;
      case 'rectangle':
        snapPoints.push(...this.getRectangleSnapPoints(entity));
        break;
      case 'text':
        snapPoints.push(...this.getTextSnapPoints(entity));
        break;
      case 'block':
        snapPoints.push(...this.getBlockSnapPoints(entity));
        break;
      // Architectural entities
      case 'wall':
        snapPoints.push(...this.getWallSnapPoints(entity));
        break;
      case 'door':
        snapPoints.push(...this.getDoorSnapPoints(entity));
        break;
      case 'window':
        snapPoints.push(...this.getWindowSnapPoints(entity));
        break;
    }

    // Cache the results
    this.snapCache.set(cacheKey, snapPoints);
    
    return snapPoints.filter(snap => !excludeTypes.includes(snap.type));
  }

  /**
   * Get snap points for line entities
   */
  private getLineSnapPoints(line: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Endpoints
    if (this.settings.enabled.has(ObjectSnapType.ENDPOINT)) {
      points.push({
        x: line.start.x,
        y: line.start.y,
        type: ObjectSnapType.ENDPOINT,
        entity: line,
        priority: 10,
        tooltip: 'Endpoint'
      });
      points.push({
        x: line.end.x,
        y: line.end.y,
        type: ObjectSnapType.ENDPOINT,
        entity: line,
        priority: 10,
        tooltip: 'Endpoint'
      });
    }

    // Midpoint
    if (this.settings.enabled.has(ObjectSnapType.MIDPOINT)) {
      points.push({
        x: (line.start.x + line.end.x) / 2,
        y: (line.start.y + line.end.y) / 2,
        type: ObjectSnapType.MIDPOINT,
        entity: line,
        priority: 8,
        tooltip: 'Midpoint'
      });
    }

    // Extension points (beyond line ends)
    if (this.settings.enabled.has(ObjectSnapType.EXTENSION)) {
      const length = Math.sqrt(
        Math.pow(line.end.x - line.start.x, 2) + Math.pow(line.end.y - line.start.y, 2)
      );
      const unitX = (line.end.x - line.start.x) / length;
      const unitY = (line.end.y - line.start.y) / length;
      const extensionLength = 50; // pixels

      points.push({
        x: line.start.x - unitX * extensionLength,
        y: line.start.y - unitY * extensionLength,
        type: ObjectSnapType.EXTENSION,
        entity: line,
        priority: 5,
        tooltip: 'Extension'
      });
      points.push({
        x: line.end.x + unitX * extensionLength,
        y: line.end.y + unitY * extensionLength,
        type: ObjectSnapType.EXTENSION,
        entity: line,
        priority: 5,
        tooltip: 'Extension'
      });
    }

    return points;
  }

  /**
   * Get snap points for circle entities
   */
  private getCircleSnapPoints(circle: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Center
    if (this.settings.enabled.has(ObjectSnapType.CENTER)) {
      points.push({
        x: circle.center.x,
        y: circle.center.y,
        type: ObjectSnapType.CENTER,
        entity: circle,
        priority: 9,
        tooltip: 'Center'
      });
    }

    // Quadrant points
    if (this.settings.enabled.has(ObjectSnapType.QUADRANT)) {
      const quadrants = [
        { x: circle.center.x + circle.radius, y: circle.center.y, tooltip: 'Quadrant (0°)' },
        { x: circle.center.x, y: circle.center.y + circle.radius, tooltip: 'Quadrant (90°)' },
        { x: circle.center.x - circle.radius, y: circle.center.y, tooltip: 'Quadrant (180°)' },
        { x: circle.center.x, y: circle.center.y - circle.radius, tooltip: 'Quadrant (270°)' }
      ];

      quadrants.forEach(quad => {
        points.push({
          x: quad.x,
          y: quad.y,
          type: ObjectSnapType.QUADRANT,
          entity: circle,
          priority: 7,
          tooltip: quad.tooltip
        });
      });
    }

    return points;
  }

  /**
   * Get snap points for wall entities (architectural)
   */
  private getWallSnapPoints(wall: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Wall endpoints
    if (this.settings.enabled.has(ObjectSnapType.ENDPOINT)) {
      points.push(
        {
          x: wall.start.x,
          y: wall.start.y,
          type: ObjectSnapType.ENDPOINT,
          entity: wall,
          priority: 10,
          tooltip: 'Wall End'
        },
        {
          x: wall.end.x,
          y: wall.end.y,
          type: ObjectSnapType.ENDPOINT,
          entity: wall,
          priority: 10,
          tooltip: 'Wall End'
        }
      );
    }

    // Wall centerline
    if (this.settings.enabled.has(ObjectSnapType.WALL_CENTERLINE)) {
      const centerlinePoints = this.calculateWallCenterline(wall);
      centerlinePoints.forEach(point => {
        points.push({
          x: point.x,
          y: point.y,
          type: ObjectSnapType.WALL_CENTERLINE,
          entity: wall,
          priority: 8,
          tooltip: 'Wall Centerline'
        });
      });
    }

    return points;
  }

  /**
   * Infer snap points from geometric relationships
   */
  private inferSnapPoints(
    cursorX: number,
    cursorY: number,
    existingSnaps: SnapPoint[]
  ): SnapPoint[] {
    const inferred: SnapPoint[] = [];

    // Infer intersections from extensions
    const extensionSnaps = existingSnaps.filter(s => s.type === ObjectSnapType.EXTENSION);
    if (extensionSnaps.length >= 2) {
      for (let i = 0; i < extensionSnaps.length; i++) {
        for (let j = i + 1; j < extensionSnaps.length; j++) {
          const intersection = this.calculateLineIntersection(
            extensionSnaps[i],
            extensionSnaps[j]
          );
          
          if (intersection) {
            inferred.push({
              x: intersection.x,
              y: intersection.y,
              type: ObjectSnapType.INFERRED_INTERSECTION,
              entity: null,
              priority: 6,
              tooltip: 'Inferred Intersection',
              inferredFrom: [extensionSnaps[i], extensionSnaps[j]]
            });
          }
        }
      }
    }

    // Perpendicular projections
    if (this.settings.enabled.has(ObjectSnapType.PERPENDICULAR)) {
      existingSnaps.forEach(snap => {
        if (snap.entity?.type === 'line') {
          const projection = this.projectPointOntoLine(
            { x: cursorX, y: cursorY },
            snap.entity
          );
          
          if (projection) {
            inferred.push({
              x: projection.x,
              y: projection.y,
              type: ObjectSnapType.PERPENDICULAR,
              entity: snap.entity,
              priority: 7,
              tooltip: 'Perpendicular'
            });
          }
        }
      });
    }

    return inferred;
  }

  /**
   * Get polar tracking points
   */
  private getPolarTrackingPoints(cursorX: number, cursorY: number): SnapPoint[] {
    if (!this.lastSnapPoint) return [];

    const points: SnapPoint[] = [];
    const basePoint = this.lastSnapPoint;
    const distance = Math.sqrt(
      Math.pow(cursorX - basePoint.x, 2) + Math.pow(cursorY - basePoint.y, 2)
    );

    this.settings.polarAngles.forEach(angle => {
      const radians = (angle * Math.PI) / 180;
      const x = basePoint.x + distance * Math.cos(radians);
      const y = basePoint.y + distance * Math.sin(radians);

      points.push({
        x,
        y,
        type: ObjectSnapType.BEARING,
        entity: null,
        priority: 4,
        tooltip: `Polar: ${angle}°`
      });
    });

    return points;
  }

  /**
   * Get object tracking points
   */
  private getObjectTrackingPoints(
    cursorX: number,
    cursorY: number,
    entities: any[]
  ): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Track parallel and perpendicular relationships
    this.trackingPoints.forEach(trackPoint => {
      entities.forEach(entity => {
        if (entity.type === 'line') {
          // Parallel tracking
          const parallelPoint = this.getParallelTrackingPoint(
            trackPoint,
            entity,
            cursorX,
            cursorY
          );
          if (parallelPoint) {
            points.push({
              ...parallelPoint,
              type: ObjectSnapType.PARALLEL,
              priority: 5,
              tooltip: 'Parallel'
            });
          }
        }
      });
    });

    return points;
  }

  /**
   * Prioritize snap points by type and distance
   */
  private prioritizeSnapPoints(
    snapPoints: SnapPoint[],
    cursorX: number,
    cursorY: number
  ): SnapPoint[] {
    return snapPoints
      .map(snap => ({
        ...snap,
        distance: Math.sqrt(
          Math.pow(snap.x - cursorX, 2) + Math.pow(snap.y - cursorY, 2)
        )
      }))
      .sort((a, b) => {
        // Sort by priority first, then by distance
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.distance - b.distance;
      })
      .slice(0, 5); // Return top 5 candidates
  }

  /**
   * Utility methods
   */
  private calculateWallCenterline(wall: any): { x: number; y: number }[] {
    // Simplified - return midpoint
    return [{
      x: (wall.start.x + wall.end.x) / 2,
      y: (wall.start.y + wall.end.y) / 2
    }];
  }

  private calculateLineIntersection(
    snap1: SnapPoint,
    snap2: SnapPoint
  ): { x: number; y: number } | null {
    // Simplified intersection calculation
    const line1 = snap1.entity;
    const line2 = snap2.entity;
    if (!line1 || !line2) return null;

    // Line intersection math would go here
    return null; // Placeholder
  }

  private projectPointOntoLine(
    point: { x: number; y: number },
    line: any
  ): { x: number; y: number } | null {
    // Vector from line start to point
    const dx = point.x - line.start.x;
    const dy = point.y - line.start.y;
    
    // Line vector
    const lx = line.end.x - line.start.x;
    const ly = line.end.y - line.start.y;
    
    // Project point onto line
    const t = (dx * lx + dy * ly) / (lx * lx + ly * ly);
    
    return {
      x: line.start.x + t * lx,
      y: line.start.y + t * ly
    };
  }

  private getParallelTrackingPoint(
    trackPoint: SnapPoint,
    entity: any,
    cursorX: number,
    cursorY: number
  ): { x: number; y: number } | null {
    // Simplified parallel tracking
    return null; // Placeholder
  }

  private updateEntityCache(entities: any[]) {
    // Update entity cache logic
  }

  /**
   * Public API methods
   */
  setSnapPoint(snapPoint: SnapPoint | null) {
    this.lastSnapPoint = snapPoint;
    if (snapPoint) {
      this.trackingPoints.push(snapPoint);
      // Keep only last 5 tracking points
      if (this.trackingPoints.length > 5) {
        this.trackingPoints.shift();
      }
    }
  }

  updateSettings(settings: Partial<SnapSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.snapCache.clear(); // Clear cache when settings change
  }

  enableSnapType(type: ObjectSnapType) {
    this.settings.enabled.add(type);
  }

  disableSnapType(type: ObjectSnapType) {
    this.settings.enabled.delete(type);
  }

  clearCache() {
    this.snapCache.clear();
  }

  getSettings(): SnapSettings {
    return { ...this.settings };
  }

  // Architectural-specific snap points
  private getDoorSnapPoints(door: any): SnapPoint[] {
    const points: SnapPoint[] = [];
    
    if (this.settings.enabled.has(ObjectSnapType.DOOR_CENTER)) {
      points.push({
        x: door.center.x,
        y: door.center.y,
        type: ObjectSnapType.DOOR_CENTER,
        entity: door,
        priority: 9,
        tooltip: 'Door Center'
      });
    }

    return points;
  }

  private getWindowSnapPoints(window: any): SnapPoint[] {
    const points: SnapPoint[] = [];
    
    if (this.settings.enabled.has(ObjectSnapType.WINDOW_CENTER)) {
      points.push({
        x: window.center.x,
        y: window.center.y,
        type: ObjectSnapType.WINDOW_CENTER,
        entity: window,
        priority: 9,
        tooltip: 'Window Center'
      });
    }

    return points;
  }

  private getArcSnapPoints(arc: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Arc endpoints
    if (this.settings.enabled.has(ObjectSnapType.ENDPOINT)) {
      points.push(
        {
          x: arc.start.x,
          y: arc.start.y,
          type: ObjectSnapType.ENDPOINT,
          entity: arc,
          priority: 10,
          tooltip: 'Arc End'
        },
        {
          x: arc.end.x,
          y: arc.end.y,
          type: ObjectSnapType.ENDPOINT,
          entity: arc,
          priority: 10,
          tooltip: 'Arc End'
        }
      );
    }

    // Arc center
    if (this.settings.enabled.has(ObjectSnapType.CENTER)) {
      points.push({
        x: arc.center.x,
        y: arc.center.y,
        type: ObjectSnapType.CENTER,
        entity: arc,
        priority: 9,
        tooltip: 'Arc Center'
      });
    }

    // Arc midpoint
    if (this.settings.enabled.has(ObjectSnapType.MIDPOINT)) {
      const midAngle = (arc.startAngle + arc.endAngle) / 2;
      points.push({
        x: arc.center.x + arc.radius * Math.cos(midAngle),
        y: arc.center.y + arc.radius * Math.sin(midAngle),
        type: ObjectSnapType.MIDPOINT,
        entity: arc,
        priority: 8,
        tooltip: 'Arc Midpoint'
      });
    }

    return points;
  }

  private getPolylineSnapPoints(polyline: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Vertex points
    if (this.settings.enabled.has(ObjectSnapType.ENDPOINT)) {
      polyline.vertices.forEach((vertex: any, index: number) => {
        points.push({
          x: vertex.x,
          y: vertex.y,
          type: ObjectSnapType.ENDPOINT,
          entity: polyline,
          priority: 10,
          tooltip: `Vertex ${index + 1}`
        });
      });
    }

    // Segment midpoints
    if (this.settings.enabled.has(ObjectSnapType.MIDPOINT)) {
      for (let i = 0; i < polyline.vertices.length - 1; i++) {
        const v1 = polyline.vertices[i];
        const v2 = polyline.vertices[i + 1];
        points.push({
          x: (v1.x + v2.x) / 2,
          y: (v1.y + v2.y) / 2,
          type: ObjectSnapType.MIDPOINT,
          entity: polyline,
          priority: 8,
          tooltip: `Segment ${i + 1} Midpoint`
        });
      }
    }

    return points;
  }

  private getRectangleSnapPoints(rectangle: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Corner points
    if (this.settings.enabled.has(ObjectSnapType.ENDPOINT)) {
      const corners = [
        { x: rectangle.x, y: rectangle.y },
        { x: rectangle.x + rectangle.width, y: rectangle.y },
        { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
        { x: rectangle.x, y: rectangle.y + rectangle.height }
      ];

      corners.forEach((corner, index) => {
        points.push({
          x: corner.x,
          y: corner.y,
          type: ObjectSnapType.ENDPOINT,
          entity: rectangle,
          priority: 10,
          tooltip: `Corner ${index + 1}`
        });
      });
    }

    // Center point
    if (this.settings.enabled.has(ObjectSnapType.CENTER)) {
      points.push({
        x: rectangle.x + rectangle.width / 2,
        y: rectangle.y + rectangle.height / 2,
        type: ObjectSnapType.CENTER,
        entity: rectangle,
        priority: 9,
        tooltip: 'Rectangle Center'
      });
    }

    // Edge midpoints
    if (this.settings.enabled.has(ObjectSnapType.MIDPOINT)) {
      const midpoints = [
        { x: rectangle.x + rectangle.width / 2, y: rectangle.y, tooltip: 'Top Edge' },
        { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height / 2, tooltip: 'Right Edge' },
        { x: rectangle.x + rectangle.width / 2, y: rectangle.y + rectangle.height, tooltip: 'Bottom Edge' },
        { x: rectangle.x, y: rectangle.y + rectangle.height / 2, tooltip: 'Left Edge' }
      ];

      midpoints.forEach(mid => {
        points.push({
          x: mid.x,
          y: mid.y,
          type: ObjectSnapType.MIDPOINT,
          entity: rectangle,
          priority: 8,
          tooltip: mid.tooltip
        });
      });
    }

    return points;
  }

  private getTextSnapPoints(text: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Text insertion point
    if (this.settings.enabled.has(ObjectSnapType.INSERT)) {
      points.push({
        x: text.x,
        y: text.y,
        type: ObjectSnapType.INSERT,
        entity: text,
        priority: 9,
        tooltip: 'Text Insertion Point'
      });
    }

    return points;
  }

  private getBlockSnapPoints(block: any): SnapPoint[] {
    const points: SnapPoint[] = [];

    // Block insertion point
    if (this.settings.enabled.has(ObjectSnapType.INSERT)) {
      points.push({
        x: block.x,
        y: block.y,
        type: ObjectSnapType.INSERT,
        entity: block,
        priority: 9,
        tooltip: 'Block Insertion Point'
      });
    }

    return points;
  }
}

export default AdvancedObjectSnaps;