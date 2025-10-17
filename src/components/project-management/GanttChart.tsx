'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Circle,
  Play,
  Pause,
  Settings,
  ZoomIn,
  ZoomOut,
  Filter,
  Download,
  Share
} from 'lucide-react';
import type { 
  GanttTask, 
  GanttConfig, 
  ProjectTask, 
  TaskStatus, 
  TaskPriority 
} from '@/lib/project-management/project-types';

interface GanttChartProps {
  tasks: ProjectTask[];
  config?: Partial<GanttConfig>;
  onTaskUpdate?: (taskId: string, updates: Partial<ProjectTask>) => void;
  onTaskSelect?: (taskId: string) => void;
  selectedTaskId?: string;
  readOnly?: boolean;
  height?: number;
}

const defaultConfig: GanttConfig = {
  timeScale: 'week',
  showWeekends: true,
  showDependencies: true,
  showProgress: true,
  showCriticalPath: false,
  showBaseline: false,
  columnWidth: 30,
  rowHeight: 40
};

// Color schemes for different task types and statuses
const taskColors = {
  status: {
    not_started: '#6B7280',
    in_progress: '#3B82F6',
    completed: '#10B981',
    on_hold: '#F59E0B',
    delayed: '#EF4444',
    cancelled: '#9CA3AF'
  },
  priority: {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#0891B2',
    low: '#059669'
  },
  category: {
    design: '#8B5CF6',
    engineering: '#3B82F6',
    procurement: '#F59E0B',
    construction: '#EF4444',
    commissioning: '#10B981',
    testing: '#06B6D4',
    documentation: '#6366F1',
    approval: '#EC4899',
    training: '#84CC16',
    maintenance: '#6B7280'
  }
};

export function GanttChart({
  tasks,
  config: userConfig = {},
  onTaskUpdate,
  onTaskSelect,
  selectedTaskId,
  readOnly = false,
  height = 600
}: GanttChartProps) {
  const config = { ...defaultConfig, ...userConfig };
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date } | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    taskId?: string;
    type?: 'move' | 'resize-start' | 'resize-end';
    startX?: number;
  }>({ isDragging: false });
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: [] as TaskStatus[],
    priority: [] as TaskPriority[],
    assignee: [] as string[],
    phase: [] as string[]
  });

  const chartRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Convert project tasks to Gantt tasks
  useEffect(() => {
    const convertedTasks = convertProjectTasksToGantt(tasks);
    setGanttTasks(convertedTasks);
    
    // Calculate time range
    if (tasks.length > 0) {
      const dates = tasks.flatMap(task => [task.startDate, task.endDate]);
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      // Add padding
      minDate.setDate(minDate.getDate() - 7);
      maxDate.setDate(maxDate.getDate() + 7);
      
      setTimeRange({ start: minDate, end: maxDate });
    }
  }, [tasks]);

  // Generate time columns based on time scale
  const timeColumns = useMemo(() => {
    if (!timeRange) return [];
    
    const columns = [];
    const current = new Date(timeRange.start);
    
    while (current <= timeRange.end) {
      columns.push(new Date(current));
      
      switch (config.timeScale) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
    
    return columns;
  }, [timeRange, config.timeScale]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return ganttTasks.filter(task => {
      if (filters.status.length > 0) {
        const projectTask = tasks.find(t => t.id === task.id);
        if (!projectTask || !filters.status.includes(projectTask.status)) return false;
      }
      
      if (filters.priority.length > 0) {
        const projectTask = tasks.find(t => t.id === task.id);
        if (!projectTask || !filters.priority.includes(projectTask.priority)) return false;
      }
      
      if (filters.assignee.length > 0) {
        const projectTask = tasks.find(t => t.id === task.id);
        if (!projectTask || !projectTask.assignedTo.some(member => filters.assignee.includes(member.id))) return false;
      }
      
      return true;
    });
  }, [ganttTasks, tasks, filters]);

  const convertProjectTasksToGantt = (projectTasks: ProjectTask[]): GanttTask[] => {
    return projectTasks.map(task => ({
      id: task.id,
      name: task.name,
      start: task.startDate,
      end: task.endDate,
      duration: task.duration,
      progress: task.progress,
      dependencies: task.predecessors,
      assignee: task.assignedTo[0]?.name || 'Unassigned',
      color: getTaskColor(task),
      type: 'task' as const,
      children: []
    }));
  };

  const getTaskColor = (task: ProjectTask): string => {
    // Use status color primarily, with priority as fallback
    return taskColors.status[task.status] || taskColors.priority[task.priority] || '#6B7280';
  };

  const formatTimeColumn = (date: Date): string => {
    switch (config.timeScale) {
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getTaskPosition = (task: GanttTask): { left: number; width: number } => {
    if (!timeRange) return { left: 0, width: 0 };
    
    const totalDays = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const startDays = (task.start.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const durationDays = (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24);
    
    const totalWidth = timeColumns.length * config.columnWidth;
    const left = (startDays / totalDays) * totalWidth;
    const width = Math.max((durationDays / totalDays) * totalWidth, 10); // Minimum width of 10px
    
    return { left, width };
  };

  const handleTaskClick = (taskId: string) => {
    if (onTaskSelect) {
      onTaskSelect(taskId);
    }
  };

  const toggleTaskCollapse = (taskId: string) => {
    const newCollapsed = new Set(collapsedTasks);
    if (newCollapsed.has(taskId)) {
      newCollapsed.delete(taskId);
    } else {
      newCollapsed.add(taskId);
    }
    setCollapsedTasks(newCollapsed);
  };

  const renderTaskBar = (task: GanttTask, index: number) => {
    const position = getTaskPosition(task);
    const projectTask = tasks.find(t => t.id === task.id);
    const isSelected = selectedTaskId === task.id;
    
    if (!projectTask) return null;

    return (
      <div
        key={task.id}
        className="relative"
        style={{ height: config.rowHeight }}
      >
        {/* Task bar */}
        <div
          className={`absolute top-2 bottom-2 rounded cursor-pointer transition-all ${
            isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
          } ${readOnly ? 'cursor-default' : 'hover:shadow-md'}`}
          style={{
            left: `${position.left}px`,
            width: `${position.width}px`,
            backgroundColor: task.color,
            opacity: projectTask.status === 'cancelled' ? 0.5 : 0.9
          }}
          onClick={() => handleTaskClick(task.id)}
        >
          {/* Progress bar */}
          {config.showProgress && task.progress > 0 && (
            <div
              className="absolute top-0 bottom-0 bg-white bg-opacity-30 rounded-l"
              style={{ width: `${task.progress}%` }}
            />
          )}
          
          {/* Task name (if wide enough) */}
          {position.width > 100 && (
            <div className="absolute inset-0 flex items-center px-2">
              <span className="text-white text-sm font-medium truncate">
                {task.name}
              </span>
            </div>
          )}
          
          {/* Status indicator */}
          <div className="absolute top-0 right-0 m-1">
            {getStatusIcon(projectTask.status)}
          </div>
        </div>
        
        {/* Dependency lines */}
        {config.showDependencies && task.dependencies.map(depId => {
          const depTask = ganttTasks.find(t => t.id === depId);
          if (!depTask) return null;
          
          const depPosition = getTaskPosition(depTask);
          const currentPosition = position;
          
          return (
            <svg
              key={`dep-${task.id}-${depId}`}
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: config.rowHeight
              }}
            >
              <line
                x1={depPosition.left + depPosition.width}
                y1={config.rowHeight / 2}
                x2={currentPosition.left}
                y2={config.rowHeight / 2}
                stroke="#6B7280"
                strokeWidth="2"
                strokeDasharray="4,4"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          );
        })}
      </div>
    );
  };

  const getStatusIcon = (status: TaskStatus) => {
    const iconProps = { className: "w-3 h-3 text-white" };
    
    switch (status) {
      case 'completed':
        return <CheckCircle {...iconProps} />;
      case 'in_progress':
        return <Play {...iconProps} />;
      case 'on_hold':
        return <Pause {...iconProps} />;
      case 'delayed':
        return <AlertTriangle {...iconProps} />;
      case 'cancelled':
        return <Circle {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  const exportToImage = () => {
    // Implementation for exporting Gantt chart as image
    logger.info('system', 'Exporting Gantt chart...');
  };

  const printChart = () => {
    window.print();
  };

  if (!timeRange || filteredTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Timeline</h3>
          <p className="text-gray-500">Add tasks to your project to see the Gantt chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{filteredTasks.length} tasks</span>
            <span>•</span>
            <span>{timeRange.start.toLocaleDateString()} - {timeRange.end.toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map(scale => (
              <button
                key={scale}
                onClick={() => {/* Update time scale */}}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  config.timeScale === scale
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {scale.charAt(0).toUpperCase() + scale.slice(1)}
              </button>
            ))}
          </div>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={exportToImage}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
          >
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div 
        ref={chartRef}
        className="relative overflow-auto"
        style={{ height }}
      >
        <div className="flex">
          {/* Task list (left panel) */}
          <div className="flex-shrink-0 w-80 bg-gray-50 border-r border-gray-200">
            {/* Header */}
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 p-3">
              <div className="text-sm font-medium text-gray-700">Task Name</div>
            </div>
            
            {/* Task rows */}
            <div>
              {filteredTasks.map((task, index) => {
                const projectTask = tasks.find(t => t.id === task.id);
                if (!projectTask) return null;
                
                return (
                  <div
                    key={task.id}
                    className={`flex items-center p-3 border-b border-gray-200 cursor-pointer transition-colors ${
                      selectedTaskId === task.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    style={{ height: config.rowHeight }}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {/* Expand/collapse button */}
                      {task.children && task.children.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCollapse(task.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {collapsedTasks.has(task.id) ? (
                            <ChevronRight className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      
                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {task.name}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {task.assignee}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.duration}d
                          </span>
                          <span>{task.progress}%</span>
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(projectTask.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline (right panel) */}
          <div className="flex-1 min-w-0">
            {/* Timeline header */}
            <div 
              ref={timelineRef}
              className="sticky top-0 bg-gray-100 border-b border-gray-200 flex"
              style={{ height: 60 }}
            >
              {timeColumns.map((date, index) => (
                <div
                  key={index}
                  className="border-r border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700"
                  style={{ width: config.columnWidth, minWidth: config.columnWidth }}
                >
                  <div className="text-center">
                    {formatTimeColumn(date)}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline grid and tasks */}
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {timeColumns.map((_, index) => (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 border-r border-gray-200"
                    style={{ left: index * config.columnWidth }}
                  />
                ))}
              </div>

              {/* Task bars */}
              <div>
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="relative border-b border-gray-200"
                    style={{ height: config.rowHeight }}
                  >
                    {renderTaskBar(task, index)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SVG for dependency arrows */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6B7280"
              />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium text-gray-700">Status:</div>
            <div className="flex items-center space-x-4">
              {Object.entries(taskColors.status).map(([status, color]) => (
                <div key={status} className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}