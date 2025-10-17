'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Lightbulb,
  Zap,
  Thermometer,
  Droplets,
  Activity,
  Award,
  DollarSign,
  Leaf,
  Download,
  ExternalLink,
  ArrowRight,
  Settings
} from 'lucide-react'

interface PilotProgram {
  id: string
  name: string
  facility: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed' | 'paused'
  progress: number
  objective: string
  participants: number
  estimatedSavings: number
  actualSavings?: number
  metrics: {
    energyReduction: number
    costSavings: number
    efficiencyGain: number
    sustainabilityScore: number
  }
}

interface PilotMetrics {
  totalPrograms: number
  activePrograms: number
  completedPrograms: number
  totalSavings: number
  averageEfficiencyGain: number
  participantSatisfaction: number
}

export function PilotProgramDashboard({ facilityId }: { facilityId: string }) {
  const [programs, setPrograms] = useState<PilotProgram[]>([])
  const [metrics, setMetrics] = useState<PilotMetrics>({
    totalPrograms: 0,
    activePrograms: 0,
    completedPrograms: 0,
    totalSavings: 0,
    averageEfficiencyGain: 0,
    participantSatisfaction: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading pilot program data
    const loadPilotData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1400))

      // Mock pilot programs
      setPrograms([
        {
          id: '1',
          name: 'Smart LED Optimization',
          facility: 'Facility A - Denver',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-04-15'),
          status: 'completed',
          progress: 100,
          objective: 'Reduce lighting energy consumption by 25% while maintaining optimal PPFD levels',
          participants: 12,
          estimatedSavings: 15000,
          actualSavings: 18500,
          metrics: {
            energyReduction: 28,
            costSavings: 18500,
            efficiencyGain: 23,
            sustainabilityScore: 92
          }
        },
        {
          id: '2',
          name: 'Dynamic Climate Control',
          facility: 'Facility B - Portland',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-05-01'),
          status: 'active',
          progress: 75,
          objective: 'Implement AI-driven HVAC optimization based on plant growth stages',
          participants: 8,
          estimatedSavings: 22000,
          actualSavings: 16500,
          metrics: {
            energyReduction: 22,
            costSavings: 16500,
            efficiencyGain: 18,
            sustainabilityScore: 88
          }
        },
        {
          id: '3',
          name: 'Peak Load Management',
          facility: 'Facility C - Phoenix',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-06-15'),
          status: 'active',
          progress: 45,
          objective: 'Reduce peak demand charges through intelligent load shifting',
          participants: 15,
          estimatedSavings: 35000,
          metrics: {
            energyReduction: 0,
            costSavings: 0,
            efficiencyGain: 0,
            sustainabilityScore: 0
          }
        },
        {
          id: '4',
          name: 'Renewable Integration',
          facility: 'Facility D - Austin',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-07-01'),
          status: 'planning',
          progress: 15,
          objective: 'Integrate solar panels with battery storage for energy independence',
          participants: 6,
          estimatedSavings: 45000,
          metrics: {
            energyReduction: 0,
            costSavings: 0,
            efficiencyGain: 0,
            sustainabilityScore: 0
          }
        },
        {
          id: '5',
          name: 'Water Recovery System',
          facility: 'Facility A - Denver',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'completed',
          progress: 100,
          objective: 'Implement closed-loop water recycling to reduce consumption by 40%',
          participants: 10,
          estimatedSavings: 8500,
          actualSavings: 9200,
          metrics: {
            energyReduction: 12,
            costSavings: 9200,
            efficiencyGain: 42,
            sustainabilityScore: 95
          }
        }
      ])

      // Calculate metrics
      const totalPrograms = 5
      const activePrograms = 2
      const completedPrograms = 2
      const totalSavings = 18500 + 16500 + 9200 // completed + active actual savings
      const averageEfficiencyGain = (23 + 18 + 42) / 3 // average of completed programs
      const participantSatisfaction = 91

      setMetrics({
        totalPrograms,
        activePrograms,
        completedPrograms,
        totalSavings,
        averageEfficiencyGain,
        participantSatisfaction
      })

      setLoading(false)
    }

    loadPilotData()
  }, [facilityId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'paused': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'active': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'planning': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'paused': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pilot Programs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Innovation testing and optimization initiatives across facilities
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
          <Button size="sm">
            <Lightbulb className="w-4 h-4 mr-2" />
            Propose New Pilot
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activePrograms} active, {metrics.completedPrograms} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed programs</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">ROI: 340%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency Gain</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageEfficiencyGain.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across completed pilots</p>
            <Progress value={metrics.averageEfficiencyGain} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.participantSatisfaction}%</div>
            <p className="text-xs text-muted-foreground">Participant feedback</p>
            <Progress value={metrics.participantSatisfaction} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Success Story Alert */}
      <Alert className="border-green-500/50 bg-green-500/10">
        <Award className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-green-800 dark:text-green-200">
                Smart LED Optimization pilot exceeded targets!
              </span>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                28% energy reduction achieved vs 25% target. Ready for full deployment.
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-green-500 text-green-700">
              View Results
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Programs</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="planning">In Planning</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs.filter(p => p.status === 'active').map((program) => (
              <Card key={program.id} className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(program.status)}
                      {program.name}
                    </CardTitle>
                    <Badge className={getStatusColor(program.status)}>
                      {program.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{program.objective}</p>
                    <p className="text-xs text-muted-foreground mt-1">{program.facility}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{program.progress}%</span>
                    </div>
                    <Progress value={program.progress} className="h-2" />
                  </div>

                  {program.actualSavings && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Savings</p>
                        <p className="font-medium">${program.actualSavings.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Energy Reduction</p>
                        <p className="font-medium">{program.metrics.energyReduction}%</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {program.participants} participants
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="space-y-4">
            {programs.filter(p => p.status === 'completed').map((program) => (
              <Card key={program.id} className="border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(program.status)}
                      <div>
                        <h3 className="font-semibold">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">{program.facility}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(program.status)}>
                      Completed
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Zap className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium">{program.metrics.energyReduction}%</p>
                      <p className="text-xs text-muted-foreground">Energy Reduction</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-medium">${program.actualSavings?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Cost Savings</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-sm font-medium">{program.metrics.efficiencyGain}%</p>
                      <p className="text-xs text-muted-foreground">Efficiency Gain</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Leaf className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium">{program.metrics.sustainabilityScore}</p>
                      <p className="text-xs text-muted-foreground">Sustainability Score</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {program.startDate.toLocaleDateString()} - {program.endDate.toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Full Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Implement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <div className="space-y-4">
            {programs.filter(p => p.status === 'planning').map((program) => (
              <Card key={program.id} className="border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(program.status)}
                      <div>
                        <h3 className="font-semibold">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">{program.facility}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(program.status)}>
                      Planning
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{program.objective}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated Savings</p>
                      <p className="font-medium">${program.estimatedSavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="font-medium">{program.participants} enrolled</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timeline</p>
                      <p className="font-medium">
                        {program.startDate.toLocaleDateString()} - {program.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Planning Progress</span>
                      <span>{program.progress}%</span>
                    </div>
                    <Progress value={program.progress} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Ready to launch soon</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm">
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Launch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Energy Optimization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-20 h-2" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost Reduction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-20 h-2" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sustainability</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Pilot program ROI trends</p>
                    <p className="text-xs">Average ROI: 340%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}