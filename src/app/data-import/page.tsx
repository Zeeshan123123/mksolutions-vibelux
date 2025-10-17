'use client';

import SmartDataImporter from '@/components/data-import/SmartDataImporter';
import type { SmartImportResult } from '@/app/api/data/smart-import/route';

export default function DataImportPage() {
  const handleImportComplete = (result: SmartImportResult) => {
    console.log('Import completed:', result);
    // In a real app, you might:
    // - Save the data to a database
    // - Navigate to a data analysis page
    // - Show a success notification
    // - Trigger ML pipeline processing
  };

  const handleError = (error: string) => {
    console.error('Import error:', error);
    // In a real app, you might:
    // - Show error notification
    // - Log to error tracking service
    // - Provide troubleshooting suggestions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                Smart Data Importer
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Transform your messy cultivation data into clean, ML-ready datasets with our intelligent parsing system.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Equipment-specific parsing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Intelligent data cleaning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Quality assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>ML-ready output</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-12">
          <SmartDataImporter
            onImportComplete={handleImportComplete}
            onError={handleError}
            allowedFileTypes={['.xlsx', '.xls', '.csv']}
            maxFileSize={50}
            cultivationContext={{
              facilityType: 'greenhouse',
              measurementUnits: 'metric'
            }}
          />
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Advanced Data Processing Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our smart importer goes beyond simple file upload to provide comprehensive data preparation for cultivation analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔧',
                title: 'Equipment-Specific Parsing',
                description: 'Automatically detect and handle data from Priva, Argus, TrolMaster, and other cultivation control systems.',
                features: ['Format detection', 'Unit conversion', 'Field mapping', 'Vendor-specific handling']
              },
              {
                icon: '🧹',
                title: 'Intelligent Data Cleaning',
                description: 'Advanced algorithms clean messy data, handle mixed types, and standardize formats.',
                features: ['Missing value imputation', 'Outlier detection', 'Type inference', 'Format standardization']
              },
              {
                icon: '📊',
                title: 'Quality Assessment',
                description: 'Comprehensive data quality scoring with detailed recommendations for improvement.',
                features: ['Completeness scoring', 'Consistency analysis', 'Validity checking', 'Issue identification']
              },
              {
                icon: '🎯',
                title: 'Cultivation Parameter Recognition',
                description: 'Automatically identify and validate cultivation-specific parameters like VPD, PPFD, and more.',
                features: ['Parameter detection', 'Range validation', 'Unit recognition', 'Relationship mapping']
              },
              {
                icon: '📈',
                title: 'ML Pipeline Integration',
                description: 'Seamlessly connect cleaned data to machine learning models for predictive analytics.',
                features: ['Feature engineering', 'Data splitting', 'Model training', 'Performance metrics']
              },
              {
                icon: '💾',
                title: 'Export & Integration',
                description: 'Export processed data in multiple formats or integrate directly with existing systems.',
                features: ['Multiple export formats', 'API integration', 'Data versioning', 'Backup creation']
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((feat, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Formats */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Supported Data Formats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="text-4xl">📊</div>
                <h4 className="font-semibold text-white">Excel Files</h4>
                <p className="text-sm text-gray-400">
                  .xlsx, .xls with support for multiple sheets, formulas, and complex layouts
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-4xl">📋</div>
                <h4 className="font-semibold text-white">CSV Files</h4>
                <p className="text-sm text-gray-400">
                  Comma-separated values with automatic delimiter detection and encoding handling
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-4xl">🔗</div>
                <h4 className="font-semibold text-white">API Integration</h4>
                <p className="text-sm text-gray-400">
                  Direct integration with cultivation management systems and IoT platforms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}