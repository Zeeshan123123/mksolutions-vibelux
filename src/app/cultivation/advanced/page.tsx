'use client';

import { useState } from 'react';
import {
  Shield,
  Flame,
  Wind,
  Brain,
  Bug,
  FlaskConical,
  FileCheck,
  Building2,
  Network,
  Gauge,
  ChevronRight,
  Settings,
  Activity
} from 'lucide-react';

// Import all advanced cultivation components
import { IPMLightManagement } from '@/components/cultivation/IPMLightManagement';
import { LightBurnPreventionSystem } from '@/components/cultivation/LightBurnPreventionSystem';
import { AirflowLightingIntegration } from '@/components/cultivation/AirflowLightingIntegration';
import { AdvancedQualityPrediction } from '@/components/cultivation/AdvancedQualityPrediction';
import { StrainLightRecipeLibrary } from '@/components/cultivation/StrainLightRecipeLibrary';
import { RecipeExecutionWizard } from '@/components/cultivation/RecipeExecutionWizard';
import { RecipeMonitor } from '@/components/cultivation/RecipeMonitor';
import { RegulatoryComplianceAutomation } from '@/components/cultivation/RegulatoryComplianceAutomation';
import { CultivationFinancialPlanning } from '@/components/cultivation/CultivationFinancialPlanning';
import { FacilityDesignValidation } from '@/components/cultivation/FacilityDesignValidation';
import { MultiSiteSynchronization } from '@/components/cultivation/MultiSiteSynchronization';
import { DualUnitCostDisplay } from '@/components/cultivation/DualUnitCostDisplay';

type AdvancedTabType = 
  | 'ipm' 
  | 'burn-prevention' 
  | 'airflow' 
  | 'quality' 
  | 'strain-library' 
  | 'execution' 
  | 'monitor' 
  | 'compliance' 
  | 'financial' 
  | 'validation' 
  | 'multi-site' 
  | 'cost-display';

export default function AdvancedCultivationPage() {
  const [activeTab, setActiveTab] = useState<AdvancedTabType>('ipm');

  const advancedTabs = [
    {
      id: 'ipm' as AdvancedTabType,
      label: 'IPM Light Management',
      icon: Bug,
      description: 'Integrated Pest Management with targeted light spectra',
      component: <IPMLightManagement />
    },
    {
      id: 'burn-prevention' as AdvancedTabType,
      label: 'Light Burn Prevention',
      icon: Flame,
      description: 'Automated system to prevent light burn damage',
      component: <LightBurnPreventionSystem 
        currentConditions={{
          ppfd: 800,
          airTemp: 75,
          humidity: 65,
          co2: 1200
        }}
        plantData={{
          species: 'Cannabis sativa',
          growthStage: 'vegetative',
          daysUnderLight: 14
        }}
      />
    },
    {
      id: 'airflow' as AdvancedTabType,
      label: 'Airflow Integration',
      icon: Wind,
      description: 'Integrated airflow and lighting optimization',
      component: <AirflowLightingIntegration />
    },
    {
      id: 'quality' as AdvancedTabType,
      label: 'Quality Prediction',
      icon: Brain,
      description: 'AI-powered crop quality predictions',
      component: <AdvancedQualityPrediction />
    },
    {
      id: 'strain-library' as AdvancedTabType,
      label: 'Strain Recipe Library',
      icon: FlaskConical,
      description: 'Comprehensive strain-specific light recipes',
      component: <StrainLightRecipeLibrary />
    },
    {
      id: 'execution' as AdvancedTabType,
      label: 'Recipe Execution',
      icon: Activity,
      description: 'Step-by-step recipe execution wizard',
      component: <RecipeExecutionWizard 
        onClose={() => console.log('wizard closed')}
        onStart={(config) => console.log('wizard started:', config)}
      />
    },
    {
      id: 'monitor' as AdvancedTabType,
      label: 'Recipe Monitor',
      icon: Gauge,
      description: 'Real-time recipe monitoring and alerts',
      component: <RecipeMonitor />
    },
    {
      id: 'compliance' as AdvancedTabType,
      label: 'Regulatory Compliance',
      icon: FileCheck,
      description: 'Automated compliance tracking and reporting',
      component: <RegulatoryComplianceAutomation />
    },
    {
      id: 'financial' as AdvancedTabType,
      label: 'Financial Planning',
      icon: Shield,
      description: 'Cultivation financial planning and analysis',
      component: <CultivationFinancialPlanning />
    },
    {
      id: 'validation' as AdvancedTabType,
      label: 'Design Validation',
      icon: Building2,
      description: 'Facility design validation and optimization',
      component: <FacilityDesignValidation />
    },
    {
      id: 'multi-site' as AdvancedTabType,
      label: 'Multi-Site Sync',
      icon: Network,
      description: 'Synchronize settings across multiple facilities',
      component: <MultiSiteSynchronization />
    }
  ];

  const currentTab = advancedTabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Advanced Cultivation Systems</h1>
              <p className="text-gray-400">Professional-grade cultivation management tools</p>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Advanced Features</h3>
              <nav className="space-y-2">
                {advancedTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{tab.label}</div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Feature Info Card */}
            <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Pro Tip</h4>
              <p className="text-sm text-gray-400">
                These advanced features integrate seamlessly with your main cultivation dashboard 
                for comprehensive grow management.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {currentTab && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{currentTab.label}</h2>
                  <p className="text-gray-400">{currentTab.description}</p>
                </div>
                <div className="space-y-6">
                  {currentTab.component}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}