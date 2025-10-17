'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/client-logger';
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Target,
  Settings,
  Play,
  Download,
  Share,
  Eye,
  Edit,
  Zap
} from 'lucide-react';
import type { CogenerationProposal } from '@/lib/proposals/cogeneration-proposal-generator';
import type { Project } from '@/lib/project-management/project-types';
import { convertProposalToProject, type ProposalConversionOptions } from '@/lib/project-management/proposal-to-project-converter';

interface ProposalToProjectIntegrationProps {
  proposal: CogenerationProposal;
  onProjectCreated?: (project: Project) => void;
  onCancel?: () => void;
}

interface ConversionStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  details?: string[];
}

export function ProposalToProjectIntegration({
  proposal,
  onProjectCreated,
  onCancel
}: ProposalToProjectIntegrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionOptions, setConversionOptions] = useState<ProposalConversionOptions>({
    autoAssignResources: true,
    includeContingency: true,
    generateDetailedTasks: true,
    createClientAccess: false,
    enableNotifications: true,
    projectStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Start in 1 week
  });
  
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([
    {
      id: 'analyze',
      name: 'Analyze Proposal',
      description: 'Extract project requirements and specifications',
      status: 'pending',
      duration: 2,
      details: [
        'Parse proposal structure and content',
        'Extract equipment specifications',
        'Identify project scope and requirements'
      ]
    },
    {
      id: 'structure',
      name: 'Create Project Structure',
      description: 'Generate project phases, tasks, and milestones',
      status: 'pending',
      duration: 3,
      details: [
        'Create project phases (Engineering, Procurement, Installation, Commissioning)',
        'Generate detailed task breakdown',
        'Define project milestones and dependencies'
      ]
    },
    {
      id: 'resources',
      name: 'Allocate Resources',
      description: 'Assign team members and calculate resource requirements',
      status: 'pending',
      duration: 2,
      details: [
        'Auto-assign team members based on skills',
        'Calculate resource requirements',
        'Set up project budget and cost tracking'
      ]
    },
    {
      id: 'risks',
      name: 'Assess Risks',
      description: 'Identify and categorize project risks',
      status: 'pending',
      duration: 1,
      details: [
        'Identify technical and schedule risks',
        'Set up risk mitigation plans',
        'Configure risk monitoring alerts'
      ]
    },
    {
      id: 'finalize',
      name: 'Finalize Project',
      description: 'Complete project setup and validation',
      status: 'pending',
      duration: 1,
      details: [
        'Validate project configuration',
        'Generate initial reports',
        'Set up project dashboards'
      ]
    }
  ]);

  const [conversionResult, setConversionResult] = useState<{
    project?: Project;
    warnings: string[];
    recommendations: string[];
    nextSteps: string[];
  } | null>(null);

  const updateStepStatus = (stepId: string, status: ConversionStep['status']) => {
    setConversionSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const simulateStepProcessing = async (step: ConversionStep): Promise<void> => {
    updateStepStatus(step.id, 'processing');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, (step.duration || 1) * 1000));
    
    updateStepStatus(step.id, 'completed');
  };

  const handleStartConversion = async () => {
    setIsConverting(true);
    setCurrentStep(0);

    try {
      // Process each step
      for (let i = 0; i < conversionSteps.length; i++) {
        setCurrentStep(i);
        await simulateStepProcessing(conversionSteps[i]);
      }

      // Perform actual conversion
      const result = await convertProposalToProject(proposal, conversionOptions);
      setConversionResult(result);

      // All steps completed
      setCurrentStep(conversionSteps.length);
      setIsConverting(false);

      if (onProjectCreated && result.project) {
        onProjectCreated(result.project);
      }

    } catch (error) {
      logger.error('system', 'Conversion failed:', error );
      updateStepStatus(conversionSteps[currentStep].id, 'error');
      setIsConverting(false);
    }
  };

  const getStepIcon = (step: ConversionStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (step.status === 'processing') {
      return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    } else if (step.status === 'error') {
      return <AlertTriangle className="w-6 h-6 text-red-600" />;
    } else if (index <= currentStep) {
      return <Clock className="w-6 h-6 text-yellow-600" />;
    } else {
      return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getProgressPercentage = () => {
    if (!isConverting && conversionResult) return 100;
    if (!isConverting) return 0;
    
    const completedSteps = conversionSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / conversionSteps.length) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Convert Proposal to Project
            </h2>
            <p className="text-gray-600 mt-1">
              Transform your approved proposal into a comprehensive project management plan
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {proposal.metadata.preparedFor.companyName}
              </div>
              <div className="text-sm text-gray-600">
                Proposal #{proposal.metadata.proposalNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Conversion Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      {!isConverting && !conversionResult && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Start Date
                </label>
                <input
                  type="date"
                  value={conversionOptions.projectStartDate?.toISOString().split('T')[0]}
                  onChange={(e) => setConversionOptions(prev => ({
                    ...prev,
                    projectStartDate: new Date(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={conversionOptions.autoAssignResources}
                  onChange={(e) => setConversionOptions(prev => ({
                    ...prev,
                    autoAssignResources: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-assign team members</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={conversionOptions.generateDetailedTasks}
                  onChange={(e) => setConversionOptions(prev => ({
                    ...prev,
                    generateDetailedTasks: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Generate detailed task breakdown</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={conversionOptions.includeContingency}
                  onChange={(e) => setConversionOptions(prev => ({
                    ...prev,
                    includeContingency: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include budget contingency</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={conversionOptions.createClientAccess}
                  onChange={(e) => setConversionOptions(prev => ({
                    ...prev,
                    createClientAccess: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Create client portal access</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={conversionOptions.enableNotifications}
                  onChange={(e) => setConversionOptions(prev => ({
                    ...prev,
                    enableNotifications: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable project notifications</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Steps */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Process</h3>
        
        <div className="space-y-4">
          {conversionSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-4 p-4 rounded-lg border transition-all ${
                step.status === 'completed' ? 'bg-green-50 border-green-200' :
                step.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                step.status === 'error' ? 'bg-red-50 border-red-200' :
                index <= currentStep ? 'bg-yellow-50 border-yellow-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Step Icon */}
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step, index)}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{step.name}</h4>
                  {step.status === 'processing' && (
                    <span className="text-sm text-blue-600 font-medium">Processing...</span>
                  )}
                  {step.status === 'completed' && (
                    <span className="text-sm text-green-600 font-medium">Completed</span>
                  )}
                  {step.status === 'error' && (
                    <span className="text-sm text-red-600 font-medium">Error</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                
                {/* Step Details */}
                {(step.status === 'processing' || step.status === 'completed') && step.details && (
                  <div className="mt-2">
                    <ul className="text-xs text-gray-500 space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {conversionResult && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Conversion Complete</h3>
          </div>

          {/* Project Summary */}
          {conversionResult.project && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-900 mb-3">Project Created Successfully</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Project Name:</span>
                  <div className="font-medium text-green-900">{conversionResult.project.name}</div>
                </div>
                <div>
                  <span className="text-green-700">Total Tasks:</span>
                  <div className="font-medium text-green-900">{conversionResult.project.tasks.length}</div>
                </div>
                <div>
                  <span className="text-green-700">Project Duration:</span>
                  <div className="font-medium text-green-900">
                    {Math.ceil((conversionResult.project.plannedEndDate.getTime() - conversionResult.project.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {conversionResult.warnings.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Warnings
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {conversionResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {conversionResult.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Recommendations
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {conversionResult.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {conversionResult.nextSteps.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Next Steps
              </h4>
              <ol className="text-sm text-purple-800 space-y-1">
                {conversionResult.nextSteps.map((step, index) => (
                  <li key={index}>{index + 1}. {step}</li>
                ))}
              </ol>
            </div>
          )}
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
                disabled={isConverting}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {!isConverting && !conversionResult && (
              <>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  <Eye className="w-4 h-4 inline mr-2" />
                  Preview
                </button>
                <button
                  onClick={handleStartConversion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Start Conversion
                </button>
              </>
            )}

            {conversionResult && (
              <>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Project
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Launch Project
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}