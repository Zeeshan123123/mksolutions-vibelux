'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  Zap,
  Settings,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Target,
  AlertTriangle,
  FileText,
  Play,
  Edit,
  Copy,
  Trash2,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Building,
  Lightbulb,
  Wind,
  Factory,
  Wrench,
  Hammer
} from 'lucide-react';
import { ProjectTemplateEngine } from '@/lib/project-management/project-template-engine';
import type {
  ProjectTemplate,
  ProjectType,
  Project
} from '@/lib/project-management/project-types';

interface ProjectTemplateSelectorProps {
  onTemplateSelected?: (template: ProjectTemplate) => void;
  onProjectCreated?: (project: Project) => void;
  onCancel?: () => void;
}

interface TemplateRequirements {
  projectType: ProjectType;
  systemCapacity: {
    electrical: number;
    thermal: number;
  };
  facilityType: string;
  complexity: 'simple' | 'moderate' | 'complex';
  budget: number;
  timeline: number;
  clientPreferences: {
    fastTrack: boolean;
    qualityFocus: boolean;
    costOptimized: boolean;
  };
  specialRequirements: string[];
}

interface ProjectDetails {
  name: string;
  clientInfo: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  startDate: Date;
  budget: number;
}

export function ProjectTemplateSelector({
  onTemplateSelected,
  onProjectCreated,
  onCancel
}: ProjectTemplateSelectorProps) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Type, 2: Configure, 3: Review
  const [availableTemplates, setAvailableTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');
  
  const [requirements, setRequirements] = useState<TemplateRequirements>({
    projectType: 'cogeneration',
    systemCapacity: {
      electrical: 330,
      thermal: 450
    },
    facilityType: 'Manufacturing Facility',
    complexity: 'moderate',
    budget: 850000,
    timeline: 20, // weeks
    clientPreferences: {
      fastTrack: false,
      qualityFocus: false,
      costOptimized: false
    },
    specialRequirements: []
  });

  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: '',
    clientInfo: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: ''
    },
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    budget: 850000
  });

  // Load available templates
  useEffect(() => {
    const templates = ProjectTemplateEngine.getAvailableTemplates();
    setAvailableTemplates(templates);
  }, []);

  // Filter templates
  const filteredTemplates = availableTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const getProjectTypeIcon = (type: ProjectType) => {
    const icons = {
      cogeneration: Factory,
      lighting_design: Lightbulb,
      hvac_design: Wind,
      facility_design: Building,
      retrofit: Wrench,
      maintenance: Hammer
    };
    const Icon = icons[type] || Building;
    return <Icon className="w-6 h-6" />;
  };

  const getProjectTypeColor = (type: ProjectType): string => {
    const colors = {
      cogeneration: 'bg-blue-100 text-blue-800',
      lighting_design: 'bg-yellow-100 text-yellow-800',
      hvac_design: 'bg-green-100 text-green-800',
      facility_design: 'bg-purple-100 text-purple-800',
      retrofit: 'bg-orange-100 text-orange-800',
      maintenance: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityColor = (complexity: string): string => {
    const colors = {
      simple: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      complex: 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setRequirements(prev => ({ ...prev, projectType: template.type }));
    setCurrentStep(2);
  };

  const handleGenerateCustomTemplate = async () => {
    setIsGenerating(true);
    
    try {
      // Generate custom template based on requirements
      const customTemplate = ProjectTemplateEngine.generateTemplate(requirements, {
        includeOptionalTasks: true,
        addBufferTime: !requirements.clientPreferences.fastTrack,
        enableRiskMitigation: true,
        generateDetailedSpecs: requirements.clientPreferences.qualityFocus,
        includeTraining: true
      });
      
      setSelectedTemplate(customTemplate);
      setCurrentStep(3);
    } catch (error) {
      logger.error('system', 'Failed to generate template:', error );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    
    try {
      // Create project from template
      const project = await ProjectTemplateEngine.createProjectFromTemplate(
        selectedTemplate,
        projectDetails
      );
      
      if (onProjectCreated) {
        onProjectCreated(project);
      }
    } catch (error) {
      logger.error('system', 'Failed to create project:', error );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Project Template Selector
            </h2>
            <p className="text-gray-600 mt-1">
              Choose a template or create a custom project plan
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4">
            {[
              { num: 1, name: 'Select Template' },
              { num: 2, name: 'Configure Project' },
              { num: 3, name: 'Review & Create' }
            ].map((step) => (
              <div key={step.num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.num 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.num ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.num
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-700">{step.name}</span>
                {step.num < 3 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Template Selection */}
      {currentStep === 1 && (
        <div className="p-6">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ProjectType | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="cogeneration">Cogeneration</option>
              <option value="lighting_design">Lighting</option>
              <option value="hvac_design">HVAC</option>
              <option value="facility_design">Facility</option>
              <option value="retrofit">Retrofit</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {getProjectTypeIcon(template.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getProjectTypeColor(template.type)}`}>
                        {template.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                    {template.complexity.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {template.estimatedDuration} days
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FileText className="w-4 h-4 mr-2" />
                    {template.tasks.length} tasks
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Target className="w-4 h-4 mr-2" />
                    {template.phases.length} phases
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    Multi-role
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Select Template
                </button>
              </div>
            ))}
          </div>

          {/* Custom Template Option */}
          <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Custom Template
            </h3>
            <p className="text-gray-600 mb-4">
              Generate a customized project template based on your specific requirements
            </p>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Custom
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 2 && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Requirements */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Requirements</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type
                </label>
                <select
                  value={requirements.projectType}
                  onChange={(e) => setRequirements(prev => ({ ...prev, projectType: e.target.value as ProjectType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cogeneration">Cogeneration System</option>
                  <option value="lighting_design">Lighting Design</option>
                  <option value="hvac_design">HVAC Design</option>
                  <option value="facility_design">Facility Design</option>
                  <option value="retrofit">Energy Retrofit</option>
                  <option value="maintenance">Maintenance Program</option>
                </select>
              </div>

              {requirements.projectType === 'cogeneration' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Electrical Capacity (kW)
                    </label>
                    <input
                      type="number"
                      value={requirements.systemCapacity.electrical}
                      onChange={(e) => setRequirements(prev => ({
                        ...prev,
                        systemCapacity: { ...prev.systemCapacity, electrical: Number(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thermal Capacity (kW)
                    </label>
                    <input
                      type="number"
                      value={requirements.systemCapacity.thermal}
                      onChange={(e) => setRequirements(prev => ({
                        ...prev,
                        systemCapacity: { ...prev.systemCapacity, thermal: Number(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Type
                </label>
                <input
                  type="text"
                  value={requirements.facilityType}
                  onChange={(e) => setRequirements(prev => ({ ...prev, facilityType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Manufacturing Facility, Hospital, Office Building"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Complexity
                </label>
                <select
                  value={requirements.complexity}
                  onChange={(e) => setRequirements(prev => ({ ...prev, complexity: e.target.value as 'simple' | 'moderate' | 'complex' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="simple">Simple - Standard installation</option>
                  <option value="moderate">Moderate - Some customization required</option>
                  <option value="complex">Complex - Extensive customization and integration</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={requirements.budget}
                    onChange={(e) => setRequirements(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline (weeks)
                  </label>
                  <input
                    type="number"
                    value={requirements.timeline}
                    onChange={(e) => setRequirements(prev => ({ ...prev, timeline: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Client Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Client Preferences
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={requirements.clientPreferences.fastTrack}
                      onChange={(e) => setRequirements(prev => ({
                        ...prev,
                        clientPreferences: { ...prev.clientPreferences, fastTrack: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Fast Track Schedule</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={requirements.clientPreferences.qualityFocus}
                      onChange={(e) => setRequirements(prev => ({
                        ...prev,
                        clientPreferences: { ...prev.clientPreferences, qualityFocus: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Quality Focus (Extended QA/QC)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={requirements.clientPreferences.costOptimized}
                      onChange={(e) => setRequirements(prev => ({
                        ...prev,
                        clientPreferences: { ...prev.clientPreferences, costOptimized: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cost Optimized Approach</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectDetails.name}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Company
                </label>
                <input
                  type="text"
                  value={projectDetails.clientInfo.companyName}
                  onChange={(e) => setProjectDetails(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo, companyName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Client company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={projectDetails.clientInfo.contactPerson}
                    onChange={(e) => setProjectDetails(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, contactPerson: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={projectDetails.clientInfo.email}
                    onChange={(e) => setProjectDetails(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={projectDetails.startDate.toISOString().split('T')[0]}
                    onChange={(e) => setProjectDetails(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Budget ($)
                  </label>
                  <input
                    type="number"
                    value={projectDetails.budget}
                    onChange={(e) => setProjectDetails(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Template Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Estimated Duration:</span>
                    <div className="font-medium text-gray-900">
                      {Math.ceil(requirements.timeline * 7 * (requirements.complexity === 'simple' ? 0.8 : requirements.complexity === 'complex' ? 1.4 : 1))} days
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimated Tasks:</span>
                    <div className="font-medium text-gray-900">
                      {requirements.complexity === 'simple' ? '8-12' : requirements.complexity === 'complex' ? '20-30' : '12-18'} tasks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && selectedTemplate && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Review Generated Template</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">{selectedTemplate.name}</h4>
                <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedTemplate.estimatedDuration}</div>
                    <div className="text-sm text-gray-600">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedTemplate.phases.length}</div>
                    <div className="text-sm text-gray-600">Phases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedTemplate.tasks.length}</div>
                    <div className="text-sm text-gray-600">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">${(projectDetails.budget / 1000).toFixed(0)}k</div>
                    <div className="text-sm text-gray-600">Budget</div>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Project Phases</h5>
                <div className="space-y-3">
                  {selectedTemplate.phases.map((phase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h6 className="font-medium text-gray-900">{phase.name}</h6>
                        <span className="text-sm text-gray-600">
                          {Math.ceil((selectedTemplate.estimatedDuration * phase.durationPercent) / 100)} days
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Summary */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-3">Project Summary</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-700">Name:</span>
                    <div className="font-medium text-blue-900">{projectDetails.name || 'Unnamed Project'}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Client:</span>
                    <div className="font-medium text-blue-900">{projectDetails.clientInfo.companyName || 'TBD'}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Start Date:</span>
                    <div className="font-medium text-blue-900">{projectDetails.startDate.toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Budget:</span>
                    <div className="font-medium text-blue-900">${projectDetails.budget.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-3">Template Features</h5>
                <ul className="space-y-1 text-sm text-green-800">
                  {requirements.clientPreferences.fastTrack && (
                    <li>✓ Fast-track schedule optimization</li>
                  )}
                  {requirements.clientPreferences.qualityFocus && (
                    <li>✓ Enhanced quality assurance</li>
                  )}
                  {requirements.clientPreferences.costOptimized && (
                    <li>✓ Cost optimization measures</li>
                  )}
                  <li>✓ Risk mitigation planning</li>
                  <li>✓ Automated task dependencies</li>
                  <li>✓ Resource allocation framework</li>
                  <li>✓ Progress tracking setup</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={isGenerating}
              >
                Cancel
              </button>
            )}
            
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={isGenerating}
              >
                Back
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep === 2 && (
              <button
                onClick={handleGenerateCustomTemplate}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 inline mr-2" />
                    Generate Template
                  </>
                )}
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleCreateProject}
                disabled={isGenerating || !projectDetails.name || !projectDetails.clientInfo.companyName}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-2" />
                    Create Project
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}