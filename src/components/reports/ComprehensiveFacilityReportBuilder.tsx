'use client';

import React, { useState } from 'react';
import { 
  Building, Lightbulb, Droplets, Wind, Thermometer, Wrench, 
  Calculator, BarChart3, FileImage, Map, Zap, TreePine, 
  Settings, Box, Grid3X3, Cpu, Power, Camera, Target,
  Gauge, Layers, Package, Truck, DollarSign, Calendar,
  Ruler, Compass, FileText, Table, List, Check, Users,
  ArrowUpDown, Snowflake, Sun, Waves, Cog, Database,
  TrendingUp, Shield, AlertTriangle, Activity, Monitor
} from 'lucide-react';

interface FacilityReportSection {
  id: string;
  title: string;
  description: string;
  category: 'lighting' | 'irrigation' | 'structural' | 'hvac' | 'benching' | 'automation' | 'environmental' | 'equipment' | 'project' | 'financial';
  icon: React.ComponentType<any>;
  enabled: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  outputs: string[];
  dependencies?: string[];
  preview: string;
}

const COMPREHENSIVE_FACILITY_SECTIONS: FacilityReportSection[] = [
  // Project Management & Overview
  {
    id: 'project-summary',
    title: 'Project Summary & Overview',
    description: 'Complete facility specifications, client information, and project scope',
    category: 'project',
    icon: Building,
    enabled: true,
    priority: 'critical',
    outputs: ['Project details', 'Facility dimensions', 'Growing area calculations', 'Client specifications', 'Design objectives'],
    preview: 'Professional cover page with complete project documentation'
  },
  {
    id: 'facility-layout',
    title: 'Master Facility Layout',
    description: '2D and 3D facility plans with all systems integrated',
    category: 'project',
    icon: Map,
    enabled: true,
    priority: 'critical',
    outputs: ['Master floor plan', '3D facility model', 'Zone designations', 'Traffic flow patterns', 'Integration drawings'],
    preview: 'Complete facility layout with all systems shown'
  },

  // Lighting Systems
  {
    id: 'lighting-design',
    title: 'Lighting System Design',
    description: 'Complete lighting analysis with PPFD, DLI, and fixture specifications',
    category: 'lighting',
    icon: Lightbulb,
    enabled: true,
    priority: 'critical',
    outputs: ['Fixture schedule', 'PPFD analysis', 'DLI calculations', 'Uniformity analysis', '3D lighting renderings', 'Power calculations'],
    preview: 'Professional lighting design with heat maps and specifications'
  },
  {
    id: 'lighting-electrical',
    title: 'Lighting Electrical Design',
    description: 'Circuit layouts, load calculations, and electrical specifications',
    category: 'lighting',
    icon: Power,
    enabled: true,
    priority: 'high',
    outputs: ['Circuit layout', 'Panel schedule', 'Load calculations', 'Voltage drop analysis', 'Conduit routing', 'Wire specifications'],
    dependencies: ['lighting-design'],
    preview: 'Electrical drawings and load analysis for lighting systems'
  },

  // Irrigation Systems
  {
    id: 'irrigation-design',
    title: 'Irrigation System Design',
    description: 'Complete irrigation design with pump sizing and zone layout',
    category: 'irrigation',
    icon: Droplets,
    enabled: true,
    priority: 'critical',
    outputs: ['Irrigation zones', 'Pump sizing calculations', 'Piping layout', 'Component specifications', 'Flow rates', 'Pressure analysis'],
    preview: 'Comprehensive irrigation system with pump curves and zone maps'
  },
  {
    id: 'water-nutrient-systems',
    title: 'Water & Nutrient Delivery',
    description: 'Water treatment, nutrient mixing, and delivery system specifications',
    category: 'irrigation',
    icon: Waves,
    enabled: true,
    priority: 'high',
    outputs: ['Water quality analysis', 'Nutrient formulations', 'Mixing tank sizing', 'Treatment equipment', 'Dosing systems', 'Storage calculations'],
    dependencies: ['irrigation-design'],
    preview: 'Water treatment and nutrient delivery system specifications'
  },
  {
    id: 'irrigation-automation',
    title: 'Irrigation Automation & Controls',
    description: 'Automated irrigation scheduling and control system design',
    category: 'irrigation',
    icon: Cpu,
    enabled: false,
    priority: 'medium',
    outputs: ['Control logic', 'Sensor placement', 'Automation schedules', 'Programming specifications', 'Interface design'],
    dependencies: ['irrigation-design'],
    preview: 'Automation control diagrams and programming specifications'
  },

  // Structural Systems
  {
    id: 'structural-design',
    title: 'Structural Design & Engineering',
    description: 'Complete structural analysis including foundations, frames, and load calculations',
    category: 'structural',
    icon: Ruler,
    enabled: true,
    priority: 'critical',
    outputs: ['Structural drawings', 'Load calculations', 'Foundation design', 'Beam sizing', 'Wind/snow loads', 'Safety factors'],
    preview: 'Professional structural engineering drawings and calculations'
  },
  {
    id: 'greenhouse-structures',
    title: 'Greenhouse Structure Systems',
    description: 'Specialized greenhouse components including gutters, heating pipes, and crop wires',
    category: 'structural',
    icon: Building,
    enabled: false,
    priority: 'high',
    outputs: ['Gutter systems', 'Heating pipe layout', 'Crop wire installation', 'Ventilation openings', 'Covering specifications'],
    dependencies: ['structural-design'],
    preview: 'Greenhouse-specific structural components and installation details'
  },

  // HVAC Systems
  {
    id: 'hvac-design',
    title: 'HVAC System Design',
    description: 'Complete climate control system with equipment sizing and layout',
    category: 'hvac',
    icon: Wind,
    enabled: true,
    priority: 'critical',
    outputs: ['Equipment sizing', 'Ductwork layout', 'Load calculations', 'Energy analysis', 'Control zones', 'Equipment specifications'],
    preview: 'HVAC system layout with load calculations and equipment schedules'
  },
  {
    id: 'ventilation-systems',
    title: 'Ventilation & Air Movement',
    description: 'Natural and mechanical ventilation systems for optimal air circulation',
    category: 'hvac',
    icon: ArrowUpDown,
    enabled: true,
    priority: 'high',
    outputs: ['Ventilation calculations', 'Fan sizing', 'Airflow patterns', 'Opening schedules', 'CFD analysis'],
    dependencies: ['hvac-design'],
    preview: 'Ventilation system design with airflow visualization'
  },

  // Environmental Control
  {
    id: 'environmental-control',
    title: 'Environmental Control Systems',
    description: 'Complete environmental monitoring and control with VPD analysis',
    category: 'environmental',
    icon: Thermometer,
    enabled: true,
    priority: 'high',
    outputs: ['VPD analysis', 'Climate control zones', 'Sensor placement', 'Set points', 'Control algorithms', 'Monitoring systems'],
    preview: 'Environmental control strategy with VPD optimization'
  },
  {
    id: 'climate-integration',
    title: 'Integrated Climate Systems',
    description: 'Integration of all climate systems for optimal growing conditions',
    category: 'environmental',
    icon: Sun,
    enabled: false,
    priority: 'medium',
    outputs: ['System integration', 'Control coordination', 'Energy optimization', 'Performance monitoring'],
    dependencies: ['hvac-design', 'environmental-control'],
    preview: 'Integrated climate control system coordination'
  },

  // Benching & Growing Systems
  {
    id: 'benching-layout',
    title: 'Benching & Growing Systems',
    description: 'Complete bench layout with space optimization and specifications',
    category: 'benching',
    icon: Grid3X3,
    enabled: true,
    priority: 'high',
    outputs: ['Bench layouts', 'Space utilization', 'Product specifications', 'Capacity calculations', 'Traffic aisles', 'Installation details'],
    preview: 'Optimized benching layout with space efficiency analysis'
  },
  {
    id: 'vertical-systems',
    title: 'Vertical Growing & Racking',
    description: 'Multi-tier growing systems and vertical rack specifications',
    category: 'benching',
    icon: Layers,
    enabled: false,
    priority: 'medium',
    outputs: ['Vertical rack design', 'Tier specifications', 'Support structures', 'Access systems', 'Light penetration'],
    dependencies: ['benching-layout'],
    preview: 'Vertical growing system design with multi-tier analysis'
  },
  {
    id: 'mobile-systems',
    title: 'Mobile Growing Systems',
    description: 'Rolling benches and mobile carriage systems for space efficiency',
    category: 'benching',
    icon: Truck,
    enabled: false,
    priority: 'medium',
    outputs: ['Mobile bench systems', 'Track installation', 'Movement patterns', 'Space savings', 'Automation integration'],
    dependencies: ['benching-layout'],
    preview: 'Mobile growing system with space optimization calculations'
  },

  // Automation & Control
  {
    id: 'facility-automation',
    title: 'Facility Automation Systems',
    description: 'Comprehensive automation and control system integration',
    category: 'automation',
    icon: Settings,
    enabled: true,
    priority: 'high',
    outputs: ['Control architecture', 'System integration', 'User interfaces', 'Communication protocols', 'Programming specifications'],
    preview: 'Complete facility automation and control system design'
  },
  {
    id: 'moving-gutter-automation',
    title: 'Moving Gutter Automation',
    description: 'Automated NFT gutter spacing with plant growth optimization',
    category: 'automation',
    icon: Activity,
    enabled: false,
    priority: 'medium',
    outputs: ['Gutter movement systems', 'Plant tracking', 'Growth algorithms', 'Spacing optimization', 'Harvest scheduling'],
    dependencies: ['facility-automation'],
    preview: 'Automated gutter spacing system with growth optimization'
  },

  // Equipment & Infrastructure
  {
    id: 'equipment-schedule',
    title: 'Equipment Schedule & Specifications',
    description: 'Complete equipment list with specifications and installation details',
    category: 'equipment',
    icon: Package,
    enabled: true,
    priority: 'high',
    outputs: ['Equipment schedules', 'Product specifications', 'Installation requirements', 'Vendor information', 'Performance data'],
    preview: 'Comprehensive equipment schedule with detailed specifications'
  },
  {
    id: 'maintenance-systems',
    title: 'Maintenance & Service Systems',
    description: 'Predictive maintenance scheduling and service access design',
    category: 'equipment',
    icon: Wrench,
    enabled: false,
    priority: 'medium',
    outputs: ['Maintenance schedules', 'Service access', 'Spare parts', 'Predictive algorithms', 'Work order systems'],
    dependencies: ['equipment-schedule'],
    preview: 'Maintenance management system with predictive scheduling'
  },

  // Financial & Analysis
  {
    id: 'cost-analysis',
    title: 'Complete Cost Analysis',
    description: 'Comprehensive project costs including all systems and installation',
    category: 'financial',
    icon: DollarSign,
    enabled: true,
    priority: 'high',
    outputs: ['System costs', 'Installation costs', 'Operating expenses', 'ROI analysis', 'Payback calculations', 'Life cycle costs'],
    preview: 'Complete financial analysis with ROI projections'
  },
  {
    id: 'energy-analysis',
    title: 'Energy Consumption Analysis',
    description: 'Total facility energy analysis with efficiency optimization',
    category: 'financial',
    icon: Zap,
    enabled: true,
    priority: 'high',
    outputs: ['Energy consumption', 'Demand analysis', 'Efficiency ratings', 'Cost projections', 'Carbon footprint'],
    dependencies: ['lighting-design', 'hvac-design'],
    preview: 'Comprehensive energy analysis with efficiency recommendations'
  },

  // Performance & Monitoring
  {
    id: 'performance-monitoring',
    title: 'Performance Monitoring Systems',
    description: 'Real-time monitoring and data collection system design',
    category: 'equipment',
    icon: Monitor,
    enabled: false,
    priority: 'medium',
    outputs: ['Sensor networks', 'Data collection', 'Analytics dashboards', 'Alert systems', 'Performance metrics'],
    preview: 'Performance monitoring system with real-time analytics'
  },

  // Compliance & Safety
  {
    id: 'compliance-documentation',
    title: 'Compliance & Safety Documentation',
    description: 'Complete regulatory compliance and safety system documentation',
    category: 'project',
    icon: Shield,
    enabled: true,
    priority: 'high',
    outputs: ['Code compliance', 'Safety systems', 'Regulatory documentation', 'Inspection checklists', 'Certification requirements'],
    preview: 'Complete compliance documentation for regulatory approval'
  }
];

const FACILITY_TEMPLATES = {
  'complete-facility': {
    name: 'Complete Facility Design Package',
    description: 'All systems included - comprehensive facility documentation',
    sections: [
      'project-summary', 'facility-layout', 'lighting-design', 'lighting-electrical',
      'irrigation-design', 'water-nutrient-systems', 'structural-design', 'hvac-design',
      'ventilation-systems', 'environmental-control', 'benching-layout', 'facility-automation',
      'equipment-schedule', 'cost-analysis', 'energy-analysis', 'compliance-documentation'
    ]
  },
  'cultivation-systems': {
    name: 'Cultivation Systems Package',
    description: 'Focus on growing systems - lighting, irrigation, environment, benching',
    sections: [
      'project-summary', 'lighting-design', 'irrigation-design', 'environmental-control',
      'benching-layout', 'cost-analysis', 'energy-analysis'
    ]
  },
  'infrastructure-package': {
    name: 'Infrastructure & Utilities Package',
    description: 'Structural, HVAC, electrical, and utility systems',
    sections: [
      'project-summary', 'facility-layout', 'structural-design', 'hvac-design',
      'lighting-electrical', 'equipment-schedule', 'compliance-documentation'
    ]
  },
  'contractor-package': {
    name: 'Contractor Installation Package',
    description: 'Technical specifications and installation details for contractors',
    sections: [
      'facility-layout', 'structural-design', 'lighting-electrical', 'irrigation-design',
      'hvac-design', 'equipment-schedule', 'compliance-documentation'
    ]
  },
  'automation-package': {
    name: 'Automation & Control Package',
    description: 'Advanced automation and control systems',
    sections: [
      'project-summary', 'facility-automation', 'irrigation-automation', 'environmental-control',
      'moving-gutter-automation', 'performance-monitoring', 'equipment-schedule'
    ]
  },
  'financial-analysis': {
    name: 'Financial Analysis Package',
    description: 'Complete financial analysis and ROI projections',
    sections: [
      'project-summary', 'cost-analysis', 'energy-analysis', 'lighting-design',
      'equipment-schedule', 'compliance-documentation'
    ]
  }
};

interface ComprehensiveFacilityReportBuilderProps {
  facilityData?: any
  projectInfo?: {
    name: string
    client: string
    location: string
    date: string
    proposalNumber: string
    designer: string
  }
}

export default function ComprehensiveFacilityReportBuilder({ facilityData, projectInfo }: ComprehensiveFacilityReportBuilderProps = {}) {
  const [sections, setSections] = useState<FacilityReportSection[]>(COMPREHENSIVE_FACILITY_SECTIONS);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Systems', count: sections.length },
    { id: 'project', name: 'Project', count: sections.filter(s => s.category === 'project').length },
    { id: 'lighting', name: 'Lighting', count: sections.filter(s => s.category === 'lighting').length },
    { id: 'irrigation', name: 'Irrigation', count: sections.filter(s => s.category === 'irrigation').length },
    { id: 'structural', name: 'Structural', count: sections.filter(s => s.category === 'structural').length },
    { id: 'hvac', name: 'HVAC', count: sections.filter(s => s.category === 'hvac').length },
    { id: 'environmental', name: 'Environmental', count: sections.filter(s => s.category === 'environmental').length },
    { id: 'benching', name: 'Benching', count: sections.filter(s => s.category === 'benching').length },
    { id: 'automation', name: 'Automation', count: sections.filter(s => s.category === 'automation').length },
    { id: 'equipment', name: 'Equipment', count: sections.filter(s => s.category === 'equipment').length },
    { id: 'financial', name: 'Financial', count: sections.filter(s => s.category === 'financial').length }
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
    const template = FACILITY_TEMPLATES[templateId as keyof typeof FACILITY_TEMPLATES];
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
      project: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
      lighting: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
      irrigation: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
      structural: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
      hvac: 'text-green-400 border-green-400/30 bg-green-400/10',
      environmental: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
      benching: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
      automation: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
      equipment: 'text-red-400 border-red-400/30 bg-red-400/10',
      financial: 'text-pink-400 border-pink-400/30 bg-pink-400/10'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400 border-gray-400/30 bg-gray-400/10';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'text-red-500 font-bold',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Comprehensive Facility Design Report Builder
        </h1>
        <p className="text-gray-400">
          Select from all facility systems: lighting, irrigation, structural, HVAC, benching, automation, and more
        </p>
      </div>

      {/* Quick Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Facility Design Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(FACILITY_TEMPLATES).map(([id, template]) => (
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
            Select All Systems
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
            placeholder="Search facility systems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
          <div className="text-green-400 font-semibold">
            {totalSections} systems selected
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

      {/* Systems Grid */}
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
                        {section.priority}
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
              
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Outputs:</div>
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

              {section.dependencies && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Requires:</div>
                  <div className="text-xs text-orange-400">
                    {section.dependencies.join(', ')}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 italic">
                {section.preview}
              </div>
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
          Generate Facility Report ({totalSections} systems)
        </button>
      </div>
    </div>
  );
}