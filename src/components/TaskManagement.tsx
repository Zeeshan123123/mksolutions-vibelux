"use client"

import { useState } from 'react'
import { 
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Filter,
  Search,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Users,
  MapPin,
  Repeat,
  FileText,
  Camera,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  type: 'maintenance' | 'harvest' | 'planting' | 'inspection' | 'cleaning' | 'other'
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  assignedTo: string[]
  createdBy: string
  createdAt: Date
  dueDate: Date
  completedAt?: Date
  zone?: string
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    nextOccurrence: Date
  }
  checklist?: ChecklistItem[]
  attachments?: Attachment[]
  comments?: Comment[]
  timeEstimate?: number // minutes
  timeSpent?: number // minutes
  tags?: string[]
}

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  completedBy?: string
  completedAt?: Date
}

interface Attachment {
  id: string
  name: string
  type: string
  url: string
  uploadedBy: string
  uploadedAt: Date
}

interface Comment {
  id: string
  text: string
  author: string
  timestamp: Date
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Weekly IPM Inspection - Flower Room A',
      description: 'Complete integrated pest management inspection for all plants in Flower Room A',
      type: 'inspection',
      priority: 'high',
      status: 'pending',
      assignedTo: ['John D.', 'Sarah M.'],
      createdBy: 'Admin',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      zone: 'flower-a',
      recurring: {
        frequency: 'weekly',
        nextOccurrence: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      checklist: [
        { id: 'c1', text: 'Check underside of leaves', completed: false },
        { id: 'c2', text: 'Inspect stems for damage', completed: false },
        { id: 'c3', text: 'Look for pest indicators', completed: false },
        { id: 'c4', text: 'Document any issues found', completed: false },
        { id: 'c5', text: 'Take photos of problem areas', completed: false }
      ],
      timeEstimate: 120,
      tags: ['IPM', 'weekly', 'critical']
    },
    {
      id: 'task-2',
      title: 'Replace HVAC Filters - All Zones',
      description: 'Monthly HVAC filter replacement for optimal air quality',
      type: 'maintenance',
      priority: 'medium',
      status: 'in-progress',
      assignedTo: ['Mike R.'],
      createdBy: 'System',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      recurring: {
        frequency: 'monthly',
        nextOccurrence: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      checklist: [
        { id: 'c1', text: 'Zone 1 filters', completed: true, completedBy: 'Mike R.', completedAt: new Date() },
        { id: 'c2', text: 'Zone 2 filters', completed: true, completedBy: 'Mike R.', completedAt: new Date() },
        { id: 'c3', text: 'Zone 3 filters', completed: false },
        { id: 'c4', text: 'Zone 4 filters', completed: false }
      ],
      timeEstimate: 180,
      timeSpent: 90,
      tags: ['maintenance', 'HVAC', 'monthly']
    },
    {
      id: 'task-3',
      title: 'Harvest Blue Dream - Row 12-16',
      description: 'Harvest mature plants from rows 12-16 in Flower Room B',
      type: 'harvest',
      priority: 'critical',
      status: 'pending',
      assignedTo: ['Harvest Team'],
      createdBy: 'Production Manager',
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      zone: 'flower-b',
      checklist: [
        { id: 'c1', text: 'Prepare harvest equipment', completed: false },
        { id: 'c2', text: 'Set up drying room', completed: false },
        { id: 'c3', text: 'Complete pre-harvest inspection', completed: false },
        { id: 'c4', text: 'Record batch numbers', completed: false }
      ],
      timeEstimate: 360,
      tags: ['harvest', 'blue-dream', 'urgent']
    }
  ])

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    if (filterType !== 'all' && task.type !== filterType) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Group tasks by status
  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <ArrowUp className="w-4 h-4 text-red-400" />
      case 'high': return <ArrowUp className="w-4 h-4 text-orange-400" />
      case 'medium': return <ArrowRight className="w-4 h-4 text-yellow-400" />
      case 'low': return <ArrowDown className="w-4 h-4 text-green-400" />
      default: return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-blue-500/20 text-blue-400'
      case 'harvest': return 'bg-green-500/20 text-green-400'
      case 'planting': return 'bg-purple-500/20 text-purple-400'
      case 'inspection': return 'bg-yellow-500/20 text-yellow-400'
      case 'cleaning': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status,
            completedAt: status === 'completed' ? new Date() : undefined
          }
        : task
    ))
  }

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            checklist: task.checklist?.map(item =>
              item.id === itemId
                ? {
                    ...item,
                    completed: !item.completed,
                    completedBy: !item.completed ? 'Current User' : undefined,
                    completedAt: !item.completed ? new Date() : undefined
                  }
                : item
            )
          }
        : task
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Task Management</h2>
            <p className="text-sm text-gray-400 mt-1">
              Track and manage all facility operations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Types</option>
            <option value="maintenance">Maintenance</option>
            <option value="harvest">Harvest</option>
            <option value="planting">Planting</option>
            <option value="inspection">Inspection</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['pending', 'in-progress', 'completed'] as const).map(status => (
          <div key={status} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white capitalize">
                {status.replace('-', ' ')} ({tasksByStatus[status].length})
              </h3>
              <span className={`w-2 h-2 rounded-full ${
                status === 'pending' ? 'bg-yellow-400' :
                status === 'in-progress' ? 'bg-blue-400' :
                'bg-green-400'
              }`} />
            </div>

            <div className="space-y-3">
              {tasksByStatus[status].map(task => (
                <div
                  key={task.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white flex-1">{task.title}</h4>
                    {getPriorityIcon(task.priority)}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(task.type)}`}>
                      {task.type}
                    </span>
                    {task.zone && (
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {task.zone}
                      </span>
                    )}
                    {task.recurring && (
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {task.recurring.frequency}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {task.assignedTo.length}
                      </span>
                    </div>
                    {task.checklist && (
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                      </span>
                    )}
                  </div>

                  {task.status !== 'completed' && (
                    <div className="mt-3 flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTaskStatus(task.id, 'in-progress')
                          }}
                          className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTaskStatus(task.id, 'completed')
                          }}
                          className="flex-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Details */}
              <div>
                <p className="text-gray-300 mb-4">{selectedTask.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Status</span>
                    <p className="text-white capitalize">{selectedTask.status.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Priority</span>
                    <p className="text-white capitalize flex items-center gap-1">
                      {getPriorityIcon(selectedTask.priority)}
                      {selectedTask.priority}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Due Date</span>
                    <p className="text-white">{selectedTask.dueDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Time Estimate</span>
                    <p className="text-white">{selectedTask.timeEstimate} min</p>
                  </div>
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <h4 className="font-medium text-white mb-3">Assigned To</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assignedTo.map((person, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {person}
                    </span>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              {selectedTask.checklist && (
                <div>
                  <h4 className="font-medium text-white mb-3">Checklist</h4>
                  <div className="space-y-2">
                    {selectedTask.checklist.map(item => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(selectedTask.id, item.id)}
                          className="mt-0.5 rounded"
                        />
                        <div className="flex-1">
                          <span className={`${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {item.text}
                          </span>
                          {item.completedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completed by {item.completedBy} at {item.completedAt?.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Task
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Add Comment
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Add Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Create New Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Enter task description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                    <option value="maintenance">Maintenance</option>
                    <option value="harvest">Harvest</option>
                    <option value="planting">Planting</option>
                    <option value="inspection">Inspection</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time Estimate (minutes)</label>
                  <input
                    type="number"
                    placeholder="120"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign To</label>
                <input
                  type="text"
                  placeholder="Enter team member names..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zone (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., flower-a, veg-room-1..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., weekly, critical, maintenance..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Statistics */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Task Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">{tasks.length}</p>
            <p className="text-sm text-gray-400">Total Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {tasks.filter(t => t.status === 'completed' && t.completedAt && t.completedAt.toDateString() === new Date().toDateString()).length}
            </p>
            <p className="text-sm text-gray-400">Completed Today</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {tasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length}
            </p>
            <p className="text-sm text-gray-400">Overdue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              {Math.round(tasks.filter(t => t.status === 'completed').length / tasks.length * 100)}%
            </p>
            <p className="text-sm text-gray-400">Completion Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}