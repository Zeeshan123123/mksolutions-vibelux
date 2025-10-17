'use client';

import React, { useState } from 'react';
import { FileText, Building, Calculator, Zap, Clock, User, Download, Eye, Settings } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { logger } from '@/lib/client-logger';

interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  type: 'lighting' | 'hvac' | 'electrical' | 'full_facility' | 'retrofit' | 'consulting';
  sections: ProposalSection[];
}

interface ProposalSection {
  id: string;
  title: string;
  type: 'executive_summary' | 'scope_of_work' | 'technical_specs' | 'drawings' | 
        'cost_breakdown' | 'timeline' | 'warranty' | 'terms' | 'appendices';
  required: boolean;
  customizable: boolean;
  dataSources: string[];
}

interface ProposalConfig {
  template: ProposalTemplate;
  clientInfo: {
    name: string;
    contact: string;
    address: string;
    projectName: string;
    projectType: string;
  };
  projectDetails: {
    facility: string;
    scope: string;
    timeline: string;
    budget?: string;
    specialRequirements: string[];
  };
  includedSections: string[];
  customSections: Array<{
    title: string;
    content: string;
    position: number;
  }>;
  branding: {
    logo: string;
    companyInfo: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export function ProposalGenerationSystem() {
  const { state } = useDesigner();
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [proposalConfig, setProposalConfig] = useState<Partial<ProposalConfig>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const proposalTemplates: ProposalTemplate[] = [
    {
      id: 'lighting_design_proposal',
      name: 'Lighting Design Proposal',
      description: 'Complete horticultural lighting system design and installation proposal',
      type: 'lighting',
      sections: [
        {
          id: 'executive_summary',
          title: 'Executive Summary',
          type: 'executive_summary',
          required: true,
          customizable: true,
          dataSources: ['project_overview', 'key_benefits', 'roi_summary']
        },
        {
          id: 'facility_analysis',
          title: 'Facility Analysis & Requirements',
          type: 'technical_specs',
          required: true,
          customizable: false,
          dataSources: ['facility_dimensions', 'crop_requirements', 'environmental_conditions']
        },
        {
          id: 'lighting_design',
          title: 'Lighting System Design',
          type: 'technical_specs',
          required: true,
          customizable: false,
          dataSources: ['ppfd_calculations', 'fixture_specifications', 'uniformity_analysis']
        },
        {
          id: 'technical_drawings',
          title: 'Technical Drawings & Layouts',
          type: 'drawings',
          required: true,
          customizable: false,
          dataSources: ['floor_plans', 'electrical_diagrams', 'mounting_details']
        },
        {
          id: 'electrical_design',
          title: 'Electrical Infrastructure',
          type: 'technical_specs',
          required: true,
          customizable: false,
          dataSources: ['circuit_design', 'panel_schedules', 'conduit_routing']
        },
        {
          id: 'energy_analysis',
          title: 'Energy Consumption & ROI Analysis',
          type: 'technical_specs',
          required: true,
          customizable: true,
          dataSources: ['energy_modeling', 'cost_comparison', 'payback_analysis']
        },
        {
          id: 'scope_of_work',
          title: 'Scope of Work & Deliverables',
          type: 'scope_of_work',
          required: true,
          customizable: true,
          dataSources: ['installation_scope', 'project_phases', 'deliverables_list']
        },
        {
          id: 'cost_breakdown',
          title: 'Investment & Cost Breakdown',
          type: 'cost_breakdown',
          required: true,
          customizable: true,
          dataSources: ['equipment_costs', 'installation_costs', 'engineering_fees']
        },
        {
          id: 'project_timeline',
          title: 'Project Timeline & Milestones',
          type: 'timeline',
          required: true,
          customizable: true,
          dataSources: ['project_schedule', 'critical_path', 'milestone_dates']
        },
        {
          id: 'warranty_support',
          title: 'Warranty & Support Services',
          type: 'warranty',
          required: true,
          customizable: true,
          dataSources: ['warranty_terms', 'support_services', 'maintenance_plans']
        },
        {
          id: 'terms_conditions',
          title: 'Terms & Conditions',
          type: 'terms',
          required: true,
          customizable: false,
          dataSources: ['contract_terms', 'payment_schedule', 'legal_clauses']
        },
        {
          id: 'appendices',
          title: 'Technical Appendices',
          type: 'appendices',
          required: false,
          customizable: true,
          dataSources: ['spec_sheets', 'certifications', 'reference_projects']
        }
      ]
    },
    {
      id: 'full_facility_proposal',
      name: 'Complete Facility Design Proposal',
      description: 'Comprehensive facility design including lighting, HVAC, electrical, and controls',
      type: 'full_facility',
      sections: [
        // All lighting sections plus:
        {
          id: 'hvac_design',
          title: 'HVAC System Design',
          type: 'technical_specs',
          required: true,
          customizable: false,
          dataSources: ['hvac_calculations', 'equipment_selection', 'ductwork_design']
        },
        {
          id: 'environmental_controls',
          title: 'Environmental Control Systems',
          type: 'technical_specs',
          required: true,
          customizable: false,
          dataSources: ['control_strategy', 'sensor_placement', 'automation_logic']
        },
        {
          id: 'irrigation_design',
          title: 'Irrigation System Design',
          type: 'technical_specs',
          required: false,
          customizable: true,
          dataSources: ['irrigation_layout', 'water_requirements', 'fertigation_system']
        },
        {
          id: 'structural_requirements',
          title: 'Structural Requirements',
          type: 'technical_specs',
          required: false,
          customizable: true,
          dataSources: ['load_calculations', 'mounting_requirements', 'building_modifications']
        }
      ]
    },
    {
      id: 'retrofit_proposal',
      name: 'Facility Retrofit Proposal',
      description: 'Upgrade existing facility with modern systems and controls',
      type: 'retrofit',
      sections: [
        {
          id: 'existing_assessment',
          title: 'Existing System Assessment',
          type: 'technical_specs',
          required: true,
          customizable: false,
          dataSources: ['current_conditions', 'deficiency_analysis', 'upgrade_opportunities']
        },
        {
          id: 'retrofit_design',
          title: 'Retrofit Design & Improvements',
          type: 'technical_specs',
          required: true,
          customizable: false,
          dataSources: ['new_design', 'integration_plan', 'performance_improvements']
        },
        {
          id: 'implementation_plan',
          title: 'Implementation Strategy',
          type: 'scope_of_work',
          required: true,
          customizable: true,
          dataSources: ['phased_approach', 'downtime_minimization', 'risk_mitigation']
        }
      ]
    }
  ];

  const generateProposal = async () => {
    if (!selectedTemplate || !proposalConfig.clientInfo) return;

    setIsGenerating(true);
    try {
      // Collect all design data from current state
      const designData = {
        facilities: state.facilities,
        fixtures: state.fixtures,
        calculations: state.calculations,
        costs: state.costs,
        electrical: state.electrical,
        environmental: state.environmental
      };

      // Generate proposal sections based on template and design data
      const proposalData = await generateProposalContent(
        selectedTemplate,
        proposalConfig as ProposalConfig,
        designData
      );

      // Create PDF or DOCX based on user preference
      await exportProposal(proposalData, 'pdf');
      
    } catch (error) {
      logger.error('system', 'Proposal generation failed:', error );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Professional Proposal Generator
        </h2>
        <p className="text-gray-600 mb-6">
          Generate comprehensive project proposals with technical specifications, drawings, 
          and cost analysis based on your design.
        </p>

        {/* Template Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Proposal Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposalTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center mb-2">
                  {template.type === 'lighting' && <Zap className="w-5 h-5 mr-2 text-yellow-500" />}
                  {template.type === 'full_facility' && <Building className="w-5 h-5 mr-2 text-blue-500" />}
                  {template.type === 'retrofit' && <Settings className="w-5 h-5 mr-2 text-gray-500" />}
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {template.sections.length} sections included
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Information Form */}
        {selectedTemplate && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Client & Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="ABC Growing Company"
                  value={proposalConfig.clientInfo?.name || ''}
                  onChange={(e) => setProposalConfig(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo!, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Facility Lighting Upgrade"
                  value={proposalConfig.clientInfo?.projectName || ''}
                  onChange={(e) => setProposalConfig(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo!, projectName: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="John Smith, Facilities Manager"
                  value={proposalConfig.clientInfo?.contact || ''}
                  onChange={(e) => setProposalConfig(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo!, contact: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123 Farm Road, City, State"
                  value={proposalConfig.clientInfo?.address || ''}
                  onChange={(e) => setProposalConfig(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo!, address: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section Configuration */}
        {selectedTemplate && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Proposal Sections</h3>
            <div className="space-y-2">
              {selectedTemplate.sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proposalConfig.includedSections?.includes(section.id) ?? section.required}
                      disabled={section.required}
                      onChange={(e) => {
                        const included = proposalConfig.includedSections || [];
                        setProposalConfig(prev => ({
                          ...prev,
                          includedSections: e.target.checked
                            ? [...included, section.id]
                            : included.filter(id => id !== section.id)
                        }));
                      }}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{section.title}</div>
                      {section.required && (
                        <div className="text-xs text-gray-500">Required</div>
                      )}
                    </div>
                  </div>
                  {section.customizable && (
                    <button className="text-blue-600 hover:text-blue-800">
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation Controls */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            Proposal will include current design data, calculations, and drawings
          </div>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              disabled={!selectedTemplate}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={generateProposal}
              disabled={!selectedTemplate || !proposalConfig.clientInfo?.name || isGenerating}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
async function generateProposalContent(
  template: ProposalTemplate, 
  config: ProposalConfig,
  designData: any
) {
  // This would integrate with our existing report generation system
  // and pull data from the current design state
  
  const sections = template.sections
    .filter(section => 
      section.required || 
      config.includedSections.includes(section.id)
    )
    .map(section => generateSectionContent(section, designData, config));

  return {
    metadata: {
      title: `${config.clientInfo.projectName} - Proposal`,
      client: config.clientInfo.name,
      date: new Date().toLocaleDateString(),
      version: '1.0'
    },
    sections
  };
}

function generateSectionContent(section: ProposalSection, designData: any, config: ProposalConfig) {
  // Generate content based on section type and available design data
  switch (section.type) {
    case 'executive_summary':
      return generateExecutiveSummary(designData, config);
    case 'technical_specs':
      return generateTechnicalSpecs(section, designData);
    case 'drawings':
      return generateDrawingsSection(designData);
    case 'cost_breakdown':
      return generateCostBreakdown(designData);
    case 'timeline':
      return generateTimelineSection(config);
    default:
      return generateGenericSection(section, designData);
  }
}

function generateExecutiveSummary(designData: any, config: ProposalConfig) {
  return {
    title: 'Executive Summary',
    content: `
      This proposal outlines a comprehensive lighting solution for ${config.clientInfo.name}'s 
      ${config.clientInfo.projectName}. Our design delivers optimal growing conditions while 
      maximizing energy efficiency and crop yields.
      
      Key Benefits:
      - Optimized PPFD distribution for uniform plant growth
      - Energy-efficient LED technology reducing operating costs
      - Professional installation and commissioning
      - Comprehensive warranty and support
    `
  };
}

function generateTechnicalSpecs(section: ProposalSection, designData: any) {
  // Pull technical data from the design system
  return {
    title: section.title,
    specifications: extractTechnicalData(designData, section.dataSources)
  };
}

function generateDrawingsSection(designData: any) {
  return {
    title: 'Technical Drawings & Layouts',
    drawings: [
      'Facility Layout Plan',
      'Fixture Placement Plan', 
      'Electrical Diagram',
      'Mounting Details',
      'PPFD Distribution Map'
    ]
  };
}

function generateCostBreakdown(designData: any) {
  return {
    title: 'Investment Analysis',
    costs: extractCostData(designData)
  };
}

function generateTimelineSection(config: ProposalConfig) {
  return {
    title: 'Project Timeline',
    phases: [
      { name: 'Design Finalization', duration: '1-2 weeks' },
      { name: 'Equipment Procurement', duration: '2-4 weeks' },
      { name: 'Installation', duration: '1-2 weeks' },
      { name: 'Commissioning & Testing', duration: '1 week' }
    ]
  };
}

function generateGenericSection(section: ProposalSection, designData: any) {
  return {
    title: section.title,
    content: `This section would be populated with relevant data from: ${section.dataSources.join(', ')}`
  };
}

function extractTechnicalData(designData: any, dataSources: string[]) {
  // Extract relevant technical specifications from design data
  return {};
}

function extractCostData(designData: any) {
  // Extract cost information from design calculations
  return {};
}

async function exportProposal(proposalData: any, format: 'pdf' | 'docx') {
  // Use existing export systems to generate final document
  logger.info('system', 'Exporting proposal:', { data: proposalData });
}