'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, Play, Pause, Clock, Thermometer, 
  Droplets, Lightbulb, Bell, Database, Wifi,
  CheckCircle, XCircle, AlertTriangle, Zap,
  Settings, ChevronRight, Activity
} from 'lucide-react';
import { MarketingNavigation } from '@/components/MarketingNavigation';

// Example workflow templates
const WORKFLOW_TEMPLATES = [
  {
    id: 'climate-control',
    name: 'Climate Control Automation',
    description: 'Maintain optimal growing conditions automatically',
    icon: Thermometer,
    color: 'from-red-500 to-orange-600',
    nodes: [
      { type: 'trigger', label: 'Temperature Sensor', icon: Thermometer },
      { type: 'condition', label: 'If > 80°F', icon: AlertTriangle },
      { type: 'action', label: 'Turn on Fans', icon: Settings },
      { type: 'action', label: 'Send Alert', icon: Bell }
    ]
  },
  {
    id: 'irrigation',
    name: 'Smart Irrigation',
    description: 'Water plants based on soil moisture and weather',
    icon: Droplets,
    color: 'from-blue-500 to-cyan-600',
    nodes: [
      { type: 'trigger', label: 'Soil Moisture < 30%', icon: Droplets },
      { type: 'condition', label: 'Check Weather', icon: Activity },
      { type: 'action', label: 'Start Irrigation', icon: Droplets },
      { type: 'action', label: 'Log to Database', icon: Database }
    ]
  },
  {
    id: 'lighting',
    name: 'Lighting Schedule',
    description: 'Automated photoperiod management',
    icon: Lightbulb,
    color: 'from-yellow-500 to-amber-600',
    nodes: [
      { type: 'trigger', label: 'Time: 6:00 AM', icon: Clock },
      { type: 'action', label: 'Lights On 100%', icon: Lightbulb },
      { type: 'trigger', label: 'Time: 10:00 PM', icon: Clock },
      { type: 'action', label: 'Lights Off', icon: Lightbulb }
    ]
  }
];

// Simulated workflow execution states
interface ExecutionState {
  workflowId: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  currentNode: number;
  logs: Array<{
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

export default function WorkflowAutomationDemo() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(WORKFLOW_TEMPLATES[0]);
  const [executionState, setExecutionState] = useState<ExecutionState>({
    workflowId: selectedWorkflow.id,
    status: 'idle',
    currentNode: -1,
    logs: []
  });

  // Simulate workflow execution
  const runWorkflow = async () => {
    setExecutionState(prev => ({
      ...prev,
      status: 'running',
      currentNode: 0,
      logs: [{
        timestamp: new Date(),
        message: `Starting ${selectedWorkflow.name}...`,
        type: 'info'
      }]
    }));

    // Simulate execution through each node
    for (let i = 0; i < selectedWorkflow.nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const node = selectedWorkflow.nodes[i];
      setExecutionState(prev => ({
        ...prev,
        currentNode: i,
        logs: [...prev.logs, {
          timestamp: new Date(),
          message: `${node.type === 'trigger' ? 'Triggered' : node.type === 'condition' ? 'Evaluating' : 'Executing'}: ${node.label}`,
          type: node.type === 'action' ? 'success' : 'info'
        }]
      }));
    }

    // Complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    setExecutionState(prev => ({
      ...prev,
      status: 'completed',
      currentNode: -1,
      logs: [...prev.logs, {
        timestamp: new Date(),
        message: 'Workflow completed successfully!',
        type: 'success'
      }]
    }));
  };

  const resetWorkflow = () => {
    setExecutionState({
      workflowId: selectedWorkflow.id,
      status: 'idle',
      currentNode: -1,
      logs: []
    });
  };

  return (
    <>
      <MarketingNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 backdrop-blur-sm rounded-full border border-blue-700/50 mb-6">
                <Workflow className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-200">Live Workflow Automation Demo</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Visual Workflow
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Automation Engine
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Create powerful automations with our visual workflow builder. 
                Connect sensors, conditions, and actions to automate your entire facility.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Workflow Templates */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Select Workflow Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WORKFLOW_TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => {
                    setSelectedWorkflow(template);
                    resetWorkflow();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-lg border transition-all duration-300 ${
                    selectedWorkflow.id === template.id
                      ? 'bg-gradient-to-r ' + template.color + ' border-transparent shadow-lg'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <template.icon className={`w-8 h-8 mb-3 ${
                    selectedWorkflow.id === template.id ? 'text-white' : 'text-gray-400'
                  }`} />
                  <h4 className={`font-semibold mb-1 ${
                    selectedWorkflow.id === template.id ? 'text-white' : 'text-gray-200'
                  }`}>
                    {template.name}
                  </h4>
                  <p className={`text-sm ${
                    selectedWorkflow.id === template.id ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {template.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Workflow Builder */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
              {/* Workflow Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {selectedWorkflow.name}
                  </h3>
                  <p className="text-gray-400">{selectedWorkflow.description}</p>
                </div>
                <div className="flex gap-3">
                  {executionState.status === 'idle' && (
                    <button
                      onClick={runWorkflow}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Run Workflow
                    </button>
                  )}
                  {executionState.status === 'running' && (
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-700 text-gray-400 font-medium rounded-lg cursor-not-allowed flex items-center gap-2"
                    >
                      <Activity className="w-5 h-5 animate-pulse" />
                      Running...
                    </button>
                  )}
                  {executionState.status === 'completed' && (
                    <button
                      onClick={resetWorkflow}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Workflow */}
              <div className="relative mb-8">
                <div className="flex items-center justify-between">
                  {selectedWorkflow.nodes.map((node, index) => (
                    <React.Fragment key={index}>
                      <motion.div
                        animate={{
                          scale: executionState.currentNode === index ? 1.1 : 1,
                          opacity: executionState.status === 'idle' || executionState.currentNode >= index ? 1 : 0.5
                        }}
                        className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-300 ${
                          executionState.currentNode === index
                            ? 'bg-gradient-to-r ' + selectedWorkflow.color + ' border-transparent shadow-lg'
                            : executionState.currentNode > index
                            ? 'bg-gray-700/50 border-green-600'
                            : 'bg-gray-800/50 border-gray-600'
                        }`}
                      >
                        <node.icon className={`w-8 h-8 mb-2 ${
                          executionState.currentNode === index ? 'text-white' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium text-center ${
                          executionState.currentNode === index ? 'text-white' : 'text-gray-300'
                        }`}>
                          {node.label}
                        </span>
                        <span className={`text-xs mt-1 ${
                          node.type === 'trigger' ? 'text-blue-400' :
                          node.type === 'condition' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {node.type.toUpperCase()}
                        </span>
                      </motion.div>
                      
                      {index < selectedWorkflow.nodes.length - 1 && (
                        <ChevronRight className={`w-6 h-6 ${
                          executionState.currentNode > index ? 'text-green-400' : 'text-gray-600'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Execution Logs */}
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Execution Logs
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {executionState.logs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          log.type === 'error' ? 'bg-red-900/20 border border-red-800' :
                          log.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-800' :
                          log.type === 'success' ? 'bg-green-900/20 border border-green-800' :
                          'bg-gray-800/50 border border-gray-700'
                        }`}
                      >
                        {log.type === 'error' ? <XCircle className="w-5 h-5 text-red-400 mt-0.5" /> :
                         log.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" /> :
                         log.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> :
                         <Zap className="w-5 h-5 text-blue-400 mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-gray-200">{log.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {log.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {executionState.logs.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No logs yet. Run the workflow to see execution details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Powerful Automation Features
              </h2>
              <p className="text-xl text-gray-300">
                Everything you need to automate your cultivation facility
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Wifi className="w-8 h-8 text-purple-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">IoT Device Control</h4>
                <p className="text-gray-400 text-sm">
                  Connect and control any IoT device through MQTT, HTTP, or Modbus protocols
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Database className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Database Integration</h4>
                <p className="text-gray-400 text-sm">
                  Log sensor data, update metrics, and create alerts automatically
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Bell className="w-8 h-8 text-orange-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Smart Notifications</h4>
                <p className="text-gray-400 text-sm">
                  Get alerts via web push, email, or SMS when conditions are met
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Activity className="w-8 h-8 text-green-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Real-time Monitoring</h4>
                <p className="text-gray-400 text-sm">
                  Monitor workflow execution and performance in real-time
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Settings className="w-8 h-8 text-red-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Complex Logic</h4>
                <p className="text-gray-400 text-sm">
                  Build sophisticated conditions with multiple operators and nested logic
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Clock className="w-8 h-8 text-yellow-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Schedule Triggers</h4>
                <p className="text-gray-400 text-sm">
                  Run workflows on schedules or in response to events
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}