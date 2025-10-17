'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Settings,
  MapPin,
  Users,
  Leaf,
  AlertCircle,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Calendar as CalendarIcon,
  List,
  Grid3x3,
  Sun,
  Moon,
  Droplets,
  Activity,
  Package,
  Zap,
  TrendingUp,
  Target,
  Info
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  cycleId: string;
  cycleName: string;
  type: 'start' | 'end' | 'phase' | 'task' | 'milestone' | 'harvest';
  title: string;
  date: Date;
  time?: string;
  location: string;
  assignedTo?: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  color: string;
  details?: {
    phase?: string;
    task?: string;
    expectedYield?: number;
    notes?: string;
  };
}

interface DayData {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    cycleId: '1',
    cycleName: 'Lettuce Batch A-24',
    type: 'start',
    title: 'Start Lettuce A-24',
    date: new Date('2024-11-01'),
    time: '08:00',
    location: 'Greenhouse 1 - NFT A',
    assignedTo: ['John Doe'],
    priority: 'high',
    status: 'completed',
    color: 'bg-green-500'
  },
  {
    id: '2',
    cycleId: '1',
    cycleName: 'Lettuce Batch A-24',
    type: 'phase',
    title: 'Transplant to NFT',
    date: new Date('2024-11-04'),
    time: '09:00',
    location: 'Greenhouse 1 - NFT A',
    assignedTo: ['John Doe', 'Jane Smith'],
    priority: 'high',
    status: 'completed',
    color: 'bg-blue-500',
    details: {
      phase: 'Seedling',
      task: 'Transplant seedlings to NFT system'
    }
  },
  {
    id: '3',
    cycleId: '1',
    cycleName: 'Lettuce Batch A-24',
    type: 'milestone',
    title: 'Canopy Closure',
    date: new Date('2024-11-20'),
    location: 'Greenhouse 1 - NFT A',
    priority: 'medium',
    status: 'completed',
    color: 'bg-purple-500',
    details: {
      phase: 'Vegetative Growth',
      notes: 'Expected canopy closure - adjust spacing if needed'
    }
  },
  {
    id: '4',
    cycleId: '1',
    cycleName: 'Lettuce Batch A-24',
    type: 'harvest',
    title: 'Harvest Lettuce A-24',
    date: new Date('2024-12-06'),
    time: '06:00',
    location: 'Greenhouse 1 - NFT A',
    assignedTo: ['All Staff'],
    priority: 'high',
    status: 'pending',
    color: 'bg-orange-500',
    details: {
      expectedYield: 30,
      notes: 'Prepare packing materials, coordinate with shipping'
    }
  },
  {
    id: '5',
    cycleId: '2',
    cycleName: 'Tomato Crop 2024-Q4',
    type: 'task',
    title: 'Weekly Harvest',
    date: new Date('2024-11-28'),
    time: '07:00',
    location: 'Greenhouse 2',
    assignedTo: ['Mike Johnson'],
    priority: 'high',
    status: 'pending',
    color: 'bg-red-500',
    details: {
      phase: 'Harvest',
      task: 'Harvest ripe fruit, grade and pack'
    }
  },
  {
    id: '6',
    cycleId: '3',
    cycleName: 'Cannabis Room 3',
    type: 'start',
    title: 'Start Cannabis Room 3',
    date: new Date('2024-12-15'),
    time: '10:00',
    location: 'Indoor Facility - Room 3',
    assignedTo: ['Sarah Wilson'],
    priority: 'high',
    status: 'pending',
    color: 'bg-indigo-500'
  }
];

export function ProductionCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [filterFacility, setFilterFacility] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Get calendar data
  const getCalendarDays = (): DayData[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === date.getTime();
      });
      
      days.push({
        date,
        events: dayEvents,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();

  // Navigation
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event type colors and icons
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'start': return <Play className="w-3 h-3" />;
      case 'end': return <CheckCircle className="w-3 h-3" />;
      case 'phase': return <Activity className="w-3 h-3" />;
      case 'task': return <Clock className="w-3 h-3" />;
      case 'milestone': return <Target className="w-3 h-3" />;
      case 'harvest': return <Package className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesFacility = filterFacility === 'all' || event.location.includes(filterFacility);
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesFacility && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Production Calendar</h2>
          <p className="text-gray-400 mt-1">Schedule and track all production activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowEventModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="flex items-center bg-gray-800 rounded-lg">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 rounded-l-lg transition-colors ${
                viewMode === 'day' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 transition-colors ${
                viewMode === 'week' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-r-lg transition-colors ${
                viewMode === 'month' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
          </div>

          {/* Filters */}
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Facilities</option>
            <option value="Greenhouse 1">Greenhouse 1</option>
            <option value="Greenhouse 2">Greenhouse 2</option>
            <option value="Indoor Facility">Indoor Facility</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Events</option>
            <option value="start">Cycle Start</option>
            <option value="phase">Phase Change</option>
            <option value="task">Tasks</option>
            <option value="milestone">Milestones</option>
            <option value="harvest">Harvest</option>
          </select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-white ml-4">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 rounded-lg border transition-colors cursor-pointer ${
                  dayData.isCurrentMonth
                    ? dayData.isToday
                      ? 'bg-purple-900/20 border-purple-600'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    : 'bg-gray-900/30 border-gray-800'
                }`}
                onClick={() => setSelectedDate(dayData.date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    dayData.isCurrentMonth ? 'text-white' : 'text-gray-600'
                  }`}>
                    {dayData.date.getDate()}
                  </span>
                  {dayData.events.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {dayData.events.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayData.events.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={`px-2 py-1 rounded text-xs text-white flex items-center gap-1 ${event.color} hover:opacity-80 transition-opacity`}
                    >
                      {getEventIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayData.events.length > 3 && (
                    <div className="text-xs text-gray-400 text-center">
                      +{dayData.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week/Day Views */}
      {viewMode !== 'month' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <div className="text-center text-gray-400 py-12">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>{viewMode === 'week' ? 'Week' : 'Day'} view coming soon...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-300">Cycle Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-300">Phase Change</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-300">Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-300">Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-300">Harvest</span>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={(updatedEvent) => {
            setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Selected Date Events */}
      {selectedDate && (
        <SelectedDateEvents
          date={selectedDate}
          events={events.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            const selected = new Date(selectedDate);
            selected.setHours(0, 0, 0, 0);
            return eventDate.getTime() === selected.getTime();
          })}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

// Event Details Modal
function EventDetailsModal({
  event,
  onClose,
  onUpdate
}: {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: (event: CalendarEvent) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{event.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Event Type */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${event.color}`}>
              {getEventIcon(event.type)}
            </div>
            <div>
              <p className="text-sm text-gray-400">Event Type</p>
              <p className="text-white capitalize">{event.type.replace('-', ' ')}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Date & Time</p>
            <p className="text-white">
              {event.date.toLocaleDateString()} {event.time && `at ${event.time}`}
            </p>
          </div>

          {/* Location */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Location</p>
            <p className="text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {event.location}
            </p>
          </div>

          {/* Assigned To */}
          {event.assignedTo && event.assignedTo.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Assigned To</p>
              <div className="flex flex-wrap gap-2">
                {event.assignedTo.map((person, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Priority</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              event.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
            </span>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              event.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              event.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
              event.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {event.status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
            </span>
          </div>

          {/* Details */}
          {event.details && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              {event.details.phase && (
                <p className="text-sm">
                  <span className="text-gray-400">Phase:</span>{' '}
                  <span className="text-white">{event.details.phase}</span>
                </p>
              )}
              {event.details.task && (
                <p className="text-sm">
                  <span className="text-gray-400">Task:</span>{' '}
                  <span className="text-white">{event.details.task}</span>
                </p>
              )}
              {event.details.expectedYield && (
                <p className="text-sm">
                  <span className="text-gray-400">Expected Yield:</span>{' '}
                  <span className="text-white">{event.details.expectedYield} kg</span>
                </p>
              )}
              {event.details.notes && (
                <p className="text-sm">
                  <span className="text-gray-400">Notes:</span>{' '}
                  <span className="text-white">{event.details.notes}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {event.status !== 'completed' && (
            <button
              onClick={() => {
                onUpdate({ ...event, status: 'completed' });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Selected Date Events
function SelectedDateEvents({
  date,
  events,
  onClose
}: {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
}) {
  if (events.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            Events for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${event.color} mt-1`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{event.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{event.cycleName}</p>
                    {event.time && (
                      <p className="text-sm text-gray-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {event.time}
                      </p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {event.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  event.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                  event.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {event.status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper imports
import { X } from 'lucide-react';

// Helper function for event icons
function getEventIcon(type: string) {
  switch (type) {
    case 'start': return <Play className="w-4 h-4 text-white" />;
    case 'end': return <CheckCircle className="w-4 h-4 text-white" />;
    case 'phase': return <Activity className="w-4 h-4 text-white" />;
    case 'task': return <Clock className="w-4 h-4 text-white" />;
    case 'milestone': return <Target className="w-4 h-4 text-white" />;
    case 'harvest': return <Package className="w-4 h-4 text-white" />;
    default: return <Calendar className="w-4 h-4 text-white" />;
  }
}