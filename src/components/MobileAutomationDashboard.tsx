'use client'

import React, { useState } from 'react'
import { 
  MobileContainer, 
  MobileCard, 
  MobileButton, 
  MobileGrid, 
  MobileStatusBadge,
  MobileSlidePanel 
} from '@/components/ui/mobile-responsive'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Filter, 
  Clock, 
  Zap,
  Droplets,
  Thermometer,
  Wind,
  Eye,
  Bug,
  Leaf,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'

interface AutomationRule {
  id: string
  name: string
  type: 'climate' | 'irrigation' | 'harvest' | 'health' | 'ipm'
  status: 'active' | 'inactive' | 'error'
  trigger: string
  action: string
  lastRun: string
  nextRun?: string
}

// Mock data for demonstration
const mockRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Climate Control',
    type: 'climate',
    status: 'active',
    trigger: 'Temperature > 80°F',
    action: 'Increase humidity by 5%',
    lastRun: '45 min ago',
    nextRun: 'Continuous'
  },
  {
    id: '2',
    name: 'Emergency Irrigation',
    type: 'irrigation',
    status: 'active',
    trigger: 'Substrate WC < 30%',
    action: 'Trigger irrigation cycle',
    lastRun: '3 days ago'
  },
  {
    id: '3',
    name: 'Harvest Alert',
    type: 'harvest',
    status: 'active',
    trigger: 'Day 56 in Flowering',
    action: 'Notify harvest team',
    lastRun: 'Yesterday'
  },
  {
    id: '4',
    name: 'Health Check',
    type: 'health',
    status: 'active',
    trigger: 'Health Score < 85%',
    action: 'Trigger visual inspection',
    lastRun: '5 hours ago'
  },
  {
    id: '5',
    name: 'IPM Response',
    type: 'ipm',
    status: 'active',
    trigger: 'Pest population > threshold',
    action: 'Release beneficial insects',
    lastRun: '2 days ago'
  }
]

const typeIcons = {
  climate: Thermometer,
  irrigation: Droplets,
  harvest: Leaf,
  health: Eye,
  ipm: Bug
}

const typeColors = {
  climate: 'blue',
  irrigation: 'green',
  harvest: 'orange',
  health: 'purple',
  ipm: 'red'
} as const

export function MobileAutomationDashboard() {
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<'all' | AutomationRule['type']>('all')

  const filteredRules = filter === 'all' 
    ? mockRules 
    : mockRules.filter(rule => rule.type === filter)

  const activeRules = mockRules.filter(rule => rule.status === 'active').length
  const totalRules = mockRules.length

  return (
    <MobileContainer>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Automation Rules
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {activeRules} Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {totalRules - activeRules} Inactive
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <MobileButton
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </MobileButton>
            <MobileButton
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </MobileButton>
          </div>
        </div>
      </div>

      {/* Performance Summary Card */}
      <MobileCard className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Today's Performance
        </h3>
        <MobileGrid cols={2} smCols={4} gap={4}>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              32
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Active Processes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              42%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              CPU Usage
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              68%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Memory Usage
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              12 Mbps
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Network
            </div>
          </div>
        </MobileGrid>
      </MobileCard>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const IconComponent = typeIcons[rule.type]
          const statusColor = rule.status === 'active' ? 'success' : 
                            rule.status === 'error' ? 'error' : 'default'
          
          return (
            <MobileCard 
              key={rule.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedRule(rule)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`
                    p-2 rounded-lg
                    ${typeColors[rule.type] === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' : ''}
                    ${typeColors[rule.type] === 'green' ? 'bg-green-100 dark:bg-green-900/20' : ''}
                    ${typeColors[rule.type] === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' : ''}
                    ${typeColors[rule.type] === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' : ''}
                    ${typeColors[rule.type] === 'red' ? 'bg-red-100 dark:bg-red-900/20' : ''}
                  `}>
                    <IconComponent className={`
                      w-5 h-5
                      ${typeColors[rule.type] === 'blue' ? 'text-blue-600 dark:text-blue-400' : ''}
                      ${typeColors[rule.type] === 'green' ? 'text-green-600 dark:text-green-400' : ''}
                      ${typeColors[rule.type] === 'orange' ? 'text-orange-600 dark:text-orange-400' : ''}
                      ${typeColors[rule.type] === 'purple' ? 'text-purple-600 dark:text-purple-400' : ''}
                      ${typeColors[rule.type] === 'red' ? 'text-red-600 dark:text-red-400' : ''}
                    `} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {rule.name}
                      </h4>
                      <MobileStatusBadge variant={statusColor}>
                        {rule.status}
                      </MobileStatusBadge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        <span className="font-medium">Trigger:</span> {rule.trigger}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        <span className="font-medium">Action:</span> {rule.action}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <Clock className="w-3 h-3" />
                        Last: {rule.lastRun}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MobileButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle toggle
                    }}
                  >
                    {rule.status === 'active' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </MobileButton>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </MobileCard>
          )
        })}
      </div>

      {/* Rule Details Panel */}
      <MobileSlidePanel
        isOpen={!!selectedRule}
        onClose={() => setSelectedRule(null)}
        title={selectedRule?.name}
      >
        {selectedRule && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <MobileStatusBadge 
                variant={selectedRule.status === 'active' ? 'success' : 'default'}
              >
                {selectedRule.status}
              </MobileStatusBadge>
              <Badge variant="outline">{selectedRule.type}</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Trigger Condition
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRule.trigger}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Action
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRule.action}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Last Run
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRule.lastRun}
                  </p>
                </div>
                {selectedRule.nextRun && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Next Run
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRule.nextRun}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <MobileButton variant="primary" className="flex-1">
                Edit Rule
              </MobileButton>
              <MobileButton variant="outline" className="flex-1">
                {selectedRule.status === 'active' ? 'Pause' : 'Activate'}
              </MobileButton>
            </div>
          </div>
        )}
      </MobileSlidePanel>

      {/* Filters Panel */}
      <MobileSlidePanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Rules"
      >
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Rule Type
            </h4>
            <div className="space-y-2">
              {['all', 'climate', 'irrigation', 'harvest', 'health', 'ipm'].map((type) => (
                <MobileButton
                  key={type}
                  variant={filter === type ? 'primary' : 'outline'}
                  className="w-full justify-start capitalize"
                  onClick={() => {
                    setFilter(type as typeof filter)
                    setShowFilters(false)
                  }}
                >
                  {type === 'all' ? 'All Types' : type}
                </MobileButton>
              ))}
            </div>
          </div>
        </div>
      </MobileSlidePanel>
    </MobileContainer>
  )
}

export default MobileAutomationDashboard