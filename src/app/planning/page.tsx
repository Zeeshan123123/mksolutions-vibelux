'use client';

import React, { useEffect, useState } from 'react';
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
  const [crops, setCrops] = useState<any[]>([])
  const [plantings, setPlantings] = useState<any[]>([])
  const [newCrop, setNewCrop] = useState({ name: '', variety: '', cycleDays: '' })
  const [newPlanting, setNewPlanting] = useState({ cropId: '', startDate: '', expectedHarvestDate: '', quantity: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [selectedPlantingId, setSelectedPlantingId] = useState<string>('')
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', assignedToUserId: '' })
  const [calendarFilterDate, setCalendarFilterDate] = useState<string>('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const [cRes, pRes] = await Promise.all([
          fetch('/api/crops'),
          fetch('/api/plantings')
        ])
        if (cRes.ok) setCrops((await cRes.json()).crops || [])
        if (pRes.ok) setPlantings((await pRes.json()).plantings || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const loadTasks = async (plantingId: string) => {
    try {
      const res = await fetch(`/api/plantings/${plantingId}/tasks`)
      if (res.ok) setTasks((await res.json()).tasks || [])
    } catch {}
  }

  // Calendar helpers
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  const startWeekDay = (startOfMonth.getDay() + 6) % 7 // make Monday=0
  const daysInMonth = endOfMonth.getDate()
  const calendarDays = Array.from({ length: startWeekDay + daysInMonth }).map((_, idx) => {
    const dayNum = idx - startWeekDay + 1
    const date = dayNum >= 1 && dayNum <= daysInMonth ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayNum) : null
    return date
  })

  const formatDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  const eventsByDate = (() => {
    const map = new Map<string, { plantings: number; tasks: number }>()
    plantings.forEach(p => {
      const s = new Date(p.startDate)
      const key = formatDateKey(s)
      map.set(key, { plantings: (map.get(key)?.plantings || 0) + 1, tasks: map.get(key)?.tasks || 0 })
      if (p.expectedHarvestDate) {
        const h = new Date(p.expectedHarvestDate)
        const hk = formatDateKey(h)
        map.set(hk, { plantings: (map.get(hk)?.plantings || 0) + 1, tasks: map.get(hk)?.tasks || 0 })
      }
    })
    tasks.forEach(t => {
      if (!t.dueDate) return
      const dk = formatDateKey(new Date(t.dueDate))
      map.set(dk, { plantings: map.get(dk)?.plantings || 0, tasks: (map.get(dk)?.tasks || 0) + 1 })
    })
    return map
  })()

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
            <p className="text-2xl font-bold text-white">{plantings.length}</p>
            <p className="text-sm text-gray-400">Active plantings</p>
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
            {/* Simple Data Panels */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Crops</h2>
                <div className="text-sm text-gray-500">{loading ? 'Loading…' : `${crops.length} total`}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {crops.map((c) => (
                    <div key={c.id} className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-white font-medium">{c.name}{c.variety ? ` – ${c.variety}` : ''}</div>
                      <div className="text-xs text-gray-400">Cycle: {c.cycleDays ?? 'n/a'} days</div>
                    </div>
                  ))}
                  {crops.length === 0 && <div className="text-sm text-gray-500">No crops yet</div>}
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="text-sm text-gray-300 mb-2">Add Crop</div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white col-span-1" placeholder="Name" value={newCrop.name} onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })} />
                    <input className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white col-span-1" placeholder="Variety" value={newCrop.variety} onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })} />
                    <input className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white col-span-1" placeholder="Cycle Days" type="number" value={newCrop.cycleDays} onChange={(e) => setNewCrop({ ...newCrop, cycleDays: e.target.value })} />
                  </div>
                  <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm" onClick={async () => {
                    if (!newCrop.name) return;
                    const res = await fetch('/api/crops', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newCrop, cycleDays: newCrop.cycleDays ? Number(newCrop.cycleDays) : null }) })
                    if (res.ok) {
                      const c = (await res.json()).crop
                      setCrops([c, ...crops])
                      setNewCrop({ name: '', variety: '', cycleDays: '' })
                    }
                  }}>Create</button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Plantings</h2>
                <div className="text-sm text-gray-500">{loading ? 'Loading…' : `${plantings.length} total`}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {plantings.map((p) => (
                    <div key={p.id} className={`p-3 bg-gray-800 rounded border ${selectedPlantingId===p.id ? 'border-green-600' : 'border-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{p.crop?.name || 'Planting'} • {new Date(p.startDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">Qty: {p.quantity ?? 'n/a'} • Location: {p.location || 'n/a'}</div>
                        </div>
                        <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white" onClick={async () => { setSelectedPlantingId(p.id); await loadTasks(p.id); }}>View Tasks</button>
                      </div>
                    </div>
                  ))}
                  {plantings.length === 0 && <div className="text-sm text-gray-500">No plantings yet</div>}
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="text-sm text-gray-300 mb-2">Add Planting</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white" value={newPlanting.cropId} onChange={(e) => setNewPlanting({ ...newPlanting, cropId: e.target.value })}>
                      <option value="">Select crop…</option>
                      {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white" type="date" value={newPlanting.startDate} onChange={(e) => setNewPlanting({ ...newPlanting, startDate: e.target.value })} />
                    <input className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white" type="date" value={newPlanting.expectedHarvestDate} onChange={(e) => setNewPlanting({ ...newPlanting, expectedHarvestDate: e.target.value })} />
                    <input className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white" type="number" placeholder="Quantity" value={newPlanting.quantity} onChange={(e) => setNewPlanting({ ...newPlanting, quantity: e.target.value })} />
                    <input className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white col-span-2" placeholder="Location" value={newPlanting.location} onChange={(e) => setNewPlanting({ ...newPlanting, location: e.target.value })} />
                  </div>
                  <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm" onClick={async () => {
                    if (!newPlanting.cropId || !newPlanting.startDate) return;
                    const res = await fetch('/api/plantings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cropId: newPlanting.cropId, startDate: newPlanting.startDate, expectedHarvestDate: newPlanting.expectedHarvestDate || null, quantity: newPlanting.quantity ? Number(newPlanting.quantity) : null, location: newPlanting.location || null }) })
                    if (res.ok) {
                      const p = (await res.json()).planting
                      setPlantings([p, ...plantings])
                      setNewPlanting({ cropId: '', startDate: '', expectedHarvestDate: '', quantity: '', location: '' })
                    }
                  }}>Create</button>
                </div>
              </div>
            </div>

            {/* Tasks Panel */}
            {selectedPlantingId && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-white">Tasks</h2>
                  <button className="text-sm text-gray-400" onClick={() => { setSelectedPlantingId(''); setTasks([]) }}>Close</button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {tasks.map((t) => (
                      <div key={t.id} className="p-2 bg-gray-800 rounded border border-gray-700 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white">{t.title}</div>
                          <div className="text-xs text-gray-400">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'n/a'} • {t.status}</div>
                        </div>
                        <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white" onClick={async () => {
                          const res = await fetch(`/api/plantings/${selectedPlantingId}/tasks/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: t.status === 'done' ? 'pending' : 'done' }) })
                          if (res.ok) {
                            const updated = (await res.json()).task
                            setTasks(tasks.map(x => x.id === updated.id ? updated : x))
                          }
                        }}>{t.status === 'done' ? 'Reopen' : 'Mark Done'}</button>
                      </div>
                    ))}
                    {tasks.length === 0 && <div className="text-sm text-gray-500">No tasks yet</div>}
                  </div>
                  <div className="p-3 bg-gray-800 rounded border border-gray-700">
                    <div className="text-sm text-gray-300 mb-2">Add Task</div>
                    <div className="space-y-2">
                      <input className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white" placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                      <input className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white" type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                      <input className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white" placeholder="Assign to (userId)" value={newTask.assignedToUserId} onChange={(e) => setNewTask({ ...newTask, assignedToUserId: e.target.value })} />
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm" onClick={async () => {
                        if (!newTask.title) return;
                        const res = await fetch(`/api/plantings/${selectedPlantingId}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTask.title, dueDate: newTask.dueDate || null, assignedToUserId: newTask.assignedToUserId || null }) })
                        if (res.ok) {
                          const t = (await res.json()).task
                          setTasks([t, ...tasks])
                          setNewTask({ title: '', dueDate: '', assignedToUserId: '' })
                        }
                      }}>Create Task</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Cultivation Calendar</h2>
                  <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-800 rounded transition-colors" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth()-1, 1))}>
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-white font-medium">{selectedDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span>
                    <button className="p-2 hover:bg-gray-800 rounded transition-colors" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth()+1, 1))}>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-xs text-gray-400 mb-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-center">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((d, idx) => (
                    <div key={idx} className={`h-24 rounded border ${d ? 'border-gray-800 bg-gray-850' : 'border-transparent'}`}>
                      {d && (
                        <button className={`w-full h-full text-left p-2 hover:bg-gray-800 transition-colors ${calendarFilterDate===formatDateKey(d) ? 'ring-1 ring-green-600' : ''}`} onClick={() => setCalendarFilterDate(formatDateKey(d))}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{d.getDate()}</span>
                            <div className="flex items-center gap-1">
                              {(() => { const ev = eventsByDate.get(formatDateKey(d)); return (
                                <>
                                  {ev?.plantings ? <span className="px-1 rounded bg-blue-900/40 text-blue-300 text-[10px]">{ev.plantings}P</span> : null}
                                  {ev?.tasks ? <span className="px-1 rounded bg-purple-900/40 text-purple-300 text-[10px]">{ev.tasks}T</span> : null}
                                </>
                              ) })()}
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {calendarFilterDate && (
                  <div className="mt-4 text-sm text-gray-300">
                    <div className="mb-1">Events on {calendarFilterDate}:</div>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        {(plantings.filter(p => formatDateKey(new Date(p.startDate))===calendarFilterDate || (p.expectedHarvestDate && formatDateKey(new Date(p.expectedHarvestDate))===calendarFilterDate))).map(p => (
                          <div key={p.id} className="p-2 bg-gray-800 rounded border border-gray-700">Planting • {p.crop?.name || p.id}</div>
                        ))}
                        {plantings.filter(p => formatDateKey(new Date(p.startDate))===calendarFilterDate || (p.expectedHarvestDate && formatDateKey(new Date(p.expectedHarvestDate))===calendarFilterDate)).length===0 && <div className="text-gray-500">No plantings</div>}
                      </div>
                      <div className="space-y-1">
                        {(tasks.filter(t => t.dueDate && formatDateKey(new Date(t.dueDate))===calendarFilterDate)).map(t => (
                          <div key={t.id} className="p-2 bg-gray-800 rounded border border-gray-700">Task • {t.title}</div>
                        ))}
                        {tasks.filter(t => t.dueDate && formatDateKey(new Date(t.dueDate))===calendarFilterDate).length===0 && <div className="text-gray-500">No tasks</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Timeline View</h2>
                </div>
                {/* Simple Gantt-like view for current and next month */}
                <div className="text-xs text-gray-400 mb-2">{selectedDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                <div className="space-y-2">
                  {plantings.map((p) => {
                    const s = new Date(p.startDate)
                    const e = p.expectedHarvestDate ? new Date(p.expectedHarvestDate) : new Date(s.getTime() + 14*24*60*60*1000)
                    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
                    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
                    const totalDays = monthEnd.getDate()
                    const dayWidth = 100 / totalDays
                    const clamp = (d: Date) => d < monthStart ? monthStart : d > monthEnd ? monthEnd : d
                    const cs = clamp(s)
                    const ce = clamp(e)
                    const left = ((cs.getDate() - 1) * dayWidth)
                    const width = Math.max(dayWidth, ((ce.getDate() - cs.getDate() + 1) * dayWidth))
                    return (
                      <div key={p.id} className="">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm text-white">{p.crop?.name || 'Planting'}</div>
                          <div className="text-xs text-gray-500">{s.toLocaleDateString()} → {e.toLocaleDateString()}</div>
                        </div>
                        <div className="h-6 bg-gray-800 rounded relative overflow-hidden border border-gray-700">
                          <div className="absolute top-0 bottom-0 bg-green-600/60" style={{ left: `${left}%`, width: `${width}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {plantings.length === 0 && <div className="text-sm text-gray-500 text-center py-8">No plantings to display</div>}
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