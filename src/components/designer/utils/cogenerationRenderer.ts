/**
 * Cogeneration Component Renderer for 2D Canvas
 * Renders cogeneration equipment with proper US customary dimensions and clearances
 */

import type { CogenerationComponent } from '../context/types';

export interface RenderOptions {
  scale: number;
  offsetX: number;
  offsetY: number;
  showClearances: boolean;
  showConnections: boolean;
  showLabels: boolean;
  selectedComponentId?: string;
}

// Component type styling
const COMPONENT_STYLES = {
  cogeneration_unit: {
    fillColor: '#3B82F6',      // Blue
    borderColor: '#1E40AF',    // Dark blue
    icon: '⚡',
    labelColor: '#1E40AF'
  },
  boiler: {
    fillColor: '#EF4444',      // Red
    borderColor: '#B91C1C',    // Dark red
    icon: '🔥',
    labelColor: '#B91C1C'
  },
  heat_exchanger: {
    fillColor: '#F59E0B',      // Amber
    borderColor: '#D97706',    // Dark amber
    icon: '🔄',
    labelColor: '#D97706'
  },
  chiller: {
    fillColor: '#06B6D4',      // Cyan
    borderColor: '#0891B2',    // Dark cyan
    icon: '❄️',
    labelColor: '#0891B2'
  },
  cooling_tower: {
    fillColor: '#84CC16',      // Lime
    borderColor: '#65A30D',    // Dark lime
    icon: '🌊',
    labelColor: '#65A30D'
  },
  electrical_panel: {
    fillColor: '#8B5CF6',      // Violet
    borderColor: '#7C3AED',    // Dark violet
    icon: '⚡',
    labelColor: '#7C3AED'
  },
  gas_meter: {
    fillColor: '#F97316',      // Orange
    borderColor: '#EA580C',    // Dark orange
    icon: '📊',
    labelColor: '#EA580C'
  },
  piping: {
    fillColor: '#64748B',      // Slate
    borderColor: '#475569',    // Dark slate
    icon: '🔧',
    labelColor: '#475569'
  },
  ductwork: {
    fillColor: '#6B7280',      // Gray
    borderColor: '#4B5563',    // Dark gray
    icon: '🌬️',
    labelColor: '#4B5563'
  }
};

// Clearance colors
const CLEARANCE_COLORS = {
  front: 'rgba(34, 197, 94, 0.2)',    // Green
  back: 'rgba(239, 68, 68, 0.2)',     // Red
  left: 'rgba(59, 130, 246, 0.2)',    // Blue
  right: 'rgba(147, 51, 234, 0.2)',   // Purple
  top: 'rgba(245, 158, 11, 0.2)'      // Amber
};

/**
 * Convert inches to canvas pixels
 */
function inchesToPixels(inches: number, scale: number): number {
  // 1 foot = 12 inches = 20 pixels at scale 1.0
  return (inches / 12) * 20 * scale;
}

/**
 * Convert canvas pixels to inches
 */
function pixelsToInches(pixels: number, scale: number): number {
  return (pixels / (20 * scale)) * 12;
}

/**
 * Render a single cogeneration component
 */
export function renderCogenerationComponent(
  ctx: CanvasRenderingContext2D,
  component: CogenerationComponent,
  options: RenderOptions
): void {
  const { scale, offsetX, offsetY, showClearances, showLabels, selectedComponentId } = options;
  
  // Convert component position and dimensions to canvas coordinates
  const x = component.position.x * scale + offsetX;
  const y = component.position.y * scale + offsetY;
  const width = inchesToPixels(component.dimensions.width, scale);
  const height = inchesToPixels(component.dimensions.depth, scale);
  
  const style = COMPONENT_STYLES[component.type];
  const isSelected = component.id === selectedComponentId;
  
  ctx.save();
  
  // Apply rotation if needed
  if (component.rotation !== 0) {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((component.rotation * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);
  }
  
  // Render clearances first (if enabled)
  if (showClearances) {
    renderComponentClearances(ctx, component, { x, y, width, height }, scale);
  }
  
  // Render main component body
  ctx.fillStyle = isSelected ? style.fillColor + 'CC' : style.fillColor + 'AA';
  ctx.strokeStyle = isSelected ? '#FF6B35' : style.borderColor;
  ctx.lineWidth = isSelected ? 3 : 2;
  
  // Draw component rectangle
  ctx.fillRect(0, 0, width, height);
  ctx.strokeRect(0, 0, width, height);
  
  // Add component type icon
  const iconSize = Math.min(width, height) * 0.3;
  ctx.fillStyle = style.labelColor;
  ctx.font = `${iconSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(style.icon, width / 2, height / 2);
  
  // Add component label
  if (showLabels) {
    renderComponentLabel(ctx, component, { x: 0, y: 0, width, height }, style);
  }
  
  // Add utility connections
  renderUtilityConnections(ctx, component, { x: 0, y: 0, width, height }, scale);
  
  // Add mounting indicators
  renderMountingIndicators(ctx, component, { x: 0, y: 0, width, height });
  
  ctx.restore();
}

/**
 * Render component clearances
 */
function renderComponentClearances(
  ctx: CanvasRenderingContext2D,
  component: CogenerationComponent,
  bounds: { x: number; y: number; width: number; height: number },
  scale: number
): void {
  const { clearances } = component;
  const { x, y, width, height } = bounds;
  
  // Front clearance (bottom)
  if (clearances.front > 0) {
    const clearanceHeight = inchesToPixels(clearances.front, scale);
    ctx.fillStyle = CLEARANCE_COLORS.front;
    ctx.fillRect(x, y + height, width, clearanceHeight);
    
    // Add clearance label
    ctx.fillStyle = '#059669';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${clearances.front}"`, x + width / 2, y + height + clearanceHeight / 2);
  }
  
  // Back clearance (top)
  if (clearances.back > 0) {
    const clearanceHeight = inchesToPixels(clearances.back, scale);
    ctx.fillStyle = CLEARANCE_COLORS.back;
    ctx.fillRect(x, y - clearanceHeight, width, clearanceHeight);
    
    ctx.fillStyle = '#DC2626';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${clearances.back}"`, x + width / 2, y - clearanceHeight / 2);
  }
  
  // Left clearance
  if (clearances.left > 0) {
    const clearanceWidth = inchesToPixels(clearances.left, scale);
    ctx.fillStyle = CLEARANCE_COLORS.left;
    ctx.fillRect(x - clearanceWidth, y, clearanceWidth, height);
    
    ctx.save();
    ctx.translate(x - clearanceWidth / 2, y + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#2563EB';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${clearances.left}"`, 0, 0);
    ctx.restore();
  }
  
  // Right clearance
  if (clearances.right > 0) {
    const clearanceWidth = inchesToPixels(clearances.right, scale);
    ctx.fillStyle = CLEARANCE_COLORS.right;
    ctx.fillRect(x + width, y, clearanceWidth, height);
    
    ctx.save();
    ctx.translate(x + width + clearanceWidth / 2, y + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#7C3AED';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${clearances.right}"`, 0, 0);
    ctx.restore();
  }
}

/**
 * Render component label with specifications
 */
function renderComponentLabel(
  ctx: CanvasRenderingContext2D,
  component: CogenerationComponent,
  bounds: { x: number; y: number; width: number; height: number },
  style: any
): void {
  const { x, y, width, height } = bounds;
  
  // Component name label
  ctx.fillStyle = 'white';
  ctx.fillRect(x, y - 40, width, 35);
  ctx.strokeStyle = style.borderColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y - 40, width, 35);
  
  // Text content
  ctx.fillStyle = style.labelColor;
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Manufacturer and model
  ctx.fillText(`${component.manufacturer}`, x + width / 2, y - 35);
  ctx.font = '10px Arial';
  ctx.fillText(`${component.model}`, x + width / 2, y - 22);
  
  // Capacity or power
  let capacityText = '';
  if (component.specifications.electricalOutput) {
    capacityText = `${component.specifications.electricalOutput} kW`;
  } else if (component.specifications.capacity) {
    capacityText = `${component.specifications.capacity} HP`;
  }
  
  if (capacityText) {
    ctx.fillText(capacityText, x + width / 2, y - 12);
  }
  
  // Dimensions
  ctx.font = '8px Arial';
  ctx.fillStyle = '#6B7280';
  const dimText = `${component.dimensions.width}"×${component.dimensions.depth}"×${component.dimensions.height}"`;
  ctx.fillText(dimText, x + width / 2, y - 3);
}

/**
 * Render utility connections
 */
function renderUtilityConnections(
  ctx: CanvasRenderingContext2D,
  component: CogenerationComponent,
  bounds: { x: number; y: number; width: number; height: number },
  scale: number
): void {
  const { utilities } = component;
  const { x, y, width, height } = bounds;
  const connectionSize = 8 * scale;
  
  let connectionIndex = 0;
  
  // Electrical connection
  if (utilities.electrical) {
    const connectionX = x + width - connectionSize;
    const connectionY = y + (connectionIndex * (connectionSize + 2));
    
    ctx.fillStyle = '#FCD34D';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.fillRect(connectionX, connectionY, connectionSize, connectionSize);
    ctx.strokeRect(connectionX, connectionY, connectionSize, connectionSize);
    
    // Electrical symbol
    ctx.fillStyle = '#B45309';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', connectionX + connectionSize / 2, connectionY + connectionSize / 2 + 2);
    
    connectionIndex++;
  }
  
  // Gas connection
  if (utilities.gas) {
    const connectionX = x + width - connectionSize;
    const connectionY = y + (connectionIndex * (connectionSize + 2));
    
    ctx.fillStyle = '#FDE68A';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.fillRect(connectionX, connectionY, connectionSize, connectionSize);
    ctx.strokeRect(connectionX, connectionY, connectionSize, connectionSize);
    
    // Gas symbol
    ctx.fillStyle = '#B45309';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔥', connectionX + connectionSize / 2, connectionY + connectionSize / 2 + 2);
    
    connectionIndex++;
  }
  
  // Water connection
  if (utilities.water) {
    const connectionX = x + width - connectionSize;
    const connectionY = y + (connectionIndex * (connectionSize + 2));
    
    ctx.fillStyle = '#BFDBFE';
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.fillRect(connectionX, connectionY, connectionSize, connectionSize);
    ctx.strokeRect(connectionX, connectionY, connectionSize, connectionSize);
    
    // Water symbol
    ctx.fillStyle = '#1E40AF';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💧', connectionX + connectionSize / 2, connectionY + connectionSize / 2 + 2);
    
    connectionIndex++;
  }
}

/**
 * Render mounting indicators
 */
function renderMountingIndicators(
  ctx: CanvasRenderingContext2D,
  component: CogenerationComponent,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { mounting } = component;
  const { x, y, width, height } = bounds;
  
  // Floor mounting
  if (mounting.type === 'floor') {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x - 2, y + height - 2, width + 4, 4);
    ctx.setLineDash([]);
  }
  
  // Wall mounting
  if (mounting.type === 'wall') {
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y - 10);
    ctx.lineTo(x - 10, y + height + 10);
    ctx.lineTo(x, y + height);
    ctx.stroke();
  }
  
  // Ceiling mounting
  if (mounting.type === 'ceiling') {
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x - 2, y - 4, width + 4, 4);
    ctx.setLineDash([]);
  }
}

/**
 * Render all cogeneration components
 */
export function renderAllCogenerationComponents(
  ctx: CanvasRenderingContext2D,
  components: CogenerationComponent[],
  options: RenderOptions
): void {
  if (!components || components.length === 0) return;
  
  // Sort components by type for proper layering
  const sortedComponents = [...components].sort((a, b) => {
    const typeOrder = ['piping', 'ductwork', 'electrical_panel', 'gas_meter', 'heat_exchanger', 'chiller', 'cooling_tower', 'boiler', 'cogeneration_unit'];
    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  });
  
  // Render each component
  for (const component of sortedComponents) {
    renderCogenerationComponent(ctx, component, options);
  }
}

/**
 * Check if a point is inside a component (for selection)
 */
export function isPointInComponent(
  point: { x: number; y: number },
  component: CogenerationComponent,
  options: RenderOptions
): boolean {
  const { scale, offsetX, offsetY } = options;
  
  const componentX = component.position.x * scale + offsetX;
  const componentY = component.position.y * scale + offsetY;
  const componentWidth = inchesToPixels(component.dimensions.width, scale);
  const componentHeight = inchesToPixels(component.dimensions.depth, scale);
  
  return (
    point.x >= componentX &&
    point.x <= componentX + componentWidth &&
    point.y >= componentY &&
    point.y <= componentY + componentHeight
  );
}

/**
 * Check for component collision
 */
export function checkComponentCollision(
  component1: CogenerationComponent,
  component2: CogenerationComponent,
  includesClearances: boolean = true
): boolean {
  const comp1Bounds = getComponentBounds(component1, includesClearances);
  const comp2Bounds = getComponentBounds(component2, includesClearances);
  
  return !(
    comp1Bounds.right < comp2Bounds.left ||
    comp1Bounds.left > comp2Bounds.right ||
    comp1Bounds.bottom < comp2Bounds.top ||
    comp1Bounds.top > comp2Bounds.bottom
  );
}

/**
 * Get component bounds including clearances
 */
function getComponentBounds(component: CogenerationComponent, includeClearances: boolean) {
  const left = component.position.x - (includeClearances ? component.clearances.left : 0);
  const top = component.position.y - (includeClearances ? component.clearances.back : 0);
  const right = component.position.x + component.dimensions.width + (includeClearances ? component.clearances.right : 0);
  const bottom = component.position.y + component.dimensions.depth + (includeClearances ? component.clearances.front : 0);
  
  return { left, top, right, bottom };
}

export { inchesToPixels, pixelsToInches, COMPONENT_STYLES };