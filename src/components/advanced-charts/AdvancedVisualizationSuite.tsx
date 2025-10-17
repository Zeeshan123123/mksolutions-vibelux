'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  GitBranch,
  Target,
  Calendar,
  BarChart3,
  Settings,
  Download,
  Maximize2,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Share2,
  Layers
} from 'lucide-react';

// Enhanced chart types
export type AdvancedChartType = 'sankey' | 'spider' | 'gantt' | 'network' | 'treemap' | 'waterfall';

interface ChartConfig {
  width?: number;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showTooltips?: boolean;
  animated?: boolean;
  interactive?: boolean;
}

interface SankeyData {
  nodes: Array<{ id: string; name: string; category?: string; color?: string }>;
  links: Array<{ source: string; target: string; value: number; color?: string }>;
}

interface SpiderData {
  axes: Array<{ name: string; max: number; min?: number }>;
  datasets: Array<{
    name: string;
    color: string;
    values: number[];
    fillOpacity?: number;
  }>;
}

interface NetworkData {
  nodes: Array<{ id: string; name: string; group?: string; size?: number; color?: string }>;
  links: Array<{ source: string; target: string; strength?: number; color?: string }>;
}

// Sankey Diagram Component
export function SankeyChart({ 
  data, 
  config = {} 
}: { 
  data: SankeyData; 
  config?: ChartConfig;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  const width = config.width || 800;
  const height = config.height || 600;
  const nodeWidth = 20;
  const nodePadding = 40;

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Calculate node positions
    const nodeDepths = new Map<string, number>();
    const processedNodes = new Set<string>();
    
    // Assign depths (columns) to nodes
    const assignDepth = (nodeId: string, depth: number = 0) => {
      if (processedNodes.has(nodeId)) return;
      processedNodes.add(nodeId);
      nodeDepths.set(nodeId, depth);
      
      // Find all targets of this node
      const targets = data.links
        .filter(link => link.source === nodeId)
        .map(link => link.target);
      
      targets.forEach(target => assignDepth(target, depth + 1));
    };

    // Start from source nodes (nodes with no incoming links)
    const sourceNodes = data.nodes.filter(node => 
      !data.links.some(link => link.target === node.id)
    );
    
    sourceNodes.forEach(node => assignDepth(node.id, 0));

    const maxDepth = Math.max(...Array.from(nodeDepths.values()));
    const columnWidth = (width - 100) / Math.max(maxDepth, 1);

    // Group nodes by depth and calculate positions
    const nodesByDepth = new Map<number, string[]>();
    nodeDepths.forEach((depth, nodeId) => {
      if (!nodesByDepth.has(depth)) nodesByDepth.set(depth, []);
      nodesByDepth.get(depth)!.push(nodeId);
    });

    const nodePositions = new Map<string, { x: number; y: number; height: number }>();
    
    nodesByDepth.forEach((nodeIds, depth) => {
      const availableHeight = height - 100;
      const nodeHeight = Math.max(20, availableHeight / nodeIds.length - nodePadding);
      
      nodeIds.forEach((nodeId, index) => {
        const x = 50 + depth * columnWidth;
        const y = 50 + index * (nodeHeight + nodePadding);
        nodePositions.set(nodeId, { x, y, height: nodeHeight });
      });
    });

    renderSankey(nodePositions);
  }, [data, width, height]);

  const renderSankey = (nodePositions: Map<string, { x: number; y: number; height: number }>) => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous content
    svg.innerHTML = '';

    // Create gradients for links
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // Render links
    data.links.forEach((link, index) => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (!sourcePos || !targetPos) return;

      const linkThickness = Math.max(2, Math.min(link.value / 10, 50));
      
      // Create curved path
      const x1 = sourcePos.x + nodeWidth;
      const y1 = sourcePos.y + sourcePos.height / 2;
      const x2 = targetPos.x;
      const y2 = targetPos.y + targetPos.height / 2;
      
      const controlX1 = x1 + (x2 - x1) / 2;
      const controlX2 = x2 - (x2 - x1) / 2;
      
      const pathData = `M ${x1} ${y1} C ${controlX1} ${y1} ${controlX2} ${y2} ${x2} ${y2}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', link.color || '#94a3b8');
      path.setAttribute('stroke-width', linkThickness.toString());
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', hoveredLink === index ? '0.8' : '0.5');
      path.style.cursor = 'pointer';
      
      path.addEventListener('mouseenter', () => setHoveredLink(index));
      path.addEventListener('mouseleave', () => setHoveredLink(null));
      
      svg.appendChild(path);
    });

    // Render nodes
    data.nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      // Node rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', pos.x.toString());
      rect.setAttribute('y', pos.y.toString());
      rect.setAttribute('width', nodeWidth.toString());
      rect.setAttribute('height', pos.height.toString());
      rect.setAttribute('fill', node.color || '#3b82f6');
      rect.setAttribute('rx', '4');
      rect.setAttribute('opacity', hoveredNode === node.id ? '1' : '0.9');
      rect.style.cursor = 'pointer';
      
      rect.addEventListener('mouseenter', () => setHoveredNode(node.id));
      rect.addEventListener('mouseleave', () => setHoveredNode(null));
      
      svg.appendChild(rect);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (pos.x + nodeWidth + 8).toString());
      text.setAttribute('y', (pos.y + pos.height / 2).toString());
      text.setAttribute('dy', '0.35em');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '500');
      text.setAttribute('fill', '#1f2937');
      text.textContent = node.name;
      
      svg.appendChild(text);
    });
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-500" />
          Energy Flow Diagram
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-100 rounded"
      />
      
      {(hoveredNode || hoveredLink !== null) && (
        <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm">
          {hoveredNode && (
            <div>
              <strong>{data.nodes.find(n => n.id === hoveredNode)?.name}</strong>
            </div>
          )}
          {hoveredLink !== null && (
            <div>
              <strong>{data.links[hoveredLink]?.source} → {data.links[hoveredLink]?.target}</strong>
              <br />
              Value: {data.links[hoveredLink]?.value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Spider/Radar Chart Component
export function SpiderChart({ 
  data, 
  config = {} 
}: { 
  data: SpiderData; 
  config?: ChartConfig;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  
  const width = config.width || 400;
  const height = config.height || 400;
  const radius = Math.min(width, height) / 2 - 60;
  const centerX = width / 2;
  const centerY = height / 2;

  useEffect(() => {
    if (!svgRef.current || !data.axes.length) return;
    renderSpider();
  }, [data, selectedDataset]);

  const renderSpider = () => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.innerHTML = '';

    const angleStep = (2 * Math.PI) / data.axes.length;
    const levels = 5;

    // Draw background grid
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius * level) / levels;
      const points = data.axes.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points);
      polygon.setAttribute('fill', 'none');
      polygon.setAttribute('stroke', '#e5e7eb');
      polygon.setAttribute('stroke-width', '1');
      svg.appendChild(polygon);
    }

    // Draw axes
    data.axes.forEach((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX.toString());
      line.setAttribute('y1', centerY.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#9ca3af');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      // Axis labels
      const labelX = centerX + (radius + 20) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX.toString());
      text.setAttribute('y', labelY.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '0.35em');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '500');
      text.setAttribute('fill', '#374151');
      text.textContent = axis.name;
      svg.appendChild(text);
    });

    // Draw datasets
    data.datasets.forEach((dataset, datasetIndex) => {
      if (selectedDataset && selectedDataset !== dataset.name) return;

      const points = dataset.values.map((value, i) => {
        const axis = data.axes[i];
        const normalizedValue = (value - (axis.min || 0)) / (axis.max - (axis.min || 0));
        const pointRadius = radius * normalizedValue;
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + pointRadius * Math.cos(angle);
        const y = centerY + pointRadius * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');

      // Fill area
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points);
      polygon.setAttribute('fill', dataset.color);
      polygon.setAttribute('fill-opacity', (dataset.fillOpacity || 0.3).toString());
      polygon.setAttribute('stroke', dataset.color);
      polygon.setAttribute('stroke-width', '2');
      polygon.style.cursor = 'pointer';
      
      polygon.addEventListener('click', () => {
        setSelectedDataset(selectedDataset === dataset.name ? null : dataset.name);
      });
      
      svg.appendChild(polygon);

      // Data points
      dataset.values.forEach((value, i) => {
        const axis = data.axes[i];
        const normalizedValue = (value - (axis.min || 0)) / (axis.max - (axis.min || 0));
        const pointRadius = radius * normalizedValue;
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + pointRadius * Math.cos(angle);
        const y = centerY + pointRadius * Math.sin(angle);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', dataset.color);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
      });
    });
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          Performance Analysis
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="border border-gray-100 rounded"
        />
        
        {/* Legend */}
        <div className="flex-shrink-0">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Datasets</h4>
          <div className="space-y-2">
            {data.datasets.map((dataset, index) => (
              <div
                key={dataset.name}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedDataset === dataset.name 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDataset(
                  selectedDataset === dataset.name ? null : dataset.name
                )}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: dataset.color }}
                />
                <span className="text-sm text-gray-700">{dataset.name}</span>
                <button className="ml-auto p-1">
                  {selectedDataset === dataset.name ? (
                    <EyeOff className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Eye className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Network Diagram Component
export function NetworkChart({ 
  data, 
  config = {} 
}: { 
  data: NetworkData; 
  config?: ChartConfig;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const width = config.width || 600;
  const height = config.height || 400;

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;
    renderNetwork();
  }, [data, selectedNode]);

  const renderNetwork = () => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.innerHTML = '';

    // Simple force-directed layout simulation
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    // Initial random positions
    data.nodes.forEach(node => {
      nodePositions.set(node.id, {
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
      });
    });

    // Simple repulsion/attraction simulation
    for (let iteration = 0; iteration < 100; iteration++) {
      const forces = new Map<string, { fx: number; fy: number }>();
      
      // Initialize forces
      data.nodes.forEach(node => {
        forces.set(node.id, { fx: 0, fy: 0 });
      });

      // Repulsion between all nodes
      data.nodes.forEach(nodeA => {
        data.nodes.forEach(nodeB => {
          if (nodeA.id === nodeB.id) return;
          
          const posA = nodePositions.get(nodeA.id)!;
          const posB = nodePositions.get(nodeB.id)!;
          const dx = posA.x - posB.x;
          const dy = posA.y - posB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const repulsion = 1000 / (distance * distance);
          const forceA = forces.get(nodeA.id)!;
          forceA.fx += (dx / distance) * repulsion;
          forceA.fy += (dy / distance) * repulsion;
        });
      });

      // Attraction for connected nodes
      data.links.forEach(link => {
        const posSource = nodePositions.get(link.source)!;
        const posTarget = nodePositions.get(link.target)!;
        const dx = posTarget.x - posSource.x;
        const dy = posTarget.y - posSource.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const attraction = distance * 0.01;
        const forceSource = forces.get(link.source)!;
        const forceTarget = forces.get(link.target)!;
        
        forceSource.fx += (dx / distance) * attraction;
        forceSource.fy += (dy / distance) * attraction;
        forceTarget.fx -= (dx / distance) * attraction;
        forceTarget.fy -= (dy / distance) * attraction;
      });

      // Apply forces
      data.nodes.forEach(node => {
        const pos = nodePositions.get(node.id)!;
        const force = forces.get(node.id)!;
        
        pos.x += force.fx * 0.1;
        pos.y += force.fy * 0.1;
        
        // Boundary constraints
        pos.x = Math.max(30, Math.min(width - 30, pos.x));
        pos.y = Math.max(30, Math.min(height - 30, pos.y));
      });
    }

    // Render links
    data.links.forEach(link => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (!sourcePos || !targetPos) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sourcePos.x.toString());
      line.setAttribute('y1', sourcePos.y.toString());
      line.setAttribute('x2', targetPos.x.toString());
      line.setAttribute('y2', targetPos.y.toString());
      line.setAttribute('stroke', link.color || '#9ca3af');
      line.setAttribute('stroke-width', (link.strength || 1).toString());
      line.setAttribute('opacity', '0.6');
      svg.appendChild(line);
    });

    // Render nodes
    data.nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const nodeSize = node.size || 8;
      const isSelected = selectedNode === node.id;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', (nodeSize + (isSelected ? 4 : 0)).toString());
      circle.setAttribute('fill', node.color || '#3b82f6');
      circle.setAttribute('stroke', isSelected ? '#1d4ed8' : 'white');
      circle.setAttribute('stroke-width', isSelected ? '3' : '2');
      circle.style.cursor = 'pointer';
      
      circle.addEventListener('click', () => {
        setSelectedNode(selectedNode === node.id ? null : node.id);
      });
      
      svg.appendChild(circle);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', (pos.y + nodeSize + 15).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', '500');
      text.setAttribute('fill', '#374151');
      text.textContent = node.name;
      svg.appendChild(text);
    });
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          System Network
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-100 rounded"
      />
      
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm">
          <strong>{data.nodes.find(n => n.id === selectedNode)?.name}</strong>
          <br />
          Connections: {data.links.filter(l => l.source === selectedNode || l.target === selectedNode).length}
        </div>
      )}
    </div>
  );
}

// Main Advanced Visualization Suite Component
export function AdvancedVisualizationSuite() {
  const [activeChart, setActiveChart] = useState<AdvancedChartType>('sankey');

  // Sample data for demonstrations
  const sankeyData: SankeyData = {
    nodes: [
      { id: 'solar', name: 'Solar Panels', color: '#f59e0b' },
      { id: 'grid', name: 'Grid Power', color: '#3b82f6' },
      { id: 'battery', name: 'Battery Storage', color: '#10b981' },
      { id: 'lighting', name: 'LED Lighting', color: '#8b5cf6' },
      { id: 'hvac', name: 'HVAC System', color: '#ef4444' },
      { id: 'monitoring', name: 'Monitoring', color: '#06b6d4' }
    ],
    links: [
      { source: 'solar', target: 'battery', value: 120 },
      { source: 'solar', target: 'lighting', value: 80 },
      { source: 'grid', target: 'hvac', value: 200 },
      { source: 'grid', target: 'lighting', value: 40 },
      { source: 'battery', target: 'lighting', value: 100 },
      { source: 'battery', target: 'monitoring', value: 20 }
    ]
  };

  const spiderData: SpiderData = {
    axes: [
      { name: 'Energy Efficiency', max: 100, min: 0 },
      { name: 'Yield Quality', max: 100, min: 0 },
      { name: 'Cost Effectiveness', max: 100, min: 0 },
      { name: 'Sustainability', max: 100, min: 0 },
      { name: 'Automation', max: 100, min: 0 },
      { name: 'Scalability', max: 100, min: 0 }
    ],
    datasets: [
      {
        name: 'Current Performance',
        color: '#3b82f6',
        values: [78, 85, 65, 90, 70, 80],
        fillOpacity: 0.3
      },
      {
        name: 'Target Performance',
        color: '#10b981',
        values: [95, 92, 88, 95, 90, 95],
        fillOpacity: 0.2
      }
    ]
  };

  const networkData: NetworkData = {
    nodes: [
      { id: 'controller', name: 'Main Controller', size: 12, color: '#3b82f6' },
      { id: 'sensor1', name: 'Temp Sensor', size: 8, color: '#f59e0b' },
      { id: 'sensor2', name: 'Humidity Sensor', size: 8, color: '#f59e0b' },
      { id: 'sensor3', name: 'Light Sensor', size: 8, color: '#f59e0b' },
      { id: 'actuator1', name: 'LED Driver', size: 10, color: '#8b5cf6' },
      { id: 'actuator2', name: 'Fan Controller', size: 10, color: '#8b5cf6' },
      { id: 'gateway', name: 'IoT Gateway', size: 10, color: '#10b981' }
    ],
    links: [
      { source: 'controller', target: 'sensor1', strength: 2 },
      { source: 'controller', target: 'sensor2', strength: 2 },
      { source: 'controller', target: 'sensor3', strength: 2 },
      { source: 'controller', target: 'actuator1', strength: 3 },
      { source: 'controller', target: 'actuator2', strength: 3 },
      { source: 'controller', target: 'gateway', strength: 4 },
      { source: 'sensor1', target: 'actuator2', strength: 1 },
      { source: 'sensor3', target: 'actuator1', strength: 1 }
    ]
  };

  const chartTypes = [
    { id: 'sankey', name: 'Sankey Diagram', icon: GitBranch, description: 'Energy flow visualization' },
    { id: 'spider', name: 'Spider Chart', icon: Target, description: 'Performance analysis' },
    { id: 'network', name: 'Network Graph', icon: Layers, description: 'System connections' }
  ] as const;

  const renderActiveChart = () => {
    switch (activeChart) {
      case 'sankey':
        return <SankeyChart data={sankeyData} config={{ width: 800, height: 500 }} />;
      case 'spider':
        return <SpiderChart data={spiderData} config={{ width: 400, height: 400 }} />;
      case 'network':
        return <NetworkChart data={networkData} config={{ width: 600, height: 400 }} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Visualizations</h2>
        <p className="text-gray-600">Interactive charts for complex data analysis and system insights</p>
      </div>

      {/* Chart Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chartTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setActiveChart(type.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                activeChart === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${
                  activeChart === type.id ? 'text-blue-600' : 'text-gray-500'
                }`} />
                <h3 className={`font-semibold ${
                  activeChart === type.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {type.name}
                </h3>
              </div>
              <p className={`text-sm ${
                activeChart === type.id ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {type.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Chart */}
      <div className="mt-6">
        {renderActiveChart()}
      </div>
    </div>
  );
}