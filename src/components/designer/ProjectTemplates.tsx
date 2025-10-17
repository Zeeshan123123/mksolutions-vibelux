import React from 'react';
import { FileText, Home, Leaf, Fish, Warehouse } from 'lucide-react';

interface ProjectTemplatesProps {
  onSelectTemplate: (template: any) => void;
  onClose: () => void;
}

const templates = [
  {
    id: 'small-grow',
    name: 'Small Grow Room',
    description: '10x10 indoor cultivation space',
    icon: Home,
    room: {
      dimensions: { length: 10, width: 10, height: 8 },
      unit: 'feet'
    },
    fixtures: []
  },
  {
    id: 'commercial-flower',
    name: 'Commercial Flower Room',
    description: '40x20 flowering room with optimal coverage',
    icon: Leaf,
    room: {
      dimensions: { length: 40, width: 20, height: 10 },
      unit: 'feet'
    },
    fixtures: []
  },
  {
    id: 'vertical-farm',
    name: 'Vertical Farm',
    description: 'Multi-tier vertical growing system',
    icon: Warehouse,
    room: {
      dimensions: { length: 50, width: 30, height: 20 },
      unit: 'feet'
    },
    fixtures: []
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse Supplemental',
    description: 'Supplemental lighting for greenhouse',
    icon: Leaf,
    room: {
      dimensions: { length: 100, width: 30, height: 15 },
      unit: 'feet'
    },
    fixtures: []
  },
  {
    id: 'aquaculture',
    name: 'Aquaculture System',
    description: 'Lighting for aquaponics/hydroponics',
    icon: Fish,
    room: {
      dimensions: { length: 30, width: 20, height: 10 },
      unit: 'feet'
    },
    fixtures: []
  }
];

export default function ProjectTemplates({ onSelectTemplate, onClose }: ProjectTemplatesProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-left transition-all hover:scale-105"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-8 h-8 text-purple-400" />
              <h3 className="font-semibold text-lg">{template.name}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">{template.description}</p>
            <div className="text-xs text-gray-500">
              {template.room.dimensions.length} × {template.room.dimensions.width} × {template.room.dimensions.height} {template.room.unit}
            </div>
          </button>
        );
      })}
      
      <button
        onClick={onClose}
        className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-center border-2 border-dashed border-gray-600"
      >
        <FileText className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-500">Start from scratch</p>
      </button>
    </div>
  );
}