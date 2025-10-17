'use client';

import { TierLevel } from '@/lib/access-control';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  X,
  Plus,
  GripVertical,
  Settings,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  LayoutGrid,
  BarChart3,
  TrendingUp,
  Zap,
  DollarSign,
  Activity,
  Calendar,
  FileText,
  Users,
  Target,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardPreset } from '@/lib/dashboard-presets';

// Widget Types
export type WidgetType = 
  | 'stats' 
  | 'chart' 
  | 'activity' 
  | 'quickActions' 
  | 'energySavings'
  | 'projectOverview'
  | 'systemHealth'
  | 'revenueTracking'
  | 'taskList'
  | 'notifications';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  data?: any;
  settings?: any;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EditableDashboardProps {
  userRole: 'user' | 'admin' | 'developer';
  subscriptionTier: TierLevel;
  onSave?: (layout: DashboardLayout) => void;
}

// Available widgets catalog
const WIDGET_CATALOG: Record<WidgetType, { 
  icon: any; 
  label: string; 
  description: string;
  minTier?: TierLevel;
  sizes: ('small' | 'medium' | 'large' | 'full')[];
}> = {
  stats: {
    icon: BarChart3,
    label: 'Key Statistics',
    description: 'Display important metrics and KPIs',
    sizes: ['small', 'medium', 'large']
  },
  chart: {
    icon: TrendingUp,
    label: 'Analytics Chart',
    description: 'Visualize data trends over time',
    minTier: 'professional',
    sizes: ['medium', 'large', 'full']
  },
  activity: {
    icon: Activity,
    label: 'Recent Activity',
    description: 'Track recent actions and updates',
    sizes: ['medium', 'large']
  },
  quickActions: {
    icon: LayoutGrid,
    label: 'Quick Actions',
    description: 'Shortcuts to common tasks',
    sizes: ['medium', 'large']
  },
  energySavings: {
    icon: Zap,
    label: 'Energy Savings',
    description: 'Monitor energy efficiency metrics',
    minTier: 'professional',
    sizes: ['small', 'medium', 'large']
  },
  projectOverview: {
    icon: Target,
    label: 'Project Overview',
    description: 'Summary of active projects',
    sizes: ['medium', 'large', 'full']
  },
  systemHealth: {
    icon: Activity,
    label: 'System Health',
    description: 'Monitor system performance',
    minTier: 'professional',
    sizes: ['small', 'medium']
  },
  revenueTracking: {
    icon: DollarSign,
    label: 'Revenue Tracking',
    description: 'Track revenue and savings',
    minTier: 'professional',
    sizes: ['medium', 'large']
  },
  taskList: {
    icon: FileText,
    label: 'Task List',
    description: 'Manage your tasks and todos',
    sizes: ['medium', 'large']
  },
  notifications: {
    icon: Calendar,
    label: 'Notifications',
    description: 'Important alerts and updates',
    sizes: ['small', 'medium']
  }
};

// Draggable Widget Component
const DraggableWidget: React.FC<{
  widget: Widget;
  index: number;
  moveWidget: (dragIndex: number, dropIndex: number) => void;
  removeWidget: (id: string) => void;
  isEditing: boolean;
}> = ({ widget, index, moveWidget, removeWidget, isEditing }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'widget',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditing,
  });

  const [, drop] = useDrop({
    accept: 'widget',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveWidget(item.index, index);
        item.index = index;
      }
    },
  });

  const widgetConfig = WIDGET_CATALOG[widget.type];
  const Icon = widgetConfig.icon;

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
    full: 'col-span-4'
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`${sizeClasses[widget.size]} ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="h-full border-gray-700 bg-gray-800 relative group">
        {isEditing && (
          <>
            <div className="absolute top-2 left-2 cursor-move z-10">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={() => removeWidget(widget.id)}
              className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Icon className="w-5 h-5" />
            {widget.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WidgetContent widget={widget} />
        </CardContent>
      </Card>
    </div>
  );
};

// Widget Content Renderer
const WidgetContent: React.FC<{ widget: Widget }> = ({ widget }) => {
  const data = widget.data || {};
  
  switch (widget.type) {
    case 'stats':
      return (
        <div className={`grid ${data.stats?.length > 4 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
          {data.stats ? data.stats.map((stat: any, idx: number) => (
            <div key={idx} className="text-center">
              <div className={`text-2xl font-bold ${
                stat.type === 'positive' ? 'text-green-400' : 
                stat.type === 'negative' ? 'text-red-400' : 
                'text-blue-400'
              }`}>{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
              {stat.change && (
                <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
              )}
            </div>
          )) : (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">98.5%</div>
                <div className="text-xs text-gray-400">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">12</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </>
          )}
        </div>
      );
      
    case 'activity':
      return (
        <div className="space-y-2">
          {data.activities ? data.activities.map((activity: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'completed' ? 'bg-green-400' : 
                activity.status === 'available' ? 'bg-blue-400' : 
                'bg-gray-400'
              }`}></div>
              <div className="flex-1">
                <span className="text-sm text-gray-300">{activity.title}</span>
                {activity.description && (
                  <span className="text-xs text-gray-500 block">{activity.description}</span>
                )}
              </div>
            </div>
          )) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-300">Project completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-300">New design created</span>
              </div>
            </>
          )}
        </div>
      );
      
    case 'energySavings':
      return (
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">
            ${data.currentMonth || '2,847'}
          </div>
          <div className="text-sm text-gray-400">Monthly Savings</div>
          <div className="text-xs text-green-400 mt-2">
            +{data.percentChange || '12'}% from last month
          </div>
          {data.yearToDate && (
            <div className="text-xs text-gray-500 mt-2">
              YTD: ${data.yearToDate.toLocaleString()}
            </div>
          )}
        </div>
      );
      
    case 'quickActions':
      return (
        <div className="grid grid-cols-2 gap-2">
          {data.actions ? data.actions.map((action: any, idx: number) => (
            <a
              key={idx}
              href={action.href}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-center text-sm text-white transition-colors"
            >
              {action.label}
            </a>
          )) : (
            <>
              <a href="/design" className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-center text-sm text-white">
                New Design
              </a>
              <a href="/calculators" className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-center text-sm text-white">
                Calculator
              </a>
            </>
          )}
        </div>
      );
      
    case 'projectOverview':
      return (
        <div className="space-y-2">
          {data.projects ? data.projects.map((project: any, idx: number) => (
            <div key={idx} className="bg-gray-700 rounded p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">{project.name}</span>
                <span className="text-xs text-gray-400">{project.completion}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.completion}%` }}
                />
              </div>
            </div>
          )) : (
            <div className="text-gray-400 text-center">No active projects</div>
          )}
        </div>
      );
      
    case 'systemHealth':
      return (
        <div className="space-y-2">
          {data.overall && (
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-green-400">{data.overall}%</div>
              <div className="text-xs text-gray-400">Overall Health</div>
            </div>
          )}
          {data.services && data.services.map((service: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{service.name}</span>
              <div className={`w-2 h-2 rounded-full ${
                service.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
              }`} />
            </div>
          ))}
        </div>
      );
      
    default:
      return <div className="text-gray-400">Widget content goes here</div>;
  }
};

export function EditableDashboard({ userRole, subscriptionTier, onSave }: EditableDashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showWidgetCatalog, setShowWidgetCatalog] = useState(false);

  // Load saved layout or use preset
  useEffect(() => {
    const savedLayout = localStorage.getItem(`dashboard-layout-${userRole}-${subscriptionTier}`);
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setWidgets(parsed.widgets);
      } catch (e) {
        console.error('Failed to load saved layout');
        // Fall back to preset
        const preset = getDashboardPreset(userRole, subscriptionTier);
        setWidgets(preset.widgets);
      }
    } else {
      // Use preset for first time
      const preset = getDashboardPreset(userRole, subscriptionTier);
      setWidgets(preset.widgets);
    }
  }, [userRole, subscriptionTier]);

  const moveWidget = (dragIndex: number, dropIndex: number) => {
    const draggedWidget = widgets[dragIndex];
    const newWidgets = [...widgets];
    newWidgets.splice(dragIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedWidget);
    setWidgets(newWidgets);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const addWidget = (type: WidgetType, size: 'small' | 'medium' | 'large' | 'full') => {
    const config = WIDGET_CATALOG[type];
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: config.label,
      size,
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetCatalog(false);
  };

  const saveLayout = () => {
    const layout: DashboardLayout = {
      id: Date.now().toString(),
      name: `${userRole} Dashboard`,
      widgets,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    localStorage.setItem(`dashboard-layout-${userRole}-${subscriptionTier}`, JSON.stringify(layout));
    
    if (onSave) {
      onSave(layout);
    }
    
    setIsEditing(false);
  };

  const resetLayout = () => {
    const preset = getDashboardPreset(userRole, subscriptionTier);
    setWidgets(preset.widgets);
    // Clear saved layout to use preset
    localStorage.removeItem(`dashboard-layout-${userRole}-${subscriptionTier}`);
  };

  const canUseWidget = (type: WidgetType) => {
    const config = WIDGET_CATALOG[type];
    if (!config.minTier) return true;
    
    const tierLevels = { free: 0, professional: 1, enterprise: 2 };
    return tierLevels[subscriptionTier] >= tierLevels[config.minTier];
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Customizable Dashboard</h2>
            {isEditing && (
              <span className="text-sm text-gray-400">Drag widgets to rearrange</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setShowWidgetCatalog(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Widget
                </button>
                <button
                  onClick={resetLayout}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={saveLayout}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Layout
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Edit Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-4 gap-4">
          {widgets.map((widget, index) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              index={index}
              moveWidget={moveWidget}
              removeWidget={removeWidget}
              isEditing={isEditing}
            />
          ))}
          
          {isEditing && widgets.length === 0 && (
            <div className="col-span-4 flex items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-lg">
              <div className="text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Click "Add Widget" to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Widget Catalog Modal */}
        {showWidgetCatalog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Add Widget</h3>
                  <button
                    onClick={() => setShowWidgetCatalog(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-4">
                {Object.entries(WIDGET_CATALOG).map(([type, config]) => {
                  const Icon = config.icon;
                  const canUse = canUseWidget(type as WidgetType);
                  
                  return (
                    <div
                      key={type}
                      className={`border rounded-lg p-4 ${
                        canUse 
                          ? 'border-gray-600 hover:border-purple-600 cursor-pointer' 
                          : 'border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-8 h-8 text-purple-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            {config.label}
                            {config.minTier && !canUse && (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">{config.description}</p>
                          
                          {canUse ? (
                            <div className="flex gap-2 mt-3">
                              {config.sizes.map(size => (
                                <button
                                  key={size}
                                  onClick={() => addWidget(type as WidgetType, size)}
                                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-orange-400 mt-2">
                              Requires {config.minTier} plan
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}