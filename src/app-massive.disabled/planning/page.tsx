'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Leaf, 
  Target, 
  TrendingUp,
  Droplets,
  Thermometer,
  Sun,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

export default function PlanningPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'phases'>('calendar');

  const phases = [
    {
      id: 'germination',
      name: 'Germination',
      duration: '7-14 days',
      temperature: '75-85°F',
      humidity: '80-90%',
      light: '18-24h/day',
      ppfd: '100-300 μmol/m²/s',
      tasks: ['Seed prep', 'Moisture control', 'Temperature monitoring'],
      color: 'green'
    },
    {
      id: 'seedling',
      name: 'Seedling',
      duration: '14-21 days',
      temperature: '70-80°F',
      humidity: '65-75%',
      light: '18h/day',
      ppfd: '200-400 μmol/m²/s',
      tasks: ['First feeding', 'Transplanting', 'Growth tracking'],
      color: 'blue'
    },
    {
      id: 'vegetative',
      name: 'Vegetative',
      duration: '28-42 days',
      temperature: '70-78°F',
      humidity: '55-65%',
      light: '18h/day',
      ppfd: '400-600 μmol/m²/s',
      tasks: ['Training', 'Pruning', 'Nutrition management'],
      color: 'purple'
    },
    {
      id: 'flowering',
      name: 'Flowering',
      duration: '56-70 days',
      temperature: '65-75°F',
      humidity: '45-55%',
      light: '12h/day',
      ppfd: '600-1000 μmol/m²/s',
      tasks: ['Bloom nutrients', 'Defoliation', 'Harvest prep'],
      color: 'orange'
    },
    {
      id: 'harvest',
      name: 'Harvest & Cure',
      duration: '14-21 days',
      temperature: '60-70°F',
      humidity: '50-60%',
      light: '0h/day',
      ppfd: '0 μmol/m²/s',
      tasks: ['Harvesting', 'Drying', 'Curing', 'Testing'],
      color: 'red'
    }
  ];

  const rooms = [
    {
      id: 'room-a',
      name: 'Room A - Veg',
      currentPhase: 'vegetative',
      plantCount: 240,
      dayInPhase: 21,
      nextTask: 'Pruning scheduled',
      status: 'optimal'
    },
    {
      id: 'room-b',
      name: 'Room B - Flower',
      currentPhase: 'flowering',
      plantCount: 180,
      dayInPhase: 35,
      nextTask: 'Defoliation needed',
      status: 'attention'
    },
    {
      id: 'room-c',
      name: 'Room C - Seedling',
      currentPhase: 'seedling',
      plantCount: 320,
      dayInPhase: 12,
      nextTask: 'Transplant ready',
      status: 'optimal'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Room B Defoliation',
      date: '2024-01-16',
      time: '09:00',
      room: 'Room B',
      priority: 'high',
      assignedTo: 'Sarah M.',
      type: 'cultivation'
    },
    {
      id: 2,
      title: 'Room C Transplanting',
      date: '2024-01-17',
      time: '10:30',
      room: 'Room C',
      priority: 'medium',
      assignedTo: 'Mike R.',
      type: 'cultivation'
    },
    {
      id: 3,
      title: 'Weekly Nutrient Check',
      date: '2024-01-18',
      time: '08:00',
      room: 'All Rooms',
      priority: 'medium',
      assignedTo: 'Team',
      type: 'maintenance'
    },
    {
      id: 4,
      title: 'Room A Harvest Prep',
      date: '2024-01-20',
      time: '14:00',
      room: 'Room A',
      priority: 'high',
      assignedTo: 'Alex K.',
      type: 'harvest'
    }
  ];

  const getPhaseColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      green: 'bg-green-400/10 text-green-400 border-green-400/20',
      blue: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
      purple: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
      orange: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
      red: 'bg-red-400/10 text-red-400 border-red-400/20'
    };
    return colorMap[color] || colorMap.green;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-400';
      case 'attention':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-400/10 text-red-400 border-red-400/20';
      case 'medium':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      case 'low':
        return 'bg-green-400/10 text-green-400 border-green-400/20';
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <Calendar className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Cultivation Planning</h1>
                <p className="text-gray-400">Plan and track your crop cycles and facility operations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
                {['calendar', 'timeline', 'phases'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      viewMode === mode
                        ? 'bg-green-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Plan
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-5 h-5 text-green-400" />
              <h3 className="font-medium text-white">Active Plants</h3>
            </div>
            <p className="text-2xl font-bold text-white">740</p>
            <p className="text-sm text-gray-400">Across 3 rooms</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Next Harvest</h3>
            </div>
            <p className="text-2xl font-bold text-white">21 days</p>
            <p className="text-sm text-gray-400">Room B expected</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="font-medium text-white">Cycle Efficiency</h3>
            </div>
            <p className="text-2xl font-bold text-white">94%</p>
            <p className="text-sm text-gray-400">Above target</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <h3 className="font-medium text-white">Tasks Today</h3>
            </div>
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-sm text-gray-400">2 high priority</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {viewMode === 'phases' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Growth Phases</h2>
                <div className="space-y-4">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getPhaseColor(phase.color)}`}>
                            Phase {index + 1}
                          </div>
                          <h3 className="text-lg font-bold text-white">{phase.name}</h3>
                          <span className="text-sm text-gray-400">{phase.duration}</span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-400" />
                          <div>
                            <p className="text-xs text-gray-400">Temperature</p>
                            <p className="text-sm text-white">{phase.temperature}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-400">Humidity</p>
                            <p className="text-sm text-white">{phase.humidity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-gray-400">Photoperiod</p>
                            <p className="text-sm text-white">{phase.light}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-400" />
                          <div>
                            <p className="text-xs text-gray-400">PPFD</p>
                            <p className="text-sm text-white">{phase.ppfd}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Key Tasks:</p>
                        <div className="flex flex-wrap gap-2">
                          {phase.tasks.map((task, taskIndex) => (
                            <span
                              key={taskIndex}
                              className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                            >
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'calendar' && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Cultivation Calendar</h2>
                  <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-800 rounded transition-colors">
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-white font-medium">January 2024</span>
                    <button className="p-2 hover:bg-gray-800 rounded transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    Interactive Calendar Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Full calendar view with task scheduling and phase tracking
                  </p>
                </div>
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6">Timeline View</h2>
                
                <div className="text-center py-16">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    Timeline View Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Gantt-style timeline for tracking multiple grow cycles
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Room Status */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold text-white mb-4">Room Status</h2>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{room.name}</h3>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(room.status)}`} />
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">
                      {phases.find(p => p.id === room.currentPhase)?.name} - Day {room.dayInPhase}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{room.plantCount} plants</span>
                      <span className="text-gray-300">{room.nextTask}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Upcoming Tasks</h2>
                <button className="text-green-400 hover:text-green-300 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {upcomingTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-sm">{task.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {task.date} at {task.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {task.room}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {task.assignedTo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-12 bg-yellow-900/20 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Planning Tools Expanding</h3>
              <p className="text-sm text-gray-400">
                Advanced planning features are in development. For immediate cultivation support, visit our{' '}
                <a href="/cultivation" className="text-yellow-400 hover:text-yellow-300">cultivation tools</a>
                {' '}or{' '}
                <a href="/operations" className="text-yellow-400 hover:text-yellow-300">operations center</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}