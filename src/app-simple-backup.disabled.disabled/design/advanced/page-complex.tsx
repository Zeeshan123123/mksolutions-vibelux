'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Static imports to prevent chunk splitting
import { AdvancedDesignerProfessional } from '@/components/designer/AdvancedDesignerProfessional';
import { SimpleDesigner } from '@/components/designer/SimpleDesigner';
import { DesignOnboarding } from '@/components/designer/DesignOnboarding';
import { SmartGreenhouseSetupWizard } from '@/components/SmartGreenhouseSetupWizard';
import AIDesignCreditEstimator from '@/components/ai/AIDesignCreditEstimator';

// Loading component
const ComponentLoader = React.memo(() => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-white flex items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      Loading design tools...
    </div>
  </div>
));
import { useAuth } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';

interface DesignConfig {
  spaceType: 'indoor' | 'greenhouse' | 'aquaculture';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  unit: 'feet' | 'meters';
  includeCAD: boolean;
}

const AdvancedDesignerPage = React.memo(() => {
  const { isLoaded, userId } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSmartWizard, setShowSmartWizard] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [designConfig, setDesignConfig] = useState<DesignConfig | null>(null);
  const [useSimpleDesigner, setUseSimpleDesigner] = useState(false);
  const [userCredits, setUserCredits] = useState(120);

  // Skip onboarding if user has existing projects (in production, check from API)
  useEffect(() => {
    if (isLoaded && userId) {
      // In production, check if user has existing projects
      // For now, show onboarding for new sessions
      const hasExistingProjects = localStorage.getItem(`vibelux_projects_${userId}`);
      if (hasExistingProjects) {
        setShowOnboarding(false);
      }
    }
  }, [isLoaded, userId]);

  const handleOnboardingComplete = useCallback((config: DesignConfig) => {
    setDesignConfig(config);
    setShowOnboarding(false);
    
    // Save user preferences
    if (userId) {
      localStorage.setItem(`vibelux_projects_${userId}`, 'true');
      localStorage.setItem(`vibelux_last_config_${userId}`, JSON.stringify(config));
    }
  }, [userId]);

  const handleCADImport = useCallback(() => {
    // Handle CAD import functionality
    setShowOnboarding(false);
  }, []);

  const handleSkipOnboarding = useCallback(() => {
    // Set default configuration
    const defaultConfig: DesignConfig = {
      spaceType: 'indoor',
      dimensions: { length: 20, width: 12, height: 10 },
      unit: 'feet',
      includeCAD: false
    };
    setDesignConfig(defaultConfig);
    setShowOnboarding(false);
  }, []);

  const handleWizardComplete = useCallback((wizardConfig: any) => {
    // Transform wizard config to design config format
    const designConfig: DesignConfig = {
      spaceType: wizardConfig.type === 'indoor' ? 'indoor' : 'greenhouse',
      dimensions: wizardConfig.dimensions,
      unit: 'feet',
      includeCAD: false
    };
    
    setDesignConfig(designConfig);
    setShowOnboarding(false);
    setShowSmartWizard(false);
    
    // Save user preferences
    if (userId) {
      localStorage.setItem(`vibelux_projects_${userId}`, 'true');
      localStorage.setItem(`vibelux_last_config_${userId}`, JSON.stringify(designConfig));
      localStorage.setItem(`vibelux_selected_fixtures_${userId}`, JSON.stringify(wizardConfig.selectedFixtures));
    }
  }, [userId]);

  const handleAIDesignApply = useCallback((prompt: string, credits: number) => {
    console.log('AI Design requested:', prompt, 'for', credits, 'credits');
    
    // Update user credits
    setUserCredits(prev => prev - credits);
    
    // Here you would:
    // 1. Send prompt to Claude Opus 4
    // 2. Generate the design components
    // 3. Apply them to the current workspace
    
    // Close AI assistant after applying
    setShowAIAssistant(false);
    
    // Show notification or confirmation
    if (userId) {
      localStorage.setItem(`vibelux_ai_credits_${userId}`, String(userCredits - credits));
    }
  }, [userId, userCredits]);

  const handlePurchaseCredits = useCallback((packageName: string) => {
    console.log('Purchasing credits:', packageName);
    // Open Stripe checkout
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Advanced Design Studio
              </h1>
              <p className="text-gray-400">
                Let's set up your cultivation space design project
              </p>
            </div>
            
            <DesignOnboarding 
              onComplete={handleOnboardingComplete}
              onCADImport={handleCADImport}
            />
            
            <div className="text-center mt-8 space-y-4">
              <div className="flex justify-center gap-4">
                <button
                  onClick={useCallback(() => setShowSmartWizard(true), [])}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🪄 Smart Greenhouse Setup Wizard
                </button>
                <button
                  onClick={useCallback(() => {
                    setShowAIAssistant(true);
                    setShowOnboarding(false);
                  }, [])}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI Design Assistant
                </button>
              </div>
              <div>
                <button
                  onClick={handleSkipOnboarding}
                  className="text-gray-400 hover:text-white text-sm underline"
                >
                  Skip setup and start with default room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Memoized designer component selection
  const DesignerComponent = useMemo(() => {
    return useSimpleDesigner ? SimpleDesigner : AdvancedDesignerProfessional;
  }, [useSimpleDesigner]);

  const toggleDesignerMode = useCallback(() => {
    setUseSimpleDesigner(!useSimpleDesigner);
  }, [useSimpleDesigner]);

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={useCallback(() => setShowAIAssistant(true), [])}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded border border-purple-500 transition-colors flex items-center"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI Assistant
        </button>
        <button
          onClick={toggleDesignerMode}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded border border-gray-600 transition-colors"
        >
          {useSimpleDesigner ? 'Advanced Mode' : 'Simple Mode'}
        </button>
      </div>
      <DesignerComponent 
        initialSpaceType={designConfig?.spaceType}
        initialDimensions={designConfig?.dimensions}
        initialUnit={designConfig?.unit}
      />
      
      {/* Smart Greenhouse Setup Wizard */}
      {showSmartWizard && (
        <SmartGreenhouseSetupWizard
          isOpen={showSmartWizard}
          onClose={useCallback(() => setShowSmartWizard(false), [])}
          onComplete={handleWizardComplete}
        />
      )}
      
      {/* AI Design Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
            <button
              onClick={useCallback(() => setShowAIAssistant(false), [])}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="overflow-y-auto max-h-[90vh]">
              <AIDesignCreditEstimator
                userCredits={userCredits}
                onApplyDesign={handleAIDesignApply}
                onPurchaseCredits={handlePurchaseCredits}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AdvancedDesignerPage.displayName = 'AdvancedDesignerPage';

export default AdvancedDesignerPage;