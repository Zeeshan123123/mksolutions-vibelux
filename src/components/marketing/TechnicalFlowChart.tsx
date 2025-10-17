"use client"

import { motion } from 'framer-motion'
import { 
  Building, 
  Cloud, 
  Cpu, 
  Database, 
  Zap, 
  Brain, 
  Activity,
  ArrowRight,
  ArrowDown,
  Server,
  Wifi,
  Monitor,
  Smartphone,
  Shield,
  GitBranch,
  LineChart,
  Settings,
  Users,
  FileText,
  Bell,
  Layers,
  Gauge,
  Package,
  Camera,
  FlaskConical,
  DollarSign,
  Leaf
} from 'lucide-react'

export default function TechnicalFlowChart() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white"
          >
            How VibeLux Works: Complete Technical Architecture
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            From sensor data to actionable insights - see how our platform integrates 
            every aspect of your cultivation operation into one intelligent system
          </motion.p>
        </div>

        {/* Main Architecture Flow */}
        <div className="space-y-16">
          {/* Layer 1: Data Sources */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">1</span>
              Data Collection Layer
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <DataSourceCard
                icon={Wifi}
                title="IoT Sensors"
                description="Multi-protocol support"
                features={[
                  "WiFi, LoRa, Zigbee",
                  "RS485, Modbus",
                  "Arduino compatible",
                  "Real-time streaming"
                ]}
                color="from-blue-500 to-blue-600"
              />
              
              <DataSourceCard
                icon={Camera}
                title="Computer Vision"
                description="AI-powered monitoring"
                features={[
                  "Hyperspectral imaging",
                  "Disease detection",
                  "Growth tracking",
                  "Trichome analysis"
                ]}
                color="from-green-500 to-green-600"
              />
              
              <DataSourceCard
                icon={Building}
                title="Climate Systems"
                description="HVAC & controls"
                features={[
                  "Priva integration",
                  "Argus compatibility",
                  "BACnet protocol",
                  "OPC-UA support"
                ]}
                color="from-orange-500 to-orange-600"
              />
              
              <DataSourceCard
                icon={Users}
                title="Manual Input"
                description="Mobile & desktop"
                features={[
                  "Mobile app",
                  "Barcode scanning",
                  "Voice input",
                  "Offline mode"
                ]}
                color="from-purple-500 to-purple-600"
              />
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-8 h-8 text-purple-400 animate-bounce" />
            </div>
          </motion.div>

          {/* Layer 2: Processing Engine */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">2</span>
              Intelligent Processing Engine
            </h3>
            
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ProcessingModule
                  icon={Database}
                  title="Data Pipeline"
                  description="Real-time ETL processing"
                  specs={[
                    "10ms latency",
                    "1M+ data points/sec",
                    "Auto-scaling",
                    "Fault tolerant"
                  ]}
                />
                
                <ProcessingModule
                  icon={Brain}
                  title="AI/ML Engine"
                  description="Advanced AI & custom models"
                  specs={[
                    "Predictive analytics",
                    "Anomaly detection",
                    "Pattern recognition",
                    "Natural language"
                  ]}
                />
                
                <ProcessingModule
                  icon={Activity}
                  title="Analytics Core"
                  description="Advanced calculations"
                  specs={[
                    "ANOVA analysis",
                    "Time-lag correlation",
                    "Yield prediction",
                    "Energy optimization"
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-8 h-8 text-purple-400 animate-bounce" />
            </div>
          </motion.div>

          {/* Layer 3: Feature Modules */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">3</span>
              Feature Modules (450+ Features)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FeatureModule icon={Leaf} title="Cultivation Control" count="50+" />
              <FeatureModule icon={Zap} title="Energy Management" count="30+" />
              <FeatureModule icon={LineChart} title="Analytics & Reports" count="40+" />
              <FeatureModule icon={FlaskConical} title="Research Tools" count="25+" />
              <FeatureModule icon={DollarSign} title="Financial Tools" count="20+" />
              <FeatureModule icon={Settings} title="Automation Rules" count="35+" />
              <FeatureModule icon={Shield} title="Compliance" count="15+" />
              <FeatureModule icon={Package} title="Equipment Mgmt" count="25+" />
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-8 h-8 text-purple-400 animate-bounce" />
            </div>
          </motion.div>

          {/* Layer 4: Output & Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">4</span>
              Intelligent Actions & Outputs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ActionCard
                icon={Bell}
                title="Real-Time Alerts"
                description="Proactive notifications"
                actions={[
                  "Environmental alerts",
                  "Equipment failures",
                  "Pest detection",
                  "Performance issues"
                ]}
              />
              
              <ActionCard
                icon={Cpu}
                title="Automated Control"
                description="Direct system control"
                actions={[
                  "Climate adjustments",
                  "Lighting schedules",
                  "Irrigation control",
                  "Energy optimization"
                ]}
              />
              
              <ActionCard
                icon={FileText}
                title="Reports & Insights"
                description="Actionable intelligence"
                actions={[
                  "Executive dashboards",
                  "Compliance reports",
                  "ROI analysis",
                  "Research findings"
                ]}
              />
            </div>
          </motion.div>
        </div>

        {/* Integration Flow Diagram */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 space-y-8"
        >
          <h3 className="text-2xl font-bold text-white text-center">
            Complete Integration Ecosystem
          </h3>
          
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Input Systems */}
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Input Systems
                </h4>
                <div className="space-y-2">
                  {[
                    "METRC/BioTrack APIs",
                    "Weather stations",
                    "Utility meters",
                    "Security cameras",
                    "pH/EC sensors",
                    "CO2 monitors",
                    "Light sensors",
                    "Mobile scanners"
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* VibeLux Core */}
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-400 text-center">
                  VibeLux Core Platform
                </h4>
                <div className="bg-purple-600/20 rounded-xl p-6 border border-purple-500/50">
                  <div className="space-y-3 text-center">
                    <Cloud className="w-12 h-12 text-purple-400 mx-auto" />
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>• Edge computing</p>
                      <p>• Cloud processing</p>
                      <p>• ML models</p>
                      <p>• Data warehouse</p>
                      <p>• API gateway</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Systems */}
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                  Output Systems
                  <ArrowRight className="w-4 h-4" />
                </h4>
                <div className="space-y-2">
                  {[
                    "Climate controllers",
                    "Lighting systems",
                    "Irrigation pumps",
                    "Mobile alerts",
                    "Email reports",
                    "API webhooks",
                    "Excel exports",
                    "QuickBooks sync"
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-purple-500/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            What This Means For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <Gauge className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Significant Energy Savings</h4>
              <p className="text-sm text-gray-400">Automated optimization</p>
            </div>
            <div>
              <GitBranch className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Single Integration</h4>
              <p className="text-sm text-gray-400">Replace 10+ tools</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">100% Compliant</h4>
              <p className="text-sm text-gray-400">Automated tracking</p>
            </div>
            <div>
              <Brain className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">AI-Powered</h4>
              <p className="text-sm text-gray-400">Predictive insights</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function DataSourceCard({ icon: Icon, title, description, features, color }: any) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <ul className="space-y-1">
        {features.map((feature: string) => (
          <li key={feature} className="text-xs text-gray-500 flex items-center gap-1">
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProcessingModule({ icon: Icon, title, description, specs }: any) {
  return (
    <div className="text-center">
      <Icon className="w-12 h-12 text-purple-400 mx-auto mb-3" />
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div className="space-y-1">
        {specs.map((spec: string) => (
          <p key={spec} className="text-xs text-gray-500">{spec}</p>
        ))}
      </div>
    </div>
  )
}

function FeatureModule({ icon: Icon, title, count }: any) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
      <Icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-gray-400">{count} features</p>
    </div>
  )
}

function ActionCard({ icon: Icon, title, description, actions }: any) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <Icon className="w-8 h-8 text-purple-400 mb-3" />
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <ul className="space-y-1">
        {actions.map((action: string) => (
          <li key={action} className="text-sm text-gray-300 flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-purple-400" />
            {action}
          </li>
        ))}
      </ul>
    </div>
  )
}