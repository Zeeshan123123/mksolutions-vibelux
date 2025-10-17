'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Clipboard,
  Scissors,
  Package,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  MapPin,
  User,
  Plus,
  X,
  Eye,
  Edit,
  Save,
  RefreshCw,
  Archive,
  Target,
  Zap,
  MessageSquare,
  Camera,
  QrCode,
  Scale,
  Thermometer,
  Droplets,
  Download,
  Upload,
  Bell,
  ArrowRight,
  CheckSquare,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

interface ShiftHandoff {
  id: string;
  shift: 'day' | 'evening' | 'night';
  date: string;
  handoffBy: string;
  handoffTo: string;
  keyIssues: string[];
  completedTasks: string[];
  pendingTasks: string[];
  environmentalNotes: string;
  equipmentStatus: string;
  nextShiftPriorities: string[];
  photos?: string[];
  timestamp: Date;
  signed: boolean;
}

interface HarvestEntry {
  id: string;
  batchId: string;
  strainName: string;
  roomLocation: string;
  harvestedBy: string;
  harvestDate: Date;
  wetWeight: number;
  dryWeight?: number;
  plantCount: number;
  qualityGrade: 'A' | 'B' | 'C' | 'Trim';
  trichomeReadiness: number;
  moistureContent?: number;
  notes: string;
  photos: string[];
  qrCode: string;
  status: 'harvested' | 'drying' | 'curing' | 'testing' | 'finished';
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: 'cultivation' | 'maintenance' | 'cleaning' | 'inventory' | 'quality' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  room: string;
  estimatedTime: number;
  actualTime?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueTime: string;
  completionNotes?: string;
  checklistItems?: Array<{ item: string; completed: boolean; }>;
  requiredTools?: string[];
  safetyNotes?: string;
  qualityCheck?: boolean;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: number;
  tasks: Array<{
    title: string;
    description: string;
    estimatedMinutes: number;
    requiredTools: string[];
    safetyNotes: string;
    qualityChecks: string[];
  }>;
}

// Memoized sub-components for better performance
const QuickStats = memo(({ todayStats }: { todayStats: any }) => (
  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">Tasks</span>
        <CheckCircle className="w-4 h-4 text-green-400" />
      </div>
      <p className="text-2xl font-bold text-white">{todayStats.tasksCompleted}/{todayStats.totalTasks}</p>
      <p className="text-sm text-green-400">
        {Math.round((todayStats.tasksCompleted / todayStats.totalTasks) * 100)}% complete
      </p>
    </div>
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">Harvest</span>
        <Scale className="w-4 h-4 text-purple-400" />
      </div>
      <p className="text-2xl font-bold text-white">{(todayStats.harvestWeight / 1000).toFixed(1)}kg</p>
      <p className="text-sm text-purple-400">+12% vs target</p>
    </div>
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">Workers</span>
        <Users className="w-4 h-4 text-blue-400" />
      </div>
      <p className="text-2xl font-bold text-white">{todayStats.activeWorkers}</p>
      <p className="text-sm text-blue-400">Active today</p>
    </div>
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">Shifts</span>
        <Clock className="w-4 h-4 text-yellow-400" />
      </div>
      <p className="text-2xl font-bold text-white">{todayStats.shiftsCompleted}/3</p>
      <p className="text-sm text-yellow-400">Completed</p>
    </div>
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">Compliance</span>
        <FileText className="w-4 h-4 text-green-400" />
      </div>
      <p className="text-2xl font-bold text-white">{todayStats.complianceScore}%</p>
      <p className="text-sm text-green-400">Score</p>
    </div>
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">Efficiency</span>
        <Activity className="w-4 h-4 text-green-400" />
      </div>
      <p className="text-2xl font-bold text-white">94%</p>
      <p className="text-sm text-green-400">+2% today</p>
    </div>
  </div>
));

// Individual tab components for lazy loading
const OverviewTab = memo(({ currentShift, dailyTasks, showTaskModal, setShowTaskModal, completeTask, getPriorityColor, getStatusColor }: any) => (
  <div className="space-y-6">
    {/* Current Shift Status */}
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Current Shift Status</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Active</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-400">Shift Lead</p>
          <p className="text-lg font-medium text-white">Sarah M.</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Next Handoff</p>
          <p className="text-lg font-medium text-white">14:00 (2 hours)</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Critical Tasks</p>
          <p className="text-lg font-medium text-orange-400">2 pending</p>
        </div>
      </div>
    </div>

    {/* Active Tasks */}
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Active Tasks</h3>
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
      <div className="divide-y divide-gray-800">
        {dailyTasks.slice(0, 5).map((task: any) => (
          <div key={task.id} className="p-4 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start gap-4">
              <button
                onClick={() => completeTask(task.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-green-600 border-green-600'
                    : 'border-gray-600 hover:border-green-600'
                }`}
              >
                {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white">{task.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {task.room}
                      </span>
                      <span className="text-xs text-gray-500">
                        <User className="w-3 h-3 inline mr-1" />
                        {task.assignedTo}
                      </span>
                      <span className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {task.estimatedTime} min
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">Due: {task.dueTime}</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <p className="text-sm text-gray-300">Harvest B240315 completed - 2.45kg wet weight</p>
            <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <p className="text-sm text-gray-300">Morning environmental check completed</p>
            <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p className="text-sm text-gray-300">pH drift detected in Tank B - task created</p>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-600/30">
            <div>
              <p className="text-sm font-medium text-red-300">State Inspection</p>
              <p className="text-xs text-gray-400">Compliance audit scheduled</p>
            </div>
            <span className="text-sm text-red-400">2 days</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
            <div>
              <p className="text-sm font-medium text-yellow-300">Equipment Maintenance</p>
              <p className="text-xs text-gray-400">HVAC filter replacement</p>
            </div>
            <span className="text-sm text-yellow-400">5 days</span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const ShiftsTab = memo(() => <div>Shifts content will load here</div>);
const HarvestTab = memo(() => <div>Harvest content will load here</div>);  
const WorkflowsTab = memo(() => <div>Workflows content will load here</div>);
const AnalyticsTab = memo(() => <div>Analytics content will load here</div>);

const TabContent = memo(({ 
  activeTab, 
  currentShift, 
  dailyTasks, 
  shiftHandoffs, 
  harvestEntries, 
  workflowTemplates,
  showTaskModal,
  setShowTaskModal,
  showHandoffModal,
  setShowHandoffModal,
  showHarvestModal,
  setShowHarvestModal,
  completeTask,
  getPriorityColor,
  getStatusColor,
  mounted
}: any) => {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab 
        currentShift={currentShift}
        dailyTasks={dailyTasks}
        showTaskModal={showTaskModal}
        setShowTaskModal={setShowTaskModal}
        completeTask={completeTask}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />;
    case 'shifts':
      return <ShiftsTab />;
    case 'harvest':
      return <HarvestTab />;
    case 'workflows':
      return <WorkflowsTab />;
    case 'analytics':
      return <AnalyticsTab />;
    default:
      return null;
  }
});

export function DailyOperations() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shifts' | 'harvest' | 'workflows' | 'analytics'>('overview');
  const [currentShift, setCurrentShift] = useState<'day' | 'evening' | 'night'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Determine current shift based on time
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) setCurrentShift('day');
    else if (hour >= 14 && hour < 22) setCurrentShift('evening');
    else setCurrentShift('night');
    
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Sample data - memoized to prevent recreation on every render
  const shiftHandoffs = useMemo<ShiftHandoff[]>(() => [
    {
      id: 'shift-1',
      shift: 'day',
      date: selectedDate,
      handoffBy: 'Sarah M.',
      handoffTo: 'Mike R.',
      keyIssues: ['pH drift in Tank B', 'Spider mite spotted in Veg Room 2'],
      completedTasks: ['IPM spray application', 'Light height adjustment'],
      pendingTasks: ['Harvest Batch #B240315', 'Clean dehumidifier filters'],
      environmentalNotes: 'Temperature spike at 2 PM, now stable at 75°F',
      equipmentStatus: 'All systems operational, backup fan running in Flower A',
      nextShiftPriorities: ['Monitor pH levels', 'Complete harvest documentation'],
      timestamp: new Date(),
      signed: false
    }
  ], [selectedDate]);

  const harvestEntries = useMemo<HarvestEntry[]>(() => [
    {
      id: 'harvest-1',
      batchId: 'B240315',
      strainName: 'Purple Punch',
      roomLocation: 'Flower Room A',
      harvestedBy: 'John D.',
      harvestDate: new Date(),
      wetWeight: 2450,
      plantCount: 12,
      qualityGrade: 'A',
      trichomeReadiness: 95,
      notes: 'Excellent trichome development, minimal amber, perfect harvest timing',
      photos: ['harvest1.jpg', 'harvest2.jpg'],
      qrCode: 'QR240315001',
      status: 'drying'
    }
  ], []);

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: 'task-1',
      title: 'Morning Environmental Check',
      description: 'Check and record temperature, humidity, pH, and EC levels',
      category: 'cultivation',
      priority: 'high',
      assignedTo: 'Sarah M.',
      room: 'All Rooms',
      estimatedTime: 30,
      status: 'completed',
      dueTime: '08:00',
      checklistItems: [
        { item: 'Temperature readings', completed: true },
        { item: 'Humidity levels', completed: true },
        { item: 'pH measurements', completed: true },
        { item: 'EC/TDS readings', completed: true },
        { item: 'CO2 levels', completed: true }
      ]
    },
    {
      id: 'task-2',
      title: 'Harvest Batch B240315',
      description: 'Complete harvest of Purple Punch batch, document weights and quality',
      category: 'cultivation',
      priority: 'critical',
      assignedTo: 'John D.',
      room: 'Flower Room A',
      estimatedTime: 120,
      status: 'in-progress',
      dueTime: '10:00',
      requiredTools: ['Harvest shears', 'Scale', 'Drying racks', 'Labels'],
      safetyNotes: 'Wear gloves and eye protection',
      qualityCheck: true
    },
    {
      id: 'task-3',
      title: 'IPM Inspection',
      description: 'Weekly integrated pest management inspection and treatment',
      category: 'cultivation',
      priority: 'medium',
      assignedTo: 'Mike R.',
      room: 'Veg Room 2',
      estimatedTime: 45,
      status: 'pending',
      dueTime: '14:00'
    }
  ]);

  const workflowTemplates = useMemo<WorkflowTemplate[]>(() => [
    {
      id: 'harvest-workflow',
      name: 'Complete Harvest Process',
      description: 'Full harvest workflow from cutting to storage',
      category: 'cultivation',
      estimatedTime: 180,
      tasks: [
        {
          title: 'Pre-harvest inspection',
          description: 'Check trichome readiness and plant health',
          estimatedMinutes: 15,
          requiredTools: ['Jeweler\'s loupe', 'Camera'],
          safetyNotes: 'Check for any signs of mold or pests',
          qualityChecks: ['Trichome cloudy ratio >80%', 'No visible mold', 'Proper moisture levels']
        },
        {
          title: 'Harvest execution',
          description: 'Cut and collect plant material',
          estimatedMinutes: 90,
          requiredTools: ['Harvest shears', 'Collection bins', 'Scales'],
          safetyNotes: 'Wear gloves and maintain sterile conditions',
          qualityChecks: ['Clean cuts', 'Proper handling', 'Immediate weighing']
        },
        {
          title: 'Documentation and storage',
          description: 'Record weights, generate QR codes, and setup drying',
          estimatedMinutes: 30,
          requiredTools: ['Scale', 'Label printer', 'Drying racks'],
          safetyNotes: 'Ensure proper air circulation',
          qualityChecks: ['Accurate weights recorded', 'QR codes applied', 'Proper spacing on racks']
        }
      ]
    }
  ], []);

  const todayStats = useMemo(() => ({
    tasksCompleted: dailyTasks.filter(t => t.status === 'completed').length,
    totalTasks: dailyTasks.length,
    harvestWeight: harvestEntries.reduce((sum, h) => sum + h.wetWeight, 0),
    activeWorkers: 8,
    shiftsCompleted: 1,
    complianceScore: 98
  }), [dailyTasks, harvestEntries]);

  const getTrendIcon = useCallback((trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  }, []);

  const getPriorityColor = useCallback((priority: DailyTask['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-900/20 text-red-400 border-red-600/30';
      case 'high': return 'bg-orange-900/20 text-orange-400 border-orange-600/30';
      case 'medium': return 'bg-yellow-900/20 text-yellow-400 border-yellow-600/30';
      case 'low': return 'bg-green-900/20 text-green-400 border-green-600/30';
    }
  }, []);

  const getStatusColor = useCallback((status: DailyTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-900/20 text-green-400';
      case 'in-progress': return 'bg-blue-900/20 text-blue-400';
      case 'blocked': return 'bg-red-900/20 text-red-400';
      default: return 'bg-gray-700 text-gray-300';
    }
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setDailyTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const, actualTime: task.estimatedTime }
          : task
      )
    );
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as any);
  }, []);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'shifts', label: 'Shift Management', icon: Users },
    { id: 'harvest', label: 'Harvest Tracking', icon: Scissors },
    { id: 'workflows', label: 'Daily Workflows', icon: Clipboard },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ], []);

  // Loading state component
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
        <div className="h-16 bg-gray-800 rounded-lg"></div>
        <div className="h-96 bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Daily Operations</h1>
          <p className="text-gray-400">Comprehensive daily operational management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Current Shift</p>
            <p className="text-lg font-semibold text-white capitalize">{currentShift}</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats todayStats={todayStats} />

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <TabContent 
        activeTab={activeTab}
        currentShift={currentShift}
        dailyTasks={dailyTasks}
        shiftHandoffs={shiftHandoffs}
        harvestEntries={harvestEntries}
        workflowTemplates={workflowTemplates}
        showTaskModal={showTaskModal}
        setShowTaskModal={setShowTaskModal}
        showHandoffModal={showHandoffModal}
        setShowHandoffModal={setShowHandoffModal}
        showHarvestModal={showHarvestModal}
        setShowHarvestModal={setShowHarvestModal}
        completeTask={completeTask}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        mounted={mounted}
      />


      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe the task..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assigned To</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option>Sarah M.</option>
                    <option>John D.</option>
                    <option>Mike R.</option>
                    <option>Lisa K.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Room</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option>Flower Room A</option>
                    <option>Flower Room B</option>
                    <option>Veg Room</option>
                    <option>All Rooms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    // Add task creation logic here
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}