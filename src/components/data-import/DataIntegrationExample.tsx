'use client';

import { useState } from 'react';
import { ChevronRight, Database, BarChart3, Brain, Zap, FileSpreadsheet, Calculator } from 'lucide-react';

interface IntegrationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
  details: string[];
}

export default function DataIntegrationExample() {
  const [activeStep, setActiveStep] = useState(0);

  const integrationSteps: IntegrationStep[] = [
    {
      id: 'import',
      title: 'Smart Data Import',
      description: 'Upload your cultivation data with intelligent parsing and cleaning',
      icon: <FileSpreadsheet className="w-6 h-6" />,
      status: activeStep > 0 ? 'completed' : activeStep === 0 ? 'active' : 'pending',
      details: [
        'Upload Excel files from Priva, Argus, TrolMaster systems',
        'Automatic detection of cultivation parameters',
        'Data quality assessment and cleaning',
        'Equipment-specific format handling'
      ]
    },
    {
      id: 'processing',
      title: 'Data Processing Pipeline',
      description: 'Transform raw data into structured, ML-ready datasets',
      icon: <Database className="w-6 h-6" />,
      status: activeStep > 1 ? 'completed' : activeStep === 1 ? 'active' : 'pending',
      details: [
        'Intelligent type inference and conversion',
        'Unit standardization (°C, kPa, μmol/m²/s)',
        'Missing value imputation',
        'Outlier detection and handling'
      ]
    },
    {
      id: 'analysis',
      title: 'Real-time Analysis',
      description: 'Feed processed data into existing VibeLux calculators',
      icon: <Calculator className="w-6 h-6" />,
      status: activeStep > 2 ? 'completed' : activeStep === 2 ? 'active' : 'pending',
      details: [
        'Automatic parameter detection for fertilizer formulation',
        'Environmental data for VPD calculations',
        'Yield data for ROI analysis',
        'Energy consumption for lighting calculations'
      ]
    },
    {
      id: 'visualization',
      title: 'Data Visualization',
      description: 'Generate insights through advanced charts and metrics',
      icon: <BarChart3 className="w-6 h-6" />,
      status: activeStep > 3 ? 'completed' : activeStep === 3 ? 'active' : 'pending',
      details: [
        'Time-series environmental plots',
        'Correlation analysis between parameters',
        'Yield prediction confidence intervals',
        'Cost-benefit analysis dashboards'
      ]
    },
    {
      id: 'ml',
      title: 'Machine Learning',
      description: 'Train predictive models for optimization recommendations',
      icon: <Brain className="w-6 h-6" />,
      status: activeStep > 4 ? 'completed' : activeStep === 4 ? 'active' : 'pending',
      details: [
        'Yield prediction models',
        'Quality optimization algorithms',
        'Environmental control suggestions',
        'Anomaly detection systems'
      ]
    },
    {
      id: 'optimization',
      title: 'Automated Optimization',
      description: 'Apply ML insights to optimize cultivation operations',
      icon: <Zap className="w-6 h-6" />,
      status: activeStep > 5 ? 'completed' : activeStep === 5 ? 'active' : 'pending',
      details: [
        'Automated fertilizer recipe adjustments',
        'Dynamic lighting schedule optimization',
        'Environmental setpoint recommendations',
        'Harvest timing predictions'
      ]
    }
  ];

  const getStatusColor = (status: IntegrationStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-400 text-white';
      case 'active': return 'bg-blue-500 border-blue-400 text-white';
      default: return 'bg-gray-700 border-gray-600 text-gray-400';
    }
  };

  const getConnectorColor = (fromStatus: IntegrationStep['status'], toStatus: IntegrationStep['status']) => {
    if (fromStatus === 'completed') return 'bg-green-500';
    if (fromStatus === 'active' && toStatus === 'pending') return 'bg-gradient-to-r from-blue-500 to-gray-600';
    return 'bg-gray-600';
  };

  const exampleData = {
    'import': {
      title: 'Raw Greenhouse Data',
      content: `Temperature_Air_Avg,Humidity_RH_Avg,PPFD_Avg,CO2_Avg,VPD_Calc
23.5,65.2,850,1200,1.2
24.1,68.4,920,1180,1.1
22.8,71.2,780,1150,0.9`
    },
    'processing': {
      title: 'Processed & Cleaned Data',
      content: `air_temperature_celsius,relative_humidity_percent,ppfd_umol_m2_s,co2_concentration_ppm,vpd_kpa
23.5,65.2,850,1200,1.20
24.1,68.4,920,1180,1.10
22.8,71.2,780,1150,0.90`
    },
    'analysis': {
      title: 'Calculator Integration',
      content: `✓ Environmental Calculator: VPD = 1.1 kPa (optimal)
✓ Lighting Calculator: PPFD = 850 μmol/m²/s (efficient)
✓ CO2 Calculator: 1200 ppm (enhanced photosynthesis)
✓ Climate Control: Temperature variance = 1.3°C (stable)`
    },
    'visualization': {
      title: 'Generated Insights',
      content: `📈 Temperature trend: +0.8°C over 24h
📊 VPD correlation with yield: r² = 0.85
🎯 Optimal PPFD range: 800-950 μmol/m²/s
💰 Energy efficiency: 2.1 μmol/J (excellent)`
    },
    'ml': {
      title: 'ML Model Predictions',
      content: `🎯 Yield Prediction: 2.4 kg/m² (±0.2 kg/m²)
🌱 Quality Score: 94/100 (premium grade)
⚠️ Risk Assessment: Low disease pressure
📅 Harvest Window: 7-10 days optimal`
    },
    'optimization': {
      title: 'Automated Recommendations',
      content: `🌡️ Reduce night temperature by 1°C for better DIF
💡 Increase PPFD to 950 μmol/m²/s during peak hours
💨 Adjust ventilation to maintain VPD at 1.0-1.2 kPa
🧪 Increase EC by 0.1 mS/cm for enhanced fruit development`
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          From Raw Data to Smart Cultivation
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          See how our smart data importer transforms messy Excel files into actionable cultivation insights through VibeLux's integrated platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Process Flow */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-6">Integration Pipeline</h3>
          
          {integrationSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(step.status)} ${
                  activeStep === index ? 'ring-2 ring-blue-400/50' : ''
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm opacity-90 mt-1">{step.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                </div>
                
                {activeStep === index && (
                  <div className="mt-4 pt-4 border-t border-current/20">
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="text-sm flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Connector */}
              {index < integrationSteps.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className={`w-1 h-6 rounded-full ${
                    getConnectorColor(step.status, integrationSteps[index + 1].status)
                  }`}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Preview */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white mb-6">Live Data Preview</h3>
          
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              {integrationSteps[activeStep].icon}
              <h4 className="font-semibold text-white">
                {exampleData[integrationSteps[activeStep].id as keyof typeof exampleData].title}
              </h4>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-line">
              {exampleData[integrationSteps[activeStep].id as keyof typeof exampleData].content}
            </div>
          </div>

          {/* Integration Benefits */}
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg border border-blue-500/20 p-6">
            <h4 className="font-semibold text-white mb-4">Integration Benefits</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">95% time reduction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Automated quality control</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time insights</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Predictive analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300">Error prevention</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">Seamless workflow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Try Smart Data Import
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              View Integration Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}