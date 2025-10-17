'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Lightbulb, Calculator, BarChart3, FileImage, Map, Zap, 
  TreePine, Wind, Cpu, Box, Sun, Thermometer, Power, Wrench,
  Check, Clock, Compass, List, Hash, AlertOctagon, Droplets,
  Eye, Palette, Camera, Layers, Grid3X3, Target, Gauge
} from 'lucide-react';

interface LightingReportSection {
  id: string;
  title: string;
  description: string;
  category: 'essential' | 'technical' | 'visual' | 'horticulture' | 'compliance' | 'advanced';
  icon: React.ComponentType<any>;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  outputs?: string[];
  preview?: string;
}

const LIGHTING_REPORT_SECTIONS: LightingReportSection[] = [
  // Essential Project Information
  {
    id: 'project-summary',
    title: 'Project Summary',
    description: 'Project overview, client info, and room specifications',
    category: 'essential',
    icon: FileText,
    enabled: true,
    priority: 'high',
    outputs: ['Room dimensions', 'Client details', 'Project scope'],
    preview: 'Professional cover page with project details'
  },
  {
    id: 'luminaire-schedule',
    title: 'Fixture Schedule & Specifications',
    description: 'Complete fixture list with model numbers, wattages, and specifications',
    category: 'essential',
    icon: Lightbulb,
    enabled: true,
    priority: 'high',
    outputs: ['Fixture models', 'Wattage per fixture', 'Mounting details', 'Cut sheets'],
    preview: 'Professional table with all fixture data'
  },
  {
    id: 'fixture-coordinates',
    title: 'XYZ Fixture Locations',
    description: 'Precise coordinates, mounting heights, and aiming angles',
    category: 'technical',
    icon: Compass,
    enabled: true,
    priority: 'high',
    outputs: ['X,Y,Z coordinates', 'Mounting heights', 'Aiming angles', 'Installation grid'],
    preview: 'Detailed coordinate table for contractors'
  },
  {
    id: 'ppfd-analysis',
    title: 'PPFD Levels & Distribution',
    description: 'Photosynthetic photon flux density analysis with heat maps',
    category: 'horticulture',
    icon: Target,
    enabled: true,
    priority: 'high',
    outputs: ['PPFD values', 'Heat maps', 'Min/max/average', 'Uniformity ratios'],
    preview: 'Color-coded PPFD distribution maps'
  },
  {
    id: 'point-by-point',
    title: 'Point-by-Point Calculations',
    description: 'Detailed illuminance grid with lux/footcandle values',
    category: 'technical',
    icon: Calculator,
    enabled: true,
    priority: 'high',
    outputs: ['Illuminance grid', 'Calculation points', 'Iso-contour lines'],
    preview: 'Professional calculation grid overlay'
  },
  {
    id: 'wattage-calculations',
    title: 'Power & Energy Analysis',
    description: 'Total wattage, power density, and energy efficiency metrics',
    category: 'essential',
    icon: Zap,
    enabled: true,
    priority: 'high',
    outputs: ['Total power consumption', 'Watts per sq ft', 'Energy costs', 'Efficiency ratings'],
    preview: 'Power analysis charts and tables'
  },
  {
    id: '3d-rendering',
    title: '3D Photorealistic Renderings',
    description: 'High-quality 3D visualizations of the lighting design',
    category: 'visual',
    icon: Camera,
    enabled: true,
    priority: 'medium',
    outputs: ['3D room renderings', 'Multiple viewpoints', 'Professional lighting effects'],
    preview: 'Photorealistic 3D visualization'
  },
  {
    id: 'false-color-rendering',
    title: 'False Color Renderings',
    description: 'Color-coded illuminance and PPFD visualization',
    category: 'visual',
    icon: Palette,
    enabled: true,
    priority: 'medium',
    outputs: ['Color-coded illuminance', 'PPFD heat maps', 'Gradient legends'],
    preview: 'False color visualization with legends'
  },
  {
    id: 'uniformity-analysis',
    title: 'Uniformity Analysis',
    description: 'Light distribution uniformity ratios and statistics',
    category: 'technical',
    icon: BarChart3,
    enabled: true,
    priority: 'medium',
    outputs: ['Min/max ratios', 'Average/min ratios', 'Uniformity maps', 'Statistics'],
    preview: 'Uniformity charts and analysis'
  },
  {
    id: 'dli-analysis',
    title: 'Daily Light Integral (DLI)',
    description: 'Cannabis-specific DLI calculations and recommendations',
    category: 'horticulture',
    icon: TreePine,
    enabled: true,
    priority: 'high',
    outputs: ['DLI values', 'Growth stage recommendations', 'Photoperiod schedules'],
    preview: 'DLI analysis for cultivation stages'
  },
  {
    id: 'spectral-analysis',
    title: 'Spectral Analysis',
    description: 'Light spectrum distribution and color quality metrics',
    category: 'horticulture',
    icon: Sun,
    enabled: false,
    priority: 'medium',
    outputs: ['Spectrum curves', 'PAR distribution', 'Color temperature', 'CRI values'],
    preview: 'Detailed spectral power distribution'
  },
  {
    id: 'electrical-layout',
    title: 'Electrical & Circuit Design',
    description: 'Circuit assignments, load calculations, and electrical layout',
    category: 'technical',
    icon: Power,
    enabled: true,
    priority: 'medium',
    outputs: ['Circuit layout', 'Load calculations', 'Voltage drop analysis', 'Panel schedule'],
    preview: 'Professional electrical documentation'
  },
  {
    id: 'control-systems',
    title: 'Control Systems & Zoning',
    description: 'Lighting control zones, dimming, and automation',
    category: 'advanced',
    icon: Cpu,
    enabled: false,
    priority: 'medium',
    outputs: ['Control zones', 'Dimming schedules', 'Sensor placement', 'Programming'],
    preview: 'Control system layout and programming'
  },
  {
    id: 'cfd-analysis',
    title: 'CFD Thermal Analysis',
    description: 'Heat distribution and airflow analysis from lighting',
    category: 'advanced',
    icon: Wind,
    enabled: false,
    priority: 'low',
    outputs: ['Temperature maps', 'Airflow patterns', 'Heat load calculations', 'HVAC impact'],
    preview: 'CFD visualization and analysis'
  },
  {
    id: 'roi-analysis',
    title: 'ROI & Cost Analysis',
    description: 'Return on investment and financial analysis',
    category: 'essential',
    icon: Calculator,
    enabled: true,
    priority: 'medium',
    outputs: ['ROI calculations', 'Payback period', 'Energy savings', 'TCO analysis'],
    preview: 'Financial analysis charts and tables'
  },
  {
    id: 'compliance-report',
    title: 'Code Compliance',
    description: 'Energy codes, standards compliance, and certifications',
    category: 'compliance',
    icon: Check,
    enabled: true,
    priority: 'medium',
    outputs: ['Code compliance', 'Energy standards', 'Certification status', 'Requirements'],
    preview: 'Compliance checklist and documentation'
  },
  {
    id: 'environmental-factors',
    title: 'Environmental Integration',
    description: 'Temperature, humidity, and environmental considerations',
    category: 'horticulture',
    icon: Thermometer,
    enabled: false,
    priority: 'low',
    outputs: ['Environmental conditions', 'Climate integration', 'Growing parameters'],
    preview: 'Environmental analysis and recommendations'
  },
  {
    id: 'installation-details',
    title: 'Installation & Mounting',
    description: 'Detailed mounting methods and installation instructions',
    category: 'technical',
    icon: Wrench,
    enabled: false,
    priority: 'low',
    outputs: ['Mounting details', 'Installation steps', 'Hardware specs', 'Safety notes'],
    preview: 'Installation guide and specifications'
  }
];

const QUICK_SELECT_TEMPLATES = {
  'cannabis-professional': {
    name: 'Cannabis Professional Package',
    description: 'Complete package for cannabis cultivation facilities',
    sections: ['project-summary', 'luminaire-schedule', 'fixture-coordinates', 'ppfd-analysis', 'dli-analysis', '3d-rendering', 'false-color-rendering', 'wattage-calculations', 'electrical-layout', 'uniformity-analysis', 'roi-analysis', 'compliance-report']
  },
  'contractor-technical': {
    name: 'Contractor Technical Package',
    description: 'Technical documentation for installation contractors',
    sections: ['project-summary', 'luminaire-schedule', 'fixture-coordinates', 'point-by-point', 'electrical-layout', 'installation-details', 'wattage-calculations']
  },
  'investor-presentation': {
    name: 'Investor Presentation',
    description: 'Executive summary for investors and stakeholders',
    sections: ['project-summary', '3d-rendering', 'ppfd-analysis', 'roi-analysis', 'wattage-calculations', 'uniformity-analysis']
  },
  'regulatory-submission': {
    name: 'Regulatory Submission',
    description: 'Complete documentation for permit and compliance',
    sections: ['project-summary', 'compliance-report', 'wattage-calculations', 'electrical-layout', 'fixture-coordinates', 'environmental-factors']
  },
  'visual-presentation': {
    name: 'Visual Presentation',
    description: 'High-impact visual presentation with renderings',
    sections: ['project-summary', '3d-rendering', 'false-color-rendering', 'ppfd-analysis', 'dli-analysis', 'uniformity-analysis']
  }
};

export default function EnhancedLightingReportSelector() {
  const [sections, setSections] = useState<LightingReportSection[]>(LIGHTING_REPORT_SECTIONS);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Sections', count: sections.length },
    { id: 'essential', name: 'Essential', count: sections.filter(s => s.category === 'essential').length },
    { id: 'technical', name: 'Technical', count: sections.filter(s => s.category === 'technical').length },
    { id: 'visual', name: 'Visual', count: sections.filter(s => s.category === 'visual').length },
    { id: 'horticulture', name: 'Horticulture', count: sections.filter(s => s.category === 'horticulture').length },
    { id: 'compliance', name: 'Compliance', count: sections.filter(s => s.category === 'compliance').length },
    { id: 'advanced', name: 'Advanced', count: sections.filter(s => s.category === 'advanced').length }
  ];

  const filteredSections = sections.filter(section => {
    const matchesCategory = activeCategory === 'all' || section.category === activeCategory;
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const enabledSections = sections.filter(s => s.enabled);
  const totalSections = enabledSections.length;

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const applyTemplate = (templateId: string) => {
    const template = QUICK_SELECT_TEMPLATES[templateId as keyof typeof QUICK_SELECT_TEMPLATES];
    if (template) {
      setSections(prev => prev.map(section => ({
        ...section,
        enabled: template.sections.includes(section.id)
      })));
      setSelectedTemplate(templateId);
    }
  };

  const selectAll = () => {
    setSections(prev => prev.map(section => ({ ...section, enabled: true })));
  };

  const selectNone = () => {
    setSections(prev => prev.map(section => ({ ...section, enabled: false })));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      essential: 'text-green-400 border-green-400/30 bg-green-400/10',
      technical: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
      visual: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
      horticulture: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
      compliance: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
      advanced: 'text-red-400 border-red-400/30 bg-red-400/10'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400 border-gray-400/30 bg-gray-400/10';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Lighting Design Report Builder
        </h1>
        <p className="text-gray-400">
          Select the sections you want to include in your professional lighting report
        </p>
      </div>

      {/* Quick Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Select Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(QUICK_SELECT_TEMPLATES).map(([id, template]) => (
            <div
              key={id}
              onClick={() => applyTemplate(id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedTemplate === id
                  ? 'border-green-400 bg-green-400/10'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <h3 className="font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              <div className="text-xs text-gray-500">
                {template.sections.length} sections included
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear All
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
          <div className="text-green-400 font-semibold">
            {totalSections} sections selected
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                activeCategory === category.id
                  ? 'border-green-400 bg-green-400/20 text-green-400'
                  : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`p-6 rounded-lg border cursor-pointer transition-all ${
                section.enabled
                  ? 'border-green-400 bg-green-400/10'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-white">{section.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(section.category)}`}>
                        {section.category}
                      </span>
                      <span className={`text-xs ${getPriorityColor(section.priority)}`}>
                        {section.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  section.enabled
                    ? 'border-green-400 bg-green-400'
                    : 'border-gray-400'
                }`}>
                  {section.enabled && <Check className="w-3 h-3 text-black" />}
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{section.description}</p>
              
              {section.outputs && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Includes:</div>
                  <div className="flex flex-wrap gap-1">
                    {section.outputs.slice(0, 3).map((output, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                        {output}
                      </span>
                    ))}
                    {section.outputs.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                        +{section.outputs.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {section.preview && (
                <div className="text-xs text-gray-500 italic">
                  Preview: {section.preview}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generate Report Button */}
      <div className="fixed bottom-6 right-6">
        <button
          disabled={totalSections === 0}
          className={`px-8 py-4 rounded-lg font-semibold text-white text-lg shadow-lg ${
            totalSections > 0
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          Generate Report ({totalSections} sections)
        </button>
      </div>
    </div>
  );
}