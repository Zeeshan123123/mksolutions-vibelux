'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  CheckCircle, 
  Clock, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  estimatedTime: string;
  sections: string[];
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  preview: string;
}

const templates: Template[] = [
  {
    id: 'led-cultivation-sop',
    title: 'LED Cultivation Standard Operating Procedure',
    description: 'Complete SOP template for LED-based plant cultivation including safety protocols, setup procedures, and maintenance schedules.',
    category: 'cultivation',
    industry: 'Cannabis/Hemp',
    estimatedTime: '30 minutes',
    sections: [
      'Safety Requirements',
      'Equipment Setup',
      'Daily Operations',
      'Maintenance Schedule',
      'Troubleshooting',
      'Quality Control',
      'Emergency Procedures'
    ],
    features: ['Version Control', 'Approval Workflow', 'Safety Checklists'],
    difficulty: 'intermediate',
    popularity: 95,
    preview: `# LED Cultivation Standard Operating Procedure

## 1. Safety Requirements
- Personal protective equipment (PPE) requirements
- Electrical safety protocols
- Chemical handling procedures
- Emergency contact information

## 2. Equipment Setup
- Pre-operation inspection checklist
- Lighting configuration standards
- Environmental control settings
- Documentation requirements

## 3. Daily Operations
- Morning inspection routine
- Light cycle management
- Environmental monitoring
- Record keeping procedures`
  },
  {
    id: 'safety-emergency-procedures',
    title: 'Facility Safety & Emergency Response',
    description: 'Critical safety protocols and emergency response procedures for cultivation facilities.',
    category: 'safety',
    industry: 'All Industries',
    estimatedTime: '45 minutes',
    sections: [
      'Risk Assessment',
      'Prevention Measures',
      'Emergency Contacts',
      'Evacuation Procedures',
      'Incident Reporting',
      'First Aid Protocols',
      'Equipment Shutdown'
    ],
    features: ['Critical Access Control', 'Incident Tracking', 'Emergency Updates'],
    difficulty: 'advanced',
    popularity: 88,
    preview: `# Facility Safety & Emergency Response Procedures

## 1. Risk Assessment
- Identify potential hazards
- Assess risk levels
- Implement control measures
- Regular safety audits

## 2. Emergency Contacts
- Local emergency services: 911
- Facility manager: [PHONE]
- Safety officer: [PHONE]
- Corporate emergency line: [PHONE]

## 3. Evacuation Procedures
- Primary evacuation routes
- Assembly point locations
- Accountability procedures
- Communication protocols`
  },
  {
    id: 'quality-control-checklist',
    title: 'Product Quality Control Checklist',
    description: 'Comprehensive quality control procedures and testing protocols for consistent product standards.',
    category: 'quality',
    industry: 'Manufacturing',
    estimatedTime: '25 minutes',
    sections: [
      'Inspection Criteria',
      'Testing Procedures',
      'Documentation Standards',
      'Non-Conformance Handling',
      'Corrective Actions',
      'Training Requirements',
      'Supplier Quality'
    ],
    features: ['Quality Metrics', 'Test Result Tracking', 'Non-Conformance Reports'],
    difficulty: 'intermediate',
    popularity: 82,
    preview: `# Product Quality Control Checklist

## 1. Inspection Criteria
- Visual inspection standards
- Measurement tolerances
- Acceptable quality levels
- Sampling procedures

## 2. Testing Procedures
- Required tests by product type
- Testing equipment calibration
- Test result documentation
- Retest procedures

## 3. Documentation Standards
- Quality record requirements
- Traceability documentation
- Certificate of analysis
- Batch record maintenance`
  },
  {
    id: 'energy-efficiency-protocol',
    title: 'Energy Efficiency Optimization Protocol',
    description: 'Guidelines for optimizing energy consumption and reducing operational costs in cultivation facilities.',
    category: 'energy',
    industry: 'Cannabis/Hemp',
    estimatedTime: '35 minutes',
    sections: [
      'Energy Baseline Assessment',
      'Optimization Strategies',
      'Monitoring Procedures',
      'Cost-Benefit Analysis',
      'Implementation Schedule',
      'Performance Tracking',
      'Reporting Requirements'
    ],
    features: ['Energy Metrics', 'Cost Tracking', 'Efficiency Reports'],
    difficulty: 'advanced',
    popularity: 76,
    preview: `# Energy Efficiency Optimization Protocol

## 1. Energy Baseline Assessment
- Current consumption analysis
- Peak demand identification
- Equipment efficiency audit
- Cost breakdown analysis

## 2. Optimization Strategies
- Lighting schedule optimization
- HVAC system efficiency
- Automated control systems
- Load balancing techniques

## 3. Monitoring Procedures
- Real-time energy monitoring
- Daily consumption reports
- Efficiency KPI tracking
- Anomaly detection protocols`
  },
  {
    id: 'employee-training-manual',
    title: 'Employee Training & Onboarding Manual',
    description: 'Structured training program for new employees with competency assessments and certification tracking.',
    category: 'training',
    industry: 'All Industries',
    estimatedTime: '40 minutes',
    sections: [
      'Orientation Program',
      'Safety Training',
      'Job-Specific Skills',
      'Competency Assessment',
      'Certification Tracking',
      'Continuing Education',
      'Performance Evaluation'
    ],
    features: ['Progress Tracking', 'Certification Management', 'Skills Assessment'],
    difficulty: 'beginner',
    popularity: 91,
    preview: `# Employee Training & Onboarding Manual

## 1. Orientation Program
- Company overview and culture
- Facility tour and safety briefing
- Role and responsibilities
- Policy acknowledgment

## 2. Safety Training
- General safety requirements
- Hazard recognition
- Emergency procedures
- Personal protective equipment

## 3. Job-Specific Skills
- Equipment operation
- Standard procedures
- Quality requirements
- Documentation systems`
  },
  {
    id: 'compliance-audit-checklist',
    title: 'Regulatory Compliance Audit Checklist',
    description: 'Comprehensive audit checklist for regulatory compliance including documentation requirements and corrective actions.',
    category: 'compliance',
    industry: 'Cannabis/Hemp',
    estimatedTime: '50 minutes',
    sections: [
      'Regulatory Requirements',
      'Documentation Review',
      'Process Verification',
      'Record Keeping',
      'Corrective Actions',
      'Audit Trail',
      'Continuous Improvement'
    ],
    features: ['Compliance Tracking', 'Audit Trail', 'Regulatory Updates'],
    difficulty: 'advanced',
    popularity: 84,
    preview: `# Regulatory Compliance Audit Checklist

## 1. Regulatory Requirements
- Current regulations overview
- License requirements
- Reporting obligations
- Inspection readiness

## 2. Documentation Review
- Required records checklist
- Document retention policies
- Version control procedures
- Access control measures

## 3. Process Verification
- Procedure compliance check
- Training record verification
- Equipment calibration status
- Quality system effectiveness`
  }
];

const categories = [...new Set(templates.map(t => t.category))];
const industries = [...new Set(templates.map(t => t.industry))];

export function QuickStartTemplates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUseTemplate = (template: Template) => {
    // In a real implementation, this would create a new document from the template
    alert(`Creating new document from "${template.title}" template...`);
  };

  if (selectedTemplate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => setSelectedTemplate(null)}
          className="mb-6"
        >
          ← Back to Templates
        </Button>

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{selectedTemplate.title}</CardTitle>
                <p className="text-gray-600">{selectedTemplate.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                  <Badge variant="outline">{selectedTemplate.industry}</Badge>
                  <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                    {selectedTemplate.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{selectedTemplate.popularity}% match</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Copy className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                  <FileText className="w-4 h-4 mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Template Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Template Includes:</h4>
                  <ul className="space-y-1">
                    {selectedTemplate.sections.map((section, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{section}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                  <div className="space-y-1">
                    {selectedTemplate.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Setup Time</span>
                  </div>
                  <p className="text-blue-700">{selectedTemplate.estimatedTime} to customize and deploy</p>
                </div>
              </div>

              {/* Template Preview */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-4">Document Preview:</h4>
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {selectedTemplate.preview}
                  </pre>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-xs text-gray-500">
                      This is a preview of the template structure. The full template includes 
                      all {selectedTemplate.sections.length} sections with detailed procedures, 
                      checklists, and customizable fields.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quick Start Templates
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get up and running in minutes with industry-specific document templates. 
          Each template includes best practices, compliance guidelines, and professional formatting.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="mb-2">
                  {template.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{template.popularity}%</span>
                </div>
              </div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{template.estimatedTime}</span>
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>

                {/* Key Sections */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">Includes:</h4>
                  <div className="text-xs text-gray-600">
                    {template.sections.slice(0, 3).join(', ')}
                    {template.sections.length > 3 && ` +${template.sections.length - 3} more`}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.features.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                    }}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or browse all categories.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 text-center bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Need a Custom Template?</h3>
        <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
          Can't find what you're looking for? Our team can create custom templates 
          tailored to your specific industry and requirements.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            Request Custom Template
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}