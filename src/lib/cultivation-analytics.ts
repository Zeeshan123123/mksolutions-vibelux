// Labor efficiency analytics and reporting for cultivation tasks
// Provides detailed performance metrics, trend analysis, and optimization insights

import { LaborEfficiencyMetrics, CultivationTask, cultivationTaskTemplates } from './cultivation-tasks-database';

export interface WorkerPerformanceMetrics {
  workerId: string;
  workerName: string;
  totalTasksCompleted: number;
  totalTimeSpent: number; // minutes
  averageTimePerPlant: number;
  qualityScoreAverage: number;
  errorRate: number;
  efficiencyScore: number;
  specializations: string[]; // techniques they excel at
  improvementAreas: string[];
  performanceTrend: 'improving' | 'stable' | 'declining';
}

export interface TaskPerformanceAnalytics {
  taskId: string;
  taskName: string;
  technique: string;
  totalExecutions: number;
  averageTimePerPlant: number;
  targetTimePerPlant: number;
  efficiencyPercentage: number;
  qualityScoreAverage: number;
  commonErrors: Array<{
    type: string;
    frequency: number;
    impact: 'low' | 'medium' | 'high';
  }>;
  seasonalTrends: Array<{
    month: string;
    averageTime: number;
    qualityScore: number;
  }>;
}

export interface FacilityProductivityMetrics {
  facilityId: string;
  totalPlantsProcessed: number;
  totalLaborHours: number;
  averageTaskCompletionTime: number;
  qualityScoreOverall: number;
  laborCostPerPlant: number;
  productivityTrends: Array<{
    date: string;
    plantsPerHour: number;
    qualityScore: number;
    laborCost: number;
  }>;
  benchmarkComparison: {
    industryAverage: number;
    facilityPerformance: number;
    percentileRank: number;
  };
}

export interface CultivationOptimizationInsights {
  recommendations: Array<{
    type: 'training' | 'scheduling' | 'technique' | 'workflow';
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: string;
    implementationCost: 'low' | 'medium' | 'high';
    timeToImplement: string;
  }>;
  inefficiencies: Array<{
    area: string;
    description: string;
    potentialSavings: {
      timePercentage: number;
      costPerMonth: number;
    };
  }>;
  bestPractices: Array<{
    technique: string;
    description: string;
    successMetrics: string[];
  }>;
}

export class CultivationAnalytics {
  private metrics: LaborEfficiencyMetrics[] = [];

  constructor(metrics: LaborEfficiencyMetrics[] = []) {
    this.metrics = metrics;
  }

  addMetrics(newMetrics: LaborEfficiencyMetrics[]): void {
    this.metrics.push(...newMetrics);
  }

  // Worker Performance Analysis
  analyzeWorkerPerformance(workerId: string): WorkerPerformanceMetrics {
    const workerMetrics = this.metrics.filter(m => m.workerId === workerId);
    
    if (workerMetrics.length === 0) {
      throw new Error(`No metrics found for worker ${workerId}`);
    }

    const totalTasks = workerMetrics.length;
    const totalPlants = workerMetrics.reduce((sum, m) => sum + m.plantsProcessed, 0);
    const totalTime = workerMetrics.reduce((sum, m) => sum + m.timeSpent, 0);
    const averageTimePerPlant = totalTime / totalPlants;
    const qualityAverage = workerMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / totalTasks;
    const totalErrors = workerMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const errorRate = totalErrors / totalTasks;

    // Calculate efficiency score
    const taskTargets = workerMetrics.map(m => {
      const task = cultivationTaskTemplates[m.taskId];
      return task ? task.estimatedTime : 10; // default 10 minutes
    });
    const avgTarget = taskTargets.reduce((sum, t) => sum + t, 0) / taskTargets.length;
    const timeEfficiency = Math.max(0, 100 - ((averageTimePerPlant - avgTarget) / avgTarget * 100));
    const qualityFactor = (qualityAverage / 10) * 100;
    const efficiencyScore = Math.max(0, Math.min(100, (timeEfficiency + qualityFactor) / 2 - (errorRate * 10)));

    // Analyze specializations and improvement areas
    const taskFrequency = this.getTaskFrequencyForWorker(workerId);
    const specializations = this.identifySpecializations(workerId);
    const improvementAreas = this.identifyImprovementAreas(workerId);
    const performanceTrend = this.calculatePerformanceTrend(workerId);

    return {
      workerId,
      workerName: `Worker ${workerId}`, // Would come from worker database
      totalTasksCompleted: totalTasks,
      totalTimeSpent: totalTime,
      averageTimePerPlant,
      qualityScoreAverage: qualityAverage,
      errorRate,
      efficiencyScore,
      specializations,
      improvementAreas,
      performanceTrend
    };
  }

  // Task Performance Analysis
  analyzeTaskPerformance(taskId: string): TaskPerformanceAnalytics {
    const taskMetrics = this.metrics.filter(m => m.taskId === taskId);
    const task = cultivationTaskTemplates[taskId];
    
    if (!task) {
      throw new Error(`Unknown task ID: ${taskId}`);
    }

    if (taskMetrics.length === 0) {
      return {
        taskId,
        taskName: task.name,
        technique: task.technique,
        totalExecutions: 0,
        averageTimePerPlant: task.estimatedTime,
        targetTimePerPlant: task.estimatedTime,
        efficiencyPercentage: 0,
        qualityScoreAverage: 0,
        commonErrors: [],
        seasonalTrends: []
      };
    }

    const totalPlants = taskMetrics.reduce((sum, m) => sum + m.plantsProcessed, 0);
    const totalTime = taskMetrics.reduce((sum, m) => sum + m.timeSpent, 0);
    const averageTimePerPlant = totalTime / totalPlants;
    const qualityAverage = taskMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / taskMetrics.length;
    const efficiencyPercentage = Math.max(0, 100 - ((averageTimePerPlant - task.estimatedTime) / task.estimatedTime * 100));

    return {
      taskId,
      taskName: task.name,
      technique: task.technique,
      totalExecutions: taskMetrics.length,
      averageTimePerPlant,
      targetTimePerPlant: task.estimatedTime,
      efficiencyPercentage,
      qualityScoreAverage: qualityAverage,
      commonErrors: this.analyzeCommonErrors(taskId),
      seasonalTrends: this.calculateSeasonalTrends(taskId)
    };
  }

  // Facility-wide Analytics
  analyzeFacilityProductivity(facilityId: string, laborCostPerHour: number = 25): FacilityProductivityMetrics {
    const facilityMetrics = this.metrics.filter(m => m.timestamp); // All metrics for now
    
    const totalPlants = facilityMetrics.reduce((sum, m) => sum + m.plantsProcessed, 0);
    const totalTimeMinutes = facilityMetrics.reduce((sum, m) => sum + m.timeSpent, 0);
    const totalLaborHours = totalTimeMinutes / 60;
    const averageTaskTime = totalTimeMinutes / facilityMetrics.length;
    const qualityOverall = facilityMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / facilityMetrics.length;
    const laborCostPerPlant = (totalLaborHours * laborCostPerHour) / totalPlants;

    return {
      facilityId,
      totalPlantsProcessed: totalPlants,
      totalLaborHours,
      averageTaskCompletionTime: averageTaskTime,
      qualityScoreOverall: qualityOverall,
      laborCostPerPlant,
      productivityTrends: this.calculateProductivityTrends(),
      benchmarkComparison: {
        industryAverage: 2.5, // minutes per plant (example)
        facilityPerformance: totalTimeMinutes / totalPlants,
        percentileRank: this.calculatePercentileRank(totalTimeMinutes / totalPlants)
      }
    };
  }

  // Optimization Insights
  generateOptimizationInsights(): CultivationOptimizationInsights {
    const recommendations = this.generateRecommendations();
    const inefficiencies = this.identifyInefficiencies();
    const bestPractices = this.identifyBestPractices();

    return {
      recommendations,
      inefficiencies,
      bestPractices
    };
  }

  // Private helper methods
  private getTaskFrequencyForWorker(workerId: string): Record<string, number> {
    const workerMetrics = this.metrics.filter(m => m.workerId === workerId);
    const frequency: Record<string, number> = {};
    
    workerMetrics.forEach(m => {
      frequency[m.taskId] = (frequency[m.taskId] || 0) + 1;
    });
    
    return frequency;
  }

  private identifySpecializations(workerId: string): string[] {
    const workerMetrics = this.metrics.filter(m => m.workerId === workerId);
    const taskPerformance: Record<string, { time: number; quality: number; count: number }> = {};

    workerMetrics.forEach(m => {
      if (!taskPerformance[m.taskId]) {
        taskPerformance[m.taskId] = { time: 0, quality: 0, count: 0 };
      }
      taskPerformance[m.taskId].time += m.timeSpent / m.plantsProcessed;
      taskPerformance[m.taskId].quality += m.qualityScore;
      taskPerformance[m.taskId].count++;
    });

    const specializations: string[] = [];
    Object.entries(taskPerformance).forEach(([taskId, perf]) => {
      const avgTime = perf.time / perf.count;
      const avgQuality = perf.quality / perf.count;
      const task = cultivationTaskTemplates[taskId];
      
      if (task && avgTime <= task.estimatedTime && avgQuality >= 8) {
        specializations.push(task.technique);
      }
    });

    return specializations;
  }

  private identifyImprovementAreas(workerId: string): string[] {
    const workerMetrics = this.metrics.filter(m => m.workerId === workerId);
    const improvements: string[] = [];

    const avgQuality = workerMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / workerMetrics.length;
    const avgErrors = workerMetrics.reduce((sum, m) => sum + m.errorCount, 0) / workerMetrics.length;

    if (avgQuality < 7) improvements.push('Quality consistency');
    if (avgErrors > 1) improvements.push('Error reduction');

    // Check for slow tasks
    const slowTasks = workerMetrics.filter(m => {
      const task = cultivationTaskTemplates[m.taskId];
      return task && (m.timeSpent / m.plantsProcessed) > task.estimatedTime * 1.3;
    });

    if (slowTasks.length > workerMetrics.length * 0.3) {
      improvements.push('Speed optimization');
    }

    return improvements;
  }

  private calculatePerformanceTrend(workerId: string): 'improving' | 'stable' | 'declining' {
    const workerMetrics = this.metrics
      .filter(m => m.workerId === workerId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (workerMetrics.length < 3) return 'stable';

    const recentMetrics = workerMetrics.slice(-5);
    const earlierMetrics = workerMetrics.slice(0, 5);

    const recentAvgQuality = recentMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / recentMetrics.length;
    const earlierAvgQuality = earlierMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / earlierMetrics.length;

    const qualityChange = recentAvgQuality - earlierAvgQuality;

    if (qualityChange > 0.5) return 'improving';
    if (qualityChange < -0.5) return 'declining';
    return 'stable';
  }

  private analyzeCommonErrors(taskId: string): Array<{ type: string; frequency: number; impact: 'low' | 'medium' | 'high' }> {
    const taskMetrics = this.metrics.filter(m => m.taskId === taskId);
    const totalErrors = taskMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    
    // This would be enhanced with actual error tracking
    const commonErrors = [
      { type: 'Improper tool sterilization', frequency: totalErrors * 0.3, impact: 'high' as const },
      { type: 'Cutting at wrong angle', frequency: totalErrors * 0.25, impact: 'medium' as const },
      { type: 'Removing too much material', frequency: totalErrors * 0.2, impact: 'high' as const },
      { type: 'Poor timing', frequency: totalErrors * 0.15, impact: 'medium' as const },
      { type: 'Inadequate cleanup', frequency: totalErrors * 0.1, impact: 'low' as const }
    ];

    return commonErrors.filter(e => e.frequency > 0);
  }

  private calculateSeasonalTrends(taskId: string): Array<{ month: string; averageTime: number; qualityScore: number }> {
    const taskMetrics = this.metrics.filter(m => m.taskId === taskId);
    const monthlyData: Record<string, { totalTime: number; totalQuality: number; count: number }> = {};

    taskMetrics.forEach(m => {
      const month = m.timestamp.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { totalTime: 0, totalQuality: 0, count: 0 };
      }
      monthlyData[month].totalTime += m.timeSpent / m.plantsProcessed;
      monthlyData[month].totalQuality += m.qualityScore;
      monthlyData[month].count++;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      averageTime: data.totalTime / data.count,
      qualityScore: data.totalQuality / data.count
    }));
  }

  private calculateProductivityTrends(): Array<{ date: string; plantsPerHour: number; qualityScore: number; laborCost: number }> {
    // Group metrics by day and calculate trends
    const dailyData: Record<string, { plants: number; time: number; quality: number; count: number }> = {};

    this.metrics.forEach(m => {
      const date = m.timestamp.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { plants: 0, time: 0, quality: 0, count: 0 };
      }
      dailyData[date].plants += m.plantsProcessed;
      dailyData[date].time += m.timeSpent;
      dailyData[date].quality += m.qualityScore;
      dailyData[date].count++;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      plantsPerHour: (data.plants / data.time) * 60,
      qualityScore: data.quality / data.count,
      laborCost: (data.time / 60) * 25 // $25/hour
    }));
  }

  private calculatePercentileRank(facilityPerformance: number): number {
    // Simplified percentile calculation
    const industryBenchmarks = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]; // minutes per plant
    const betterThan = industryBenchmarks.filter(b => facilityPerformance < b).length;
    return (betterThan / industryBenchmarks.length) * 100;
  }

  private generateRecommendations(): Array<{
    type: 'training' | 'scheduling' | 'technique' | 'workflow';
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: string;
    implementationCost: 'low' | 'medium' | 'high';
    timeToImplement: string;
  }> {
    const recommendations = [];

    // Analyze quality scores
    const avgQuality = this.metrics.reduce((sum, m) => sum + m.qualityScore, 0) / this.metrics.length;
    if (avgQuality < 7) {
      recommendations.push({
        type: 'training' as const,
        priority: 'high' as const,
        description: 'Implement comprehensive quality training program',
        expectedImpact: '15-25% improvement in quality scores',
        implementationCost: 'medium' as const,
        timeToImplement: '2-3 weeks'
      });
    }

    // Analyze efficiency
    const avgTimeEfficiency = this.calculateOverallEfficiency();
    if (avgTimeEfficiency < 80) {
      recommendations.push({
        type: 'workflow' as const,
        priority: 'high' as const,
        description: 'Optimize task workflows and tool organization',
        expectedImpact: '10-20% reduction in task completion time',
        implementationCost: 'low' as const,
        timeToImplement: '1-2 weeks'
      });
    }

    return recommendations;
  }

  private identifyInefficiencies(): Array<{
    area: string;
    description: string;
    potentialSavings: { timePercentage: number; costPerMonth: number };
  }> {
    return [
      {
        area: 'Tool preparation',
        description: 'Workers spending excessive time on tool sterilization',
        potentialSavings: { timePercentage: 12, costPerMonth: 1500 }
      },
      {
        area: 'Plant identification',
        description: 'Time lost identifying correct plants for treatment',
        potentialSavings: { timePercentage: 8, costPerMonth: 1000 }
      }
    ];
  }

  private identifyBestPractices(): Array<{
    technique: string;
    description: string;
    successMetrics: string[];
  }> {
    return [
      {
        technique: 'LST',
        description: 'Gradual training over multiple sessions shows best results',
        successMetrics: ['95% quality score', '20% faster than average', 'Zero plant stress incidents']
      },
      {
        technique: 'Depruning',
        description: 'Early morning timing reduces plant stress significantly',
        successMetrics: ['30% faster recovery', '15% better yield', 'Reduced pathogen risk']
      }
    ];
  }

  private calculateOverallEfficiency(): number {
    const efficiencyScores = this.metrics.map(m => {
      const task = cultivationTaskTemplates[m.taskId];
      if (!task) return 0;
      
      const actualTime = m.timeSpent / m.plantsProcessed;
      return Math.max(0, 100 - ((actualTime - task.estimatedTime) / task.estimatedTime * 100));
    });

    return efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length;
  }
}

// Export utility functions
export function createAnalyticsReport(
  analytics: CultivationAnalytics,
  facilityId: string,
  timeRange: { start: Date; end: Date }
): {
  facilityMetrics: FacilityProductivityMetrics;
  optimizationInsights: CultivationOptimizationInsights;
  topPerformers: WorkerPerformanceMetrics[];
  taskEfficiency: TaskPerformanceAnalytics[];
} {
  const facilityMetrics = analytics.analyzeFacilityProductivity(facilityId);
  const optimizationInsights = analytics.generateOptimizationInsights();
  
  // Get unique worker IDs and analyze top performers
  const workerIds = [...new Set(analytics['metrics'].map(m => m.workerId))];
  const workerPerformances = workerIds.map(id => analytics.analyzeWorkerPerformance(id));
  const topPerformers = workerPerformances
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .slice(0, 5);

  // Analyze all tasks
  const taskIds = [...new Set(analytics['metrics'].map(m => m.taskId))];
  const taskEfficiency = taskIds.map(id => analytics.analyzeTaskPerformance(id));

  return {
    facilityMetrics,
    optimizationInsights,
    topPerformers,
    taskEfficiency
  };
}