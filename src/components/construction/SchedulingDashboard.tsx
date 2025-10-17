/**
 * Construction Scheduling Dashboard
 * Advanced project phasing and sequencing management interface
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, Users, Layers, BarChart3, Settings } from 'lucide-react';
import { logger } from '@/lib/logging/production-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ProjectSequencingEngine, 
  ProjectSchedule, 
  ConstructionPhase, 
  ConstructionActivity,
  ScheduleAnalysis
} from '@/lib/construction/project-sequencing';
import { ProjectData, TaskEstimate } from '@/lib/construction/contractor-estimation';

interface SchedulingDashboardProps {
  projectData?: ProjectData;
  taskEstimates?: TaskEstimate[];
  onScheduleUpdate?: (schedule: ProjectSchedule) => void;
}

export function SchedulingDashboard({ projectData, taskEstimates, onScheduleUpdate }: SchedulingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ProjectSchedule | null>(null);
  const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const sequencingEngine = new ProjectSequencingEngine();

  useEffect(() => {
    if (projectData && taskEstimates && taskEstimates.length > 0) {
      generateInitialSchedule();
    }
  }, [projectData, taskEstimates]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateInitialSchedule = async () => {
    if (!projectData || !taskEstimates) return;

    setLoading(true);
    try {
      const startDate = projectData.startDate || new Date();
      const newSchedule = await sequencingEngine.createProjectSchedule(
        projectData,
        taskEstimates,
        startDate
      );

      setSchedule(newSchedule);
      onScheduleUpdate?.(newSchedule);

      // Generate analysis
      const scheduleAnalysis = await sequencingEngine.analyzeSchedule(newSchedule);
      setAnalysis(scheduleAnalysis);

    } catch (error) {
      logger.error('system', 'Schedule generation failed:', error );
    } finally {
      setLoading(false);
    }
  };

  // Future feature: Update activity progress
  // const updateActivityProgress = (activityId: string, progress: number) => {
  //   if (!schedule) return;

  //   const updatedSchedule = sequencingEngine.updateScheduleProgress(schedule, [
  //     { activityId, completionPercentage: progress }
  //   ]);

  //   setSchedule(updatedSchedule);
  //   onScheduleUpdate?.(updatedSchedule);
  // };

  // Future feature: Schedule optimization
  // const optimizeSchedule = (options: ScheduleOptimizationOptions) => {
  //   if (!schedule) return;

  //   const optimizedSchedule = sequencingEngine.optimizeSchedule(schedule, options);
  //   setSchedule(optimizedSchedule);
  //   onScheduleUpdate?.(optimizedSchedule);
  // };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDuration = (days: number) => {
    if (days < 7) return `${days} days`;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return remainingDays > 0 ? `${weeks}w ${remainingDays}d` : `${weeks} weeks`;
  };

  const getPhaseStatusColor = (phase: ConstructionPhase) => {
    switch (phase.status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getActivityStatusIcon = (activity: ConstructionActivity) => {
    switch (activity.status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating project schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Scheduling Dashboard</h1>
          <p className="text-gray-600">Advanced phasing and sequencing management</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          🎯 CPM Scheduling
        </Badge>
      </div>

      {schedule ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="critical-path">Critical Path</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Project Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDuration(schedule.totalDuration)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(schedule.baselineStart)} - {formatDate(schedule.forecastFinish)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Phases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {schedule.phases.length}
                  </div>
                  <p className="text-sm text-gray-600">
                    {schedule.phases.filter(p => p.status === 'completed').length} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {schedule.activities.length}
                  </div>
                  <p className="text-sm text-gray-600">
                    {schedule.criticalPath.length} on critical path
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {schedule.milestones.length}
                  </div>
                  <p className="text-sm text-gray-600">
                    {schedule.milestones.filter(m => m.status === 'achieved').length} achieved
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schedule Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schedule.phases.map((phase) => (
                      <div key={phase.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{phase.name}</span>
                          <span className="text-sm text-gray-600">
                            {phase.completionPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={phase.completionPercentage} className="flex-1" />
                          <div className={`w-3 h-3 rounded-full ${getPhaseStatusColor(phase)}`}></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.milestones
                      .filter(m => m.status === 'upcoming' || m.status === 'at_risk')
                      .slice(0, 5)
                      .map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{milestone.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(milestone.targetDate)}
                            </div>
                          </div>
                          <Badge 
                            variant={milestone.status === 'at_risk' ? 'destructive' : 'default'}
                            className="capitalize"
                          >
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {schedule.phases.map((phase) => (
                <Card 
                  key={phase.id} 
                  className={`cursor-pointer transition-all ${selectedPhase === phase.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="w-5 h-5" />
                          {phase.name}
                          {phase.milestone && <Badge variant="outline">Milestone</Badge>}
                          {phase.criticalPath && <Badge variant="destructive">Critical</Badge>}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatDuration(phase.duration)}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`capitalize ${phase.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          phase.status === 'delayed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {phase.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {phase.activities.length} activities
                        </span>
                      </div>
                      <span className="font-medium">
                        {phase.completionPercentage.toFixed(0)}% Complete
                      </span>
                    </div>
                    <Progress value={phase.completionPercentage} className="mb-3" />
                    
                    {selectedPhase === phase.id && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-3">Phase Activities</h4>
                        <div className="space-y-2">
                          {phase.activities.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                {getActivityStatusIcon(activity)}
                                <span className="text-sm">{activity.name}</span>
                                {activity.criticalPath && (
                                  <Badge variant="outline" size="sm">Critical</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDuration(activity.duration)}
                              </div>
                            </div>
                          ))}
                          {phase.activities.length > 5 && (
                            <div className="text-sm text-gray-500 text-center">
                              +{phase.activities.length - 5} more activities
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="space-y-4">
              {schedule.activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        {getActivityStatusIcon(activity)}
                        <div>
                          <h4 className="font-medium">{activity.name}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Duration: {formatDuration(activity.duration)}</span>
                            <span>Float: {activity.float.toFixed(1)} days</span>
                            {activity.weather_dependent && (
                              <Badge variant="outline" size="sm">Weather Dependent</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                        </div>
                        {activity.criticalPath && (
                          <Badge variant="destructive" className="mt-1">
                            Critical Path
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">
                        {activity.completionPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={activity.completionPercentage} className="mb-3" />

                    {activity.predecessors.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Dependencies:</span> {
                          activity.predecessors.map(p => 
                            schedule.activities.find(a => a.id === p.activityId)?.name
                          ).join(', ')
                        }
                      </div>
                    )}

                    {activity.quality_checkpoints.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Quality Checkpoints</div>
                        <div className="space-y-1">
                          {activity.quality_checkpoints.map((checkpoint) => (
                            <div key={checkpoint.id} className="flex items-center justify-between text-sm">
                              <span>{checkpoint.name}</span>
                              <Badge 
                                variant={checkpoint.status === 'passed' ? 'default' : 'outline'}
                                size="sm"
                              >
                                {checkpoint.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Critical Path Tab */}
          <TabsContent value="critical-path" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Critical Path Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {schedule.criticalPath.length}
                    </div>
                    <div className="text-sm text-gray-600">Critical Activities</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analysis ? formatDuration(analysis.criticalPathLength) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Critical Path Length</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis ? formatDuration(analysis.totalFloat) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Total Float Available</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Critical Path Sequence</h4>
                  {schedule.activities
                    .filter(a => a.criticalPath)
                    .sort((a, b) => a.earlyStart.getTime() - b.earlyStart.getTime())
                    .map((activity, index) => (
                      <div key={activity.id} className="flex items-center gap-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(activity.earlyStart)} - {formatDate(activity.earlyFinish)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatDuration(activity.duration)}</div>
                          <div className="text-sm text-red-600">Zero Float</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis && analysis.resourceUtilization.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.resourceUtilization.map((resource) => (
                      <div key={resource.resourceId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h4 className="font-medium">{resource.resourceId}</h4>
                            <p className="text-sm text-gray-600 capitalize">{resource.resourceType}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {resource.averageUtilization.toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600">Average Utilization</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Peak Utilization</span>
                            <span className="font-medium">{resource.peakUtilization.toFixed(0)}%</span>
                          </div>
                          <Progress value={resource.peakUtilization} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Resource utilization analysis will appear here once schedule is generated.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {analysis ? (
              <>
                {/* Schedule Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Schedule Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Risk Overview</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Overall Risk Level</span>
                            <Badge className={getRiskColor(analysis.riskAssessment.overallRisk)}>
                              {analysis.riskAssessment.overallRisk.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Probability of Delay</span>
                            <span className="font-medium">{analysis.riskAssessment.probabilityOfDelay}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Expected Delay</span>
                            <span className="font-medium">{formatDuration(analysis.riskAssessment.expectedDelay)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Mitigation Effectiveness</span>
                            <span className="font-medium">{analysis.riskAssessment.mitigationEffectiveness}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Key Risk Factors</h4>
                        <div className="space-y-2">
                          {analysis.riskAssessment.keyRisks.map((risk, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">{risk.category}</span>
                                <span className="text-sm text-gray-600">
                                  {(risk.probability * 100).toFixed(0)}% / {risk.impact}d
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{risk.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Optimization Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{rec.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                            </div>
                            <Badge 
                              variant={rec.priority === 'high' ? 'destructive' : 
                                      rec.priority === 'medium' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {rec.priority} Priority
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                            <div>
                              <span className="font-medium">Impact:</span> {rec.impact}
                            </div>
                            <div>
                              <span className="font-medium">Effort:</span> {rec.effort}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* What-If Scenarios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      What-If Scenarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.whatIfScenarios.map((scenario, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{scenario.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                            </div>
                            <Badge className={getRiskColor(scenario.results.riskLevel)}>
                              {scenario.results.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">New Finish Date:</span>
                              <div className="text-gray-600">{formatDate(scenario.results.newFinishDate)}</div>
                            </div>
                            <div>
                              <span className="font-medium">Schedule Change:</span>
                              <div className={scenario.results.scheduleVariance < 0 ? 'text-green-600' : 'text-red-600'}>
                                {scenario.results.scheduleVariance > 0 ? '+' : ''}{scenario.results.scheduleVariance}%
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Cost Impact:</span>
                              <div className={scenario.results.costImpact > 0 ? 'text-red-600' : 'text-green-600'}>
                                ${scenario.results.costImpact.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
                  <p className="text-gray-600">Schedule analysis will appear once a schedule is generated.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Schedule Generated</h3>
            <p className="text-gray-600 mb-4">
              Provide project data and task estimates to generate a comprehensive schedule
            </p>
            <Button onClick={generateInitialSchedule} disabled={!projectData || !taskEstimates}>
              Generate Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}