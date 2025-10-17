'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Copy, 
  Check,
  Terminal,
  FileCode,
  Lightbulb,
  AlertCircle,
  Info,
  CheckCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function DocumentationContent() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('introduction');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'typescript', id }: { code: string; language?: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  const Note = ({ type = 'info', children }: { type?: 'info' | 'warning' | 'success' | 'tip'; children: React.ReactNode }) => {
    const styles = {
      info: { bg: 'bg-blue-900/20', border: 'border-blue-500/50', icon: Info, iconColor: 'text-blue-400' },
      warning: { bg: 'bg-yellow-900/20', border: 'border-yellow-500/50', icon: AlertCircle, iconColor: 'text-yellow-400' },
      success: { bg: 'bg-green-900/20', border: 'border-green-500/50', icon: CheckCircle, iconColor: 'text-green-400' },
      tip: { bg: 'bg-purple-900/20', border: 'border-purple-500/50', icon: Lightbulb, iconColor: 'text-purple-400' }
    };

    const { bg, border, icon: Icon, iconColor } = styles[type];

    return (
      <div className={`${bg} ${border} border rounded-lg p-4 my-4`}>
        <div className="flex gap-3">
          <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="text-sm text-gray-300">{children}</div>
        </div>
      </div>
    );
  };

  const sections: DocSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to VibeLux Documentation</h1>
          
          <p className="text-gray-300 leading-relaxed">
            VibeLux is a comprehensive controlled environment agriculture (CEA) platform that combines 
            advanced lighting design, energy optimization, and cultivation management tools. This documentation 
            will guide you through every aspect of the platform.
          </p>

          <Note type="tip">
            New to VibeLux? Start with our <a href="#quick-start" className="text-purple-400 hover:text-purple-300">Quick Start Guide</a> to 
            get up and running in minutes.
          </Note>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-white mb-3">For Growers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Energy cost optimization (20-30% savings)</li>
                <li>• Real-time monitoring and alerts</li>
                <li>• Professional calculators and tools</li>
                <li>• Multi-facility management</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-white mb-3">For Consultants</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• CAD integration (60+ formats)</li>
                <li>• AI-powered design optimization</li>
                <li>• Professional reporting tools</li>
                <li>• Client collaboration features</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Start Guide</h2>
          
          <p className="text-gray-300">
            Follow these steps to get started with VibeLux in just 5 minutes:
          </p>

          <ol className="space-y-6">
            <li>
              <h3 className="font-semibold text-white mb-2">1. Create Your Account</h3>
              <p className="text-gray-400 mb-3">
                Sign up for a free account at <a href="/sign-up" className="text-purple-400 hover:text-purple-300">vibelux.ai/sign-up</a>. 
                Credit card required for the 14-day trial.
              </p>
              <Note type="info">
                Pro tip: Use your company email to automatically get access to team features.
              </Note>
            </li>

            <li>
              <h3 className="font-semibold text-white mb-2">2. Set Up Your First Facility</h3>
              <p className="text-gray-400 mb-3">
                Click "Add Facility" and enter your basic information:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 ml-4">
                <li>Facility name and location</li>
                <li>Facility type (greenhouse, indoor, vertical farm)</li>
                <li>Growing area square footage</li>
                <li>Primary crops</li>
              </ul>
            </li>

            <li>
              <h3 className="font-semibold text-white mb-2">3. Connect Your Sensors (Optional)</h3>
              <p className="text-gray-400 mb-3">
                VibeLux supports 100+ sensor types. Common integrations:
              </p>
              <CodeBlock 
                id="sensor-config"
                code={`// Example sensor configuration
{
  "sensors": [
    {
      "type": "environmental_sensor",
      "protocol": "standard_protocol",
      "endpoint": "facility/zone1/data"
    },
    {
      "type": "light_sensor",
      "protocol": "network_protocol",
      "address": "sensor_network_address"
    }
  ]
}`}
              />
            </li>

            <li>
              <h3 className="font-semibold text-white mb-2">4. Import or Design Your Layout</h3>
              <p className="text-gray-400 mb-3">
                Two options to get started:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">Import CAD Files</h4>
                  <p className="text-sm text-gray-400">
                    Drag and drop DWG, RVT, IFC, or 60+ other formats
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">Use Designer</h4>
                  <p className="text-sm text-gray-400">
                    Draw your facility layout with our intuitive tools
                  </p>
                </div>
              </div>
            </li>

            <li>
              <h3 className="font-semibold text-white mb-2">5. Start Optimizing</h3>
              <p className="text-gray-400 mb-3">
                Access your dashboard to see:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 ml-4">
                <li>Real-time energy consumption</li>
                <li>Environmental conditions</li>
                <li>Optimization recommendations</li>
                <li>Cost savings opportunities</li>
              </ul>
            </li>
          </ol>

          <Note type="success">
            Congratulations! You\'re now ready to start saving energy and optimizing your grow. 
            Check out the <a href="#features" className="text-purple-400 hover:text-purple-300">Features Overview</a> to 
            learn about all available tools.
          </Note>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features Overview',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Platform Features</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">🎯 Control Center</h3>
              <p className="text-gray-400 mb-4">
                Your unified command center for facility operations:
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Real-time monitoring of all sensors and systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Automated alerts for out-of-range conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Remote control of lights, HVAC, and irrigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Historical data analysis and trending</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">💡 Lighting Design Studio</h3>
              <p className="text-gray-400 mb-4">
                Professional-grade lighting design with AI assistance:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">CAD Integration</h4>
                  <p className="text-sm text-gray-400">
                    Import AutoCAD, Revit, SketchUp, and 60+ formats. Automatic room detection 
                    and dimension extraction.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Light Distribution Analysis</h4>
                  <p className="text-sm text-gray-400">
                    Advanced light mapping with 3D visualization. Optimize for uniformity 
                    and target coverage.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Equipment Library</h4>
                  <p className="text-sm text-gray-400">
                    Extensive equipment database with manufacturer specifications and efficiency ratings.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Energy Analysis</h4>
                  <p className="text-sm text-gray-400">
                    Calculate energy costs, ROI, and payback period. Compare multiple design options.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📊 Professional Calculators</h3>
              <p className="text-gray-400 mb-4">
                25+ professional calculators for optimal facility management:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'VPD Calculator',
                  'DLI Calculator',
                  'EC/pH Manager',
                  'Heat Load Calculator',
                  'ROI Calculator',
                  'Energy Estimator',
                  'Nutrient Calculator',
                  'CO2 Calculator'
                ].map((calc) => (
                  <div key={calc} className="bg-gray-800/50 px-3 py-2 rounded text-sm text-gray-300">
                    {calc}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">⚡ Energy Optimization</h3>
              <p className="text-gray-400 mb-4">
                Significant energy cost reduction through intelligent optimization:
              </p>
              <Note type="success">
                Typical facilities achieve substantial monthly savings through:
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Smart demand management</li>
                  <li>Intelligent scheduling</li>
                  <li>Automated response systems</li>
                  <li>Equipment efficiency optimization</li>
                </ul>
              </Note>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">API Documentation</h2>
          
          <p className="text-gray-300">
            The VibeLux API allows you to programmatically access all platform features. 
            Build custom integrations, automate workflows, and extend functionality.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Authentication</h3>
              <p className="text-gray-400 mb-3">
                All API requests require authentication using Bearer tokens:
              </p>
              <CodeBlock 
                id="auth-example"
                code={`// Get your API key from Settings > API Keys
const headers = {
  'Authorization': 'Bearer vl_live_abc123...',
  'Content-Type': 'application/json'
};`}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Base URL</h3>
              <CodeBlock 
                id="base-url"
                code={`https://api.vibelux.ai/v1`}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Core Endpoints</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">GET</span>
                    <code className="text-sm text-gray-300">/facilities</code>
                  </div>
                  <p className="text-sm text-gray-400">List all facilities in your account</p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">POST</span>
                    <code className="text-sm text-gray-300">/facilities/{id}/readings</code>
                  </div>
                  <p className="text-sm text-gray-400">Submit sensor readings</p>
                  <CodeBlock 
                    id="readings-example"
                    code={`// Example request body
{
  "timestamp": "2024-01-17T10:30:00Z",
  "environmental_data": {
    "temperature": 24.5,
    "humidity": 65,
    "air_quality": 800,
    "light_intensity": 650
  }
}`}
                  />
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">GET</span>
                    <code className="text-sm text-gray-300">/analytics/energy</code>
                  </div>
                  <p className="text-sm text-gray-400">Get energy consumption analytics</p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">PUT</span>
                    <code className="text-sm text-gray-300">/controls/{deviceId}</code>
                  </div>
                  <p className="text-sm text-gray-400">Control devices remotely</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Rate Limits</h3>
              <Note type="warning">
                API rate limits vary by plan:
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Free: 100 requests/hour</li>
                  <li>Pro: 1,000 requests/hour</li>
                  <li>Enterprise: Unlimited</li>
                </ul>
              </Note>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">SDKs & Libraries</h3>
              <p className="text-gray-400 mb-3">
                Official SDKs available for popular languages:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { lang: 'JavaScript', cmd: 'npm install @vibelux/sdk' },
                  { lang: 'Python', cmd: 'pip install vibelux' },
                  { lang: 'Go', cmd: 'go get github.com/vibelux/go-sdk' },
                  { lang: 'Ruby', cmd: 'gem install vibelux' }
                ].map((sdk) => (
                  <div key={sdk.lang} className="bg-gray-800/50 p-3 rounded-lg">
                    <h4 className="font-medium text-white text-sm mb-1">{sdk.lang}</h4>
                    <code className="text-xs text-gray-400">{sdk.cmd}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">🌱 Cultivation Best Practices</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Environmental Monitoring</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Monitor environmental parameters within optimal ranges</li>
                    <li>• Track key environmental indicators regularly</li>
                    <li>• Maintain consistent environmental conditions</li>
                    <li>• Set alerts for parameter deviations from targets</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Lighting Management</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Measure light levels at canopy level regularly</li>
                    <li>• Adjust fixture positioning as needed</li>
                    <li>• Maintain fixtures for optimal performance</li>
                    <li>• Track appropriate light targets for different crops</li>
                  </ul>
                </div>

                <Note type="tip">
                  Pro tip: Use the light transition features to simulate natural lighting patterns. 
                  This reduces plant stress and can improve overall plant health and productivity.
                </Note>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">💰 Energy Optimization</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Peak Demand Management</h4>
                  <p className="text-gray-400 mb-2">
                    Reduce peak demand charges with these optimization strategies:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400 ml-4">
                    <li>Stagger equipment startup sequences</li>
                    <li>Use automated load management during peak periods</li>
                    <li>Implement thermal management strategies</li>
                    <li>Participate in utility optimization programs</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Time-of-Use Optimization</h4>
                  <CodeBlock 
                    id="tou-schedule"
                    code={`// Example scheduling configuration
{
  "schedule": {
    "low_cost_period": {
      "hours": "22:00-06:00",
      "operations": ["water_systems", "air_management", "climate_control"]
    },
    "high_cost_period": {
      "hours": "14:00-20:00", 
      "operations": ["reduced_operations", "passive_systems"]
    }
  }
}`}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📊 Data Management</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Sensor Calibration</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Calibrate quantum sensors every 6 months</li>
                    <li>• Verify temperature/humidity sensors quarterly</li>
                    <li>• Cross-reference with handheld meters</li>
                    <li>• Document calibration dates in VibeLux</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Data Retention</h4>
                  <Note type="info">
                    VibeLux retains data based on your plan:
                    <ul className="list-disc list-inside mt-2 ml-4">
                      <li>Free: 30 days</li>
                      <li>Pro: 1 year</li>
                      <li>Enterprise: Unlimited</li>
                    </ul>
                    Export important data regularly for long-term storage.
                  </Note>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Guide</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Common Issues</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">Sensors Not Reporting Data</h4>
                  <p className="text-sm text-gray-400 mb-3">If your sensors stop sending data:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li>Check network connectivity (ping sensor IP)</li>
                    <li>Verify sensor power supply</li>
                    <li>Check VibeLux sensor configuration matches device settings</li>
                    <li>Review firewall rules for MQTT/Modbus ports</li>
                    <li>Test with sensor manufacturer\'s software</li>
                  </ol>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">Inaccurate PPFD Readings</h4>
                  <p className="text-sm text-gray-400 mb-3">For lighting calculation issues:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li>Verify fixture IES files are up to date</li>
                    <li>Check fixture mounting height is accurate</li>
                    <li>Confirm room dimensions and reflectance values</li>
                    <li>Ensure fixture depreciation factor is set (typically 0.9)</li>
                  </ul>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">High Energy Costs Despite Optimization</h4>
                  <p className="text-sm text-gray-400 mb-3">Review these areas:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li>Check utility rate schedule is correctly configured</li>
                    <li>Verify demand response events are being honored</li>
                    <li>Review equipment runtime reports for anomalies</li>
                    <li>Confirm HVAC setpoints aren\'t fighting each other</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Error Messages</h3>
              
              <div className="space-y-3">
                <div className="bg-gray-900 p-3 rounded font-mono text-sm">
                  <span className="text-red-400">ERROR: API rate limit exceeded</span>
                  <p className="text-gray-400 mt-1 font-sans">
                    Solution: Upgrade plan or optimize API calls using batch requests
                  </p>
                </div>

                <div className="bg-gray-900 p-3 rounded font-mono text-sm">
                  <span className="text-red-400">ERROR: Insufficient credits for AI analysis</span>
                  <p className="text-gray-400 mt-1 font-sans">
                    Solution: Purchase additional AI credits or wait for monthly reset
                  </p>
                </div>

                <div className="bg-gray-900 p-3 rounded font-mono text-sm">
                  <span className="text-red-400">ERROR: CAD file format not supported</span>
                  <p className="text-gray-400 mt-1 font-sans">
                    Solution: Convert to DWG/DXF or use our CAD conversion service
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Getting Help</h3>
              <Note type="tip">
                Still need help? Contact our support team:
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Email: support@vibelux.ai</li>
                  <li>Live Chat: Available Mon-Fri 9am-5pm EST</li>
                  <li>Knowledge Base: docs.vibelux.ai</li>
                  <li>Community Forum: community.vibelux.ai</li>
                </ul>
              </Note>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Documentation
            </h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="font-medium text-white mb-2">Need Help?</h4>
              <p className="text-sm text-gray-400 mb-3">
                Can\'t find what you\'re looking for?
              </p>
              <a 
                href="/contact" 
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Contact Support
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 prose prose-invert max-w-none">
          {sections.find(s => s.id === activeSection)?.content}
        </main>
      </div>
    </div>
  );
}