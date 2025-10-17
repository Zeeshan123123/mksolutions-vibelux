"use client"

import { motion } from 'framer-motion'
import { 
  Building,
  Cloud,
  Database,
  Wifi,
  Server,
  Smartphone,
  Monitor,
  Package,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Camera,
  Gauge,
  Zap,
  DollarSign,
  FileText,
  Bell,
  Lock,
  Globe,
  Cpu,
  GitBranch,
  BarChart,
  Settings,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown
} from 'lucide-react'

const integrationCategories = [
  {
    title: 'Environmental Control',
    icon: Thermometer,
    color: 'from-orange-500 to-red-500',
    systems: [
      { name: 'Priva Connext', protocol: 'OPC-UA', bidirectional: true },
      { name: 'Argus Controls', protocol: 'Modbus TCP', bidirectional: true },
      { name: 'Hortimax', protocol: 'REST API', bidirectional: true },
      { name: 'Link4 iGrow', protocol: 'BACnet', bidirectional: true },
      { name: 'Wadsworth SEED', protocol: 'API (Read-Only)', bidirectional: false }
    ]
  },
  {
    title: 'Lighting Systems',
    icon: Sun,
    color: 'from-yellow-500 to-orange-500',
    systems: [
      { name: 'Fluence Bioengineering', protocol: 'HTTP API', bidirectional: true },
      { name: 'Gavita Controllers', protocol: 'Modbus RTU/GEC', bidirectional: true },
      { name: 'Arize Elements', protocol: '0-10V/Inventronics', bidirectional: true },
      { name: 'California Lightworks', protocol: 'HTTP API', bidirectional: false },
      { name: 'Heliospectra', protocol: 'HelioCORE API', bidirectional: true }
    ]
  },
  {
    title: 'Sensor Networks',
    icon: Wifi,
    color: 'from-blue-500 to-cyan-500',
    systems: [
      { name: '30MHz ZENSIE', protocol: 'LoRaWAN', bidirectional: false },
      { name: 'Aranet Sensors', protocol: 'Bluetooth/API', bidirectional: false },
      { name: 'Trolmaster Hydro-X', protocol: 'RS485', bidirectional: true },
      { name: 'Pulse Grow', protocol: 'REST API', bidirectional: false },
      { name: 'SensorPush', protocol: 'Bluetooth/Cloud', bidirectional: false }
    ]
  },
  {
    title: 'Business Systems',
    icon: Building,
    color: 'from-purple-500 to-indigo-500',
    systems: [
      { name: 'METRC', protocol: 'REST API', bidirectional: true },
      { name: 'BioTrack THC', protocol: 'REST API', bidirectional: true },
      { name: 'QuickBooks', protocol: 'OAuth API', bidirectional: true },
      { name: 'Xero', protocol: 'OAuth 2.0', bidirectional: true },
      { name: 'SAP Business One', protocol: 'Service Layer', bidirectional: true },
      { name: 'Salesforce', protocol: 'REST API', bidirectional: true }
    ]
  },
  {
    title: 'Energy Management',
    icon: Zap,
    color: 'from-green-500 to-emerald-500',
    systems: [
      { name: 'Utility APIs', protocol: 'Green Button', bidirectional: false },
      { name: 'Smart Meters', protocol: 'Modbus/DLMS', bidirectional: false },
      { name: 'Solar Inverters', protocol: 'SunSpec', bidirectional: false },
      { name: 'Battery Systems', protocol: 'CAN/Modbus', bidirectional: true },
      { name: 'Demand Response', protocol: 'OpenADR', bidirectional: true }
    ]
  }
]

const dataFlow = {
  inputs: [
    { icon: Thermometer, label: 'Temperature', value: '72.5°F' },
    { icon: Droplets, label: 'Humidity', value: '65%' },
    { icon: Sun, label: 'PPFD', value: '850 μmol' },
    { icon: Gauge, label: 'CO2', value: '1200 ppm' },
    { icon: Zap, label: 'Power', value: '485 kW' }
  ],
  processing: [
    'Real-time Analysis',
    'Pattern Recognition',
    'Anomaly Detection',
    'Optimization Engine',
    'Predictive Models'
  ],
  outputs: [
    { icon: Settings, label: 'Control Commands' },
    { icon: Bell, label: 'Smart Alerts' },
    { icon: FileText, label: 'Reports' },
    { icon: BarChart, label: 'Analytics' },
    { icon: DollarSign, label: 'Cost Savings' }
  ]
}

export default function IntegrationDiagram() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white"
          >
            Universal Integration Platform
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            VibeLux connects with every major system in your facility, creating a unified 
            control plane that eliminates data silos and enables true automation
          </motion.p>
        </div>

        {/* Integration Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {integrationCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{category.title}</h3>
              </div>
              
              <div className="space-y-2">
                {category.systems.map((system) => (
                  <div key={system.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{system.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{system.protocol}</span>
                      {system.bidirectional ? (
                        <ArrowUpDown className="w-3 h-3 text-green-400" />
                      ) : (
                        <ArrowLeft className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Flow Visualization */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Real-Time Data Flow Architecture
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            {/* Inputs */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Data Inputs</h4>
              {dataFlow.inputs.map((input) => (
                <div key={input.label} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">{input.label}</span>
                    </div>
                    <span className="text-xs font-mono text-green-400">{input.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center">
              <ArrowRight className="w-8 h-8 text-purple-400" />
            </div>

            {/* Processing */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">VibeLux Core</h4>
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/50">
                <Cloud className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="space-y-1">
                  {dataFlow.processing.map((process) => (
                    <p key={process} className="text-xs text-center text-gray-300">• {process}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center">
              <ArrowRight className="w-8 h-8 text-purple-400" />
            </div>

            {/* Outputs */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Actions</h4>
              {dataFlow.outputs.map((output) => (
                <div key={output.label} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <output.icon className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-300">{output.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">10ms</p>
              <p className="text-xs text-gray-400">Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">1M+</p>
              <p className="text-xs text-gray-400">Data Points/Day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">99.9%</p>
              <p className="text-xs text-gray-400">Uptime SLA</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">256-bit</p>
              <p className="text-xs text-gray-400">Encryption</p>
            </div>
          </div>
        </motion.div>

        {/* Security & Compliance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Enterprise Security</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                End-to-end encryption for all data transmission
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Role-based access control (RBAC)
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Automated backup and disaster recovery
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Regular security audits and updates
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">API & Developer Tools</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                RESTful API with comprehensive documentation
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                Webhook support for real-time events
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                SDKs for Python, JavaScript, and Go
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                GraphQL endpoint for advanced queries
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}