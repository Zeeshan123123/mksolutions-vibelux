'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bot,
  Activity,
  Settings,
  Battery,
  Navigation,
  Scissors,
  Droplets,
  Package,
  Truck,
  Play,
  Pause,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Cpu,
  Shield,
  Camera
} from 'lucide-react';

interface Robot {
  id: string;
  name: string;
  type: 'harvester' | 'trimmer' | 'transporter' | 'monitor';
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  battery: number;
  currentTask: string;
  location: string;
  efficiency: number;
  icon: React.ElementType;
}

interface Task {
  id: string;
  robotId: string;
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  estimatedCompletion: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export default function RoboticsPage() {
  const [selectedRobot, setSelectedRobot] = useState<string>('all');
  const [isMonitoring, setIsMonitoring] = useState(true);

  const robots: Robot[] = [
    {
      id: 'HARV-001',
      name: 'Harvest Bot Alpha',
      type: 'harvester',
      status: 'active',
      battery: 85,
      currentTask: 'Harvesting Flower Room 2',
      location: 'FLOW-02',
      efficiency: 94,
      icon: Scissors
    },
    {
      id: 'TRIM-001',
      name: 'Trim Bot Beta',
      type: 'trimmer',
      status: 'active',
      battery: 72,
      currentTask: 'Trimming batch GSC-0315',
      location: 'PROC-01',
      efficiency: 88,
      icon: Bot
    },
    {
      id: 'TRAN-001',
      name: 'Transport Unit Gamma',
      type: 'transporter',
      status: 'idle',
      battery: 95,
      currentTask: 'Standby',
      location: 'DOCK-01',
      efficiency: 92,
      icon: Truck
    },
    {
      id: 'MON-001',
      name: 'Monitor Bot Delta',
      type: 'monitor',
      status: 'active',
      battery: 68,
      currentTask: 'Environmental scanning',
      location: 'VEG-01',
      efficiency: 96,
      icon: Camera
    }
  ];

  const tasks: Task[] = [
    {
      id: 'T-001',
      robotId: 'HARV-001',
      type: 'Harvest',
      description: 'Complete harvest of Flower Room 2 - Northern section',
      priority: 'high',
      progress: 75,
      estimatedCompletion: '2:30 PM',
      status: 'in_progress'
    },
    {
      id: 'T-002',
      robotId: 'TRIM-001',
      type: 'Trim',
      description: 'Final trim and quality check - GSC strain',
      priority: 'medium',
      progress: 45,
      estimatedCompletion: '4:15 PM',
      status: 'in_progress'
    },
    {
      id: 'T-003',
      robotId: 'TRAN-001',
      type: 'Transport',
      description: 'Move harvested material to drying room',
      priority: 'medium',
      progress: 0,
      estimatedCompletion: '3:00 PM',
      status: 'pending'
    },
    {
      id: 'T-004',
      robotId: 'MON-001',
      type: 'Monitor',
      description: 'Complete environmental assessment of all veg rooms',
      priority: 'low',
      progress: 30,
      estimatedCompletion: '5:00 PM',
      status: 'in_progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'maintenance': return 'text-orange-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-400';
    if (level > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Bot className="w-10 h-10 text-blue-400" />
            Robotics & Automation
          </h1>
          <p className="text-gray-400 text-lg">
            Automated systems for harvesting, processing, and facility management
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Robots</span>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold">{robots.filter(r => r.status === 'active').length}</div>
            <div className="text-sm text-gray-500">of {robots.length} total</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Tasks Today</span>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-500">8 completed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Efficiency</span>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold">92%</div>
            <div className="text-sm text-gray-500">System average</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Uptime</span>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold">99.7%</div>
            <div className="text-sm text-gray-500">Last 30 days</div>
          </div>
        </div>

        {/* Robot Fleet Status */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Robot Fleet Status</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isMonitoring ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isMonitoring ? 'Monitoring' : 'Paused'}
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors">
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {robots.map((robot, index) => (
              <motion.div
                key={robot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-700 rounded-lg p-4 border cursor-pointer transition-all ${
                  selectedRobot === robot.id ? 'border-blue-500' : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedRobot(robot.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <robot.icon className={`w-6 h-6 ${getStatusColor(robot.status)}`} />
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(robot.battery)}`} />
                    <span className={`text-sm ${getBatteryColor(robot.battery)}`}>{robot.battery}%</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{robot.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{robot.id}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`capitalize ${getStatusColor(robot.status)}`}>{robot.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span>{robot.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Efficiency:</span>
                    <span className="text-green-400">{robot.efficiency}%</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-300">{robot.currentTask}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Tasks */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Active Tasks
            </h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{task.type}</h3>
                      <p className="text-sm text-gray-400">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      {task.status === 'in_progress' && <Activity className="w-4 h-4 text-green-400" />}
                      {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {task.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Robot: {task.robotId}</span>
                    <span className="text-sm text-gray-400">ETA: {task.estimatedCompletion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-300">{task.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Controls */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              System Controls
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-3">Emergency Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Emergency Stop
                  </button>
                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Pause All
                  </button>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-3">Fleet Operations</h3>
                <div className="space-y-2">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Resume All Tasks
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    Restart Sequence
                  </button>
                  <button className="w-full bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Return to Base
                  </button>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-3">Maintenance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Service:</span>
                    <span>HARV-001 - 3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alerts:</span>
                    <span className="text-yellow-400">1 warning</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calibration:</span>
                    <span className="text-green-400">All current</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Scissors className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold">Automated Harvesting</h3>
                <p className="text-sm text-gray-400">Precision cutting and collection</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Plants harvested today:</span>
                <span>145</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average cycle time:</span>
                <span>4.2 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Yield accuracy:</span>
                <span className="text-green-400">98.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold">Material Transport</h3>
                <p className="text-sm text-gray-400">Automated movement systems</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Loads transported:</span>
                <span>28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Distance covered:</span>
                <span>2.4 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Navigation accuracy:</span>
                <span className="text-green-400">99.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold">Quality Monitoring</h3>
                <p className="text-sm text-gray-400">AI-powered visual inspection</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Images analyzed:</span>
                <span>1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Defects detected:</span>
                <span>3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy rate:</span>
                <span className="text-green-400">99.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Links */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-600/30">
          <h3 className="text-xl font-semibold mb-4">System Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/scada" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Shield className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium">SCADA</div>
                <div className="text-sm text-gray-400">System monitoring</div>
              </div>
            </Link>
            <Link href="/bms" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Cpu className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-medium">BMS</div>
                <div className="text-sm text-gray-400">Building control</div>
              </div>
            </Link>
            <Link href="/seed-to-sale" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Package className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-medium">Seed-to-Sale</div>
                <div className="text-sm text-gray-400">Tracking integration</div>
              </div>
            </Link>
            <Link href="/analytics" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Target className="w-6 h-6 text-orange-400" />
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-gray-400">Performance data</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}