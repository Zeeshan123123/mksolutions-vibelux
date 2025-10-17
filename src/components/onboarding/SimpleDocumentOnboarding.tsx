'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  FileText, 
  Upload, 
  Users, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Zap,
  Shield,
  Play,
  Book,
  Settings,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  component: React.ReactNode;
  estimated_time: string;
}

interface UserSelection {
  useCase: string;
  teamSize: string;
  documentTypes: string[];
  currentPain: string;
  goals: string[];
}

export function SimpleDocumentOnboarding() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<UserSelection>({
    useCase: '',
    teamSize: '',
    documentTypes: [],
    currentPain: '',
    goals: []
  });

  const handleSelection = (key: keyof UserSelection, value: string | string[]) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayToggle = (key: keyof UserSelection, value: string) => {
    const currentArray = selections[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setSelections(prev => ({ ...prev, [key]: newArray }));
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Professional Document Management',
      subtitle: 'Let\'s get you set up in under 5 minutes',
      description: 'We\'ll create a personalized experience based on your needs.',
      estimated_time: '30 seconds',
      component: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hi {user?.firstName || 'there'}! 👋</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Let's set up your document management system so it works perfectly for your team.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>5 minutes setup</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure & private</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'use-case',
      title: 'What\'s your primary use case?',
      subtitle: 'This helps us recommend the right features',
      description: 'Choose the option that best describes how you\'ll use document management.',
      estimated_time: '30 seconds',
      component: (
        <div className="space-y-4">
          {[
            { 
              id: 'cultivation', 
              title: 'Cultivation & Growing Operations', 
              description: 'SOPs, safety protocols, cultivation guides',
              icon: <Zap className="w-6 h-6 text-green-600" />
            },
            { 
              id: 'compliance', 
              title: 'Quality & Compliance', 
              description: 'Audit trails, change approvals, regulatory docs',
              icon: <Shield className="w-6 h-6 text-blue-600" />
            },
            { 
              id: 'team-docs', 
              title: 'Team Documentation', 
              description: 'Policies, procedures, training materials',
              icon: <Users className="w-6 h-6 text-purple-600" />
            },
            { 
              id: 'other', 
              title: 'Other Business Documents', 
              description: 'General business documentation needs',
              icon: <FileText className="w-6 h-6 text-orange-600" />
            }
          ].map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selections.useCase === option.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => handleSelection('useCase', option.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{option.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{option.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  {selections.useCase === option.id && (
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: 'team-size',
      title: 'How big is your team?',
      subtitle: 'This helps us configure collaboration features',
      description: 'Select your current team size.',
      estimated_time: '15 seconds',
      component: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'solo', title: 'Just Me', description: '1 person', icon: '👤' },
            { id: 'small', title: 'Small Team', description: '2-10 people', icon: '👥' },
            { id: 'medium', title: 'Growing Team', description: '11-50 people', icon: '🏢' },
            { id: 'large', title: 'Large Team', description: '50+ people', icon: '🏬' }
          ].map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selections.teamSize === option.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => handleSelection('teamSize', option.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{option.icon}</div>
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
                {selections.teamSize === option.id && (
                  <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mt-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: 'document-types',
      title: 'What types of documents will you manage?',
      subtitle: 'Select all that apply',
      description: 'This helps us set up the right categories and templates.',
      estimated_time: '30 seconds',
      component: (
        <div className="grid grid-cols-2 gap-3">
          {[
            'Standard Operating Procedures (SOPs)',
            'Safety Protocols',
            'Training Materials',
            'Policies & Procedures',
            'Quality Control Checklists',
            'Compliance Documentation',
            'Technical Specifications',
            'Meeting Notes & Reports'
          ].map((docType) => (
            <Card 
              key={docType}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selections.documentTypes.includes(docType) ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => handleArrayToggle('documentTypes', docType)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{docType}</span>
                  {selections.documentTypes.includes(docType) && (
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: 'pain-points',
      title: 'What\'s your biggest document challenge?',
      subtitle: 'We\'ll prioritize solving this first',
      description: 'Choose your main pain point so we can help you solve it immediately.',
      estimated_time: '20 seconds',
      component: (
        <div className="space-y-3">
          {[
            { 
              id: 'version-confusion', 
              title: 'Version Confusion', 
              description: 'Too many versions, don\'t know which is current',
              icon: '🔄'
            },
            { 
              id: 'team-conflicts', 
              title: 'Team Editing Conflicts', 
              description: 'People overwrite each other\'s changes',
              icon: '⚔️'
            },
            { 
              id: 'security-concerns', 
              title: 'Security & Access Control', 
              description: 'Need better control over who sees what',
              icon: '🔒'
            },
            { 
              id: 'compliance-tracking', 
              title: 'Compliance & Audit Trails', 
              description: 'Need to track changes for audits',
              icon: '📋'
            },
            { 
              id: 'document-scattered', 
              title: 'Documents Everywhere', 
              description: 'Files scattered across different systems',
              icon: '📁'
            }
          ].map((pain) => (
            <Card 
              key={pain.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selections.currentPain === pain.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => handleSelection('currentPain', pain.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pain.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{pain.title}</h3>
                    <p className="text-sm text-gray-600">{pain.description}</p>
                  </div>
                  {selections.currentPain === pain.id && (
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: 'setup-complete',
      title: 'Perfect! Your workspace is ready',
      subtitle: 'Here\'s what we\'ve set up for you',
      description: 'Take a quick tour or dive right in.',
      estimated_time: '1 minute',
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All Set! 🎉</h2>
            <p className="text-gray-600">
              Your document management system is configured and ready to use.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">What we set up based on your answers:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Document categories for {selections.useCase}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Collaboration features for {selections.teamSize} team</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Templates for {selections.documentTypes.length} document types</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Priority solution for {selections.currentPain}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Take 2-Minute Tour
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload First Document
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Need help getting started?</p>
            <div className="flex justify-center gap-4 text-sm">
              <button className="text-purple-600 hover:underline flex items-center gap-1">
                <Book className="w-4 h-4" />
                Quick Start Guide
              </button>
              <button className="text-purple-600 hover:underline flex items-center gap-1">
                <Users className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome
      case 1: return selections.useCase !== ''; // Use case
      case 2: return selections.teamSize !== ''; // Team size
      case 3: return selections.documentTypes.length > 0; // Document types
      case 4: return selections.currentPain !== ''; // Pain points
      default: return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {currentStepData.estimated_time}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
          <p className="text-gray-600">{currentStepData.subtitle}</p>
          {currentStepData.description && (
            <p className="text-sm text-gray-500 mt-2">{currentStepData.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {currentStepData.component}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {!isLastStep && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(steps.length - 1)}
            >
              Skip Setup
            </Button>
          )}
          
          <Button
            onClick={() => {
              if (isLastStep) {
                // Handle completion - redirect to dashboard
                window.location.href = '/dashboard';
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {isLastStep ? 'Go to Dashboard' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          Need help? <button className="text-purple-600 hover:underline">Contact support</button> or{' '}
          <button className="text-purple-600 hover:underline">schedule a demo</button>
        </p>
      </div>
    </div>
  );
}