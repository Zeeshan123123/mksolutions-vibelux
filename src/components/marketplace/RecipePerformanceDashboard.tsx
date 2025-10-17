'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Zap,
  Leaf,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Download,
  Share2,
  Filter,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RecipeMetrics {
  recipeId: string;
  recipeName: string;
  authorName: string;
  totalInstalls: number;
  activeUsers: number;
  avgYieldIncrease: number;
  avgEnergyReduction: number;
  avgGrowthRate: number;
  userSatisfaction: number;
  cropTypes: string[];
  lastUpdated: Date;
}

interface PerformanceData {
  date: string;
  yield: number;
  energy: number;
  growthRate: number;
  qualityScore: number;
}

interface UserFeedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  metrics: {
    yieldChange: number;
    energyChange: number;
    qualityChange: number;
  };
  timestamp: Date;
}

export function RecipePerformanceDashboard() {
  const [selectedRecipe, setSelectedRecipe] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeMetrics[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  // Mock data generation
  useEffect(() => {
    generateMockData();
  }, [selectedRecipe, timeRange]);

  const generateMockData = () => {
    setLoading(true);
    
    // Mock recipes
    const mockRecipes: RecipeMetrics[] = [
      {
        recipeId: 'recipe-1',
        recipeName: 'High-Yield Cannabis Flower',
        authorName: 'Dr. Jane Smith',
        totalInstalls: 2847,
        activeUsers: 2145,
        avgYieldIncrease: 23.5,
        avgEnergyReduction: 18.7,
        avgGrowthRate: 15.2,
        userSatisfaction: 4.7,
        cropTypes: ['Cannabis', 'Flower'],
        lastUpdated: new Date('2024-01-15')
      },
      {
        recipeId: 'recipe-2',
        recipeName: 'Efficient Lettuce Production',
        authorName: 'GrowTech Labs',
        totalInstalls: 1532,
        activeUsers: 1289,
        avgYieldIncrease: 18.3,
        avgEnergyReduction: 22.4,
        avgGrowthRate: 12.8,
        userSatisfaction: 4.5,
        cropTypes: ['Lettuce', 'Leafy Greens'],
        lastUpdated: new Date('2024-01-10')
      },
      {
        recipeId: 'recipe-3',
        recipeName: 'Premium Tomato Spectrum',
        authorName: 'AgroLight Solutions',
        totalInstalls: 987,
        activeUsers: 823,
        avgYieldIncrease: 20.1,
        avgEnergyReduction: 15.9,
        avgGrowthRate: 14.5,
        userSatisfaction: 4.6,
        cropTypes: ['Tomato', 'Vine Crops'],
        lastUpdated: new Date('2024-01-08')
      }
    ];
    setRecipes(mockRecipes);

    // Mock performance data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const mockPerformance: PerformanceData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      mockPerformance.push({
        date: date.toISOString().split('T')[0],
        yield: 100 + Math.random() * 30 + i * 0.5,
        energy: 100 - Math.random() * 20 - i * 0.3,
        growthRate: 100 + Math.random() * 15 + i * 0.2,
        qualityScore: 85 + Math.random() * 10
      });
    }
    setPerformanceData(mockPerformance);

    // Mock user feedback
    const mockFeedback: UserFeedback[] = [
      {
        id: 'feedback-1',
        userId: 'user-123',
        userName: 'John\'s Farm',
        rating: 5,
        comment: 'Incredible results! Yield increased by 25% in just 2 cycles.',
        metrics: {
          yieldChange: 25,
          energyChange: -20,
          qualityChange: 15
        },
        timestamp: new Date('2024-01-18')
      },
      {
        id: 'feedback-2',
        userId: 'user-456',
        userName: 'Green Valley Growers',
        rating: 4,
        comment: 'Good energy savings, still optimizing for yield.',
        metrics: {
          yieldChange: 15,
          energyChange: -25,
          qualityChange: 10
        },
        timestamp: new Date('2024-01-17')
      },
      {
        id: 'feedback-3',
        userId: 'user-789',
        userName: 'Urban Harvest Co',
        rating: 5,
        comment: 'Best recipe we\'ve tried. Consistent results across all rooms.',
        metrics: {
          yieldChange: 22,
          energyChange: -18,
          qualityChange: 20
        },
        timestamp: new Date('2024-01-16')
      }
    ];
    setUserFeedback(mockFeedback);

    setTimeout(() => setLoading(false), 500);
  };

  const calculateTrend = (data: number[]): { trend: 'up' | 'down' | 'stable', percentage: number } => {
    if (data.length < 2) return { trend: 'stable', percentage: 0 };
    
    const recent = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
    const change = ((recent - previous) / previous) * 100;
    
    return {
      trend: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
      percentage: Math.abs(change)
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const exportData = () => {
    const data = {
      recipes,
      performanceData,
      userFeedback,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-performance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Recipe Performance Dashboard</h2>
          <p className="text-gray-400 mt-1">Real-time analytics for light recipe performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Share2 className="w-4 h-4 mr-2" />
            Share Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Recipes</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes.length}</div>
            <p className="text-xs text-muted-foreground">
              {recipes.reduce((sum, r) => sum + r.activeUsers, 0).toLocaleString()} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Yield Increase</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{(recipes.reduce((sum, r) => sum + r.avgYieldIncrease, 0) / recipes.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all recipes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Savings</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              -{(recipes.reduce((sum, r) => sum + r.avgEnergyReduction, 0) / recipes.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average reduction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(recipes.reduce((sum, r) => sum + r.userSatisfaction, 0) / recipes.length).toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Average rating
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="comparison">Recipe Comparison</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>
                Track key metrics across all recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="yield" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Yield Index"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Energy Usage"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="growthRate" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Growth Rate"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="qualityScore" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Quality Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Metric Distribution</CardTitle>
                <CardDescription>Performance breakdown by metric</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { metric: 'Yield', value: 85 },
                      { metric: 'Energy', value: 78 },
                      { metric: 'Growth', value: 82 },
                      { metric: 'Quality', value: 88 },
                      { metric: 'Consistency', value: 91 }
                    ]}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                      <PolarRadiusAxis stroke="#9CA3AF" />
                      <Radar 
                        name="Performance" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.6} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Crop Type</CardTitle>
                <CardDescription>Recipe effectiveness across different crops</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { crop: 'Cannabis', success: 92 },
                      { crop: 'Lettuce', success: 88 },
                      { crop: 'Tomatoes', success: 85 },
                      { crop: 'Herbs', success: 90 },
                      { crop: 'Peppers', success: 83 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="crop" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Bar dataKey="success" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Comparison</CardTitle>
              <CardDescription>
                Compare performance metrics across different recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Select recipes to compare:</p>
                <div className="flex flex-wrap gap-2">
                  {recipes.map((recipe) => (
                    <Badge
                      key={recipe.recipeId}
                      variant={selectedRecipes.includes(recipe.recipeId) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedRecipes(prev =>
                          prev.includes(recipe.recipeId)
                            ? prev.filter(id => id !== recipe.recipeId)
                            : [...prev, recipe.recipeId]
                        );
                      }}
                    >
                      {recipe.recipeName}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedRecipes.length > 0 && (
                <div className="space-y-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={recipes.filter(r => selectedRecipes.includes(r.recipeId))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="recipeName" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Legend />
                        <Bar dataKey="avgYieldIncrease" fill="#10b981" name="Yield %" />
                        <Bar dataKey="avgEnergyReduction" fill="#3b82f6" name="Energy Savings %" />
                        <Bar dataKey="avgGrowthRate" fill="#8b5cf6" name="Growth Rate %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recipes
                      .filter(r => selectedRecipes.includes(r.recipeId))
                      .map((recipe) => (
                        <Card key={recipe.recipeId}>
                          <CardHeader>
                            <CardTitle className="text-lg">{recipe.recipeName}</CardTitle>
                            <CardDescription>by {recipe.authorName}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Active Users</span>
                                <span className="text-sm font-medium">{recipe.activeUsers.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Satisfaction</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium">{recipe.userSatisfaction}</span>
                                  <span className="text-yellow-400">★</span>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Crop Types</span>
                                <span className="text-sm font-medium">{recipe.cropTypes.join(', ')}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback & Reviews</CardTitle>
              <CardDescription>
                Real experiences from growers using these recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white">{feedback.userName}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-600'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(feedback.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{feedback.comment}</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-gray-400">
                              Yield: <span className="text-green-400 font-medium">+{feedback.metrics.yieldChange}%</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-400">
                              Energy: <span className="text-blue-400 font-medium">{feedback.metrics.energyChange}%</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-400">
                              Quality: <span className="text-purple-400 font-medium">+{feedback.metrics.qualityChange}%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Analytics</CardTitle>
              <CardDescription>Sentiment and metric analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <h4 className="text-sm font-medium text-gray-400 mb-4">Rating Distribution</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '5 Stars', value: 65 },
                          { name: '4 Stars', value: 25 },
                          { name: '3 Stars', value: 8 },
                          { name: '2 Stars', value: 2 },
                          { name: '1 Star', value: 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2, 3, 4].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Common Feedback Themes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-sm">Energy savings exceeded expectations</span>
                      <Badge variant="outline">78%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-sm">Consistent yield improvements</span>
                      <Badge variant="outline">92%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-sm">Easy to implement</span>
                      <Badge variant="outline">85%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-sm">Better crop quality</span>
                      <Badge variant="outline">71%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Grower Correlation Analysis</CardTitle>
              <CardDescription>
                Identify patterns and correlations across different growing operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="energySavings" 
                      name="Energy Savings %" 
                      stroke="#9CA3AF"
                      label={{ value: 'Energy Savings (%)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="yieldIncrease" 
                      name="Yield Increase %" 
                      stroke="#9CA3AF"
                      label={{ value: 'Yield Increase (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    />
                    <Scatter
                      name="Cannabis Growers"
                      data={[
                        { energySavings: 15, yieldIncrease: 22, size: 1000 },
                        { energySavings: 18, yieldIncrease: 25, size: 1500 },
                        { energySavings: 22, yieldIncrease: 20, size: 800 },
                        { energySavings: 25, yieldIncrease: 28, size: 2000 },
                        { energySavings: 20, yieldIncrease: 24, size: 1200 }
                      ]}
                      fill="#8b5cf6"
                    />
                    <Scatter
                      name="Lettuce Growers"
                      data={[
                        { energySavings: 20, yieldIncrease: 18, size: 800 },
                        { energySavings: 24, yieldIncrease: 15, size: 600 },
                        { energySavings: 28, yieldIncrease: 20, size: 1000 },
                        { energySavings: 22, yieldIncrease: 17, size: 900 }
                      ]}
                      fill="#10b981"
                    />
                    <Scatter
                      name="Tomato Growers"
                      data={[
                        { energySavings: 12, yieldIncrease: 20, size: 1100 },
                        { energySavings: 16, yieldIncrease: 22, size: 1300 },
                        { energySavings: 14, yieldIncrease: 19, size: 900 }
                      ]}
                      fill="#f59e0b"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Key Insights:</strong> Cannabis growers show the strongest correlation 
                  between energy savings and yield increases. Lettuce growers prioritize energy efficiency, 
                  while tomato growers focus on yield optimization.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Adoption Trends</CardTitle>
                <CardDescription>Growth in recipe usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="yield" 
                        stackId="1"
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.6}
                        name="New Users"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="energy" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                        name="Active Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Performance</CardTitle>
                <CardDescription>AI-powered success predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cannabis - High Yield Recipe</span>
                      <Badge className="bg-green-500">95% Success Rate</Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      Predicted 23-27% yield increase based on 2,847 installations
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Lettuce - Efficiency Focus</span>
                      <Badge className="bg-blue-500">88% Success Rate</Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      Predicted 20-25% energy reduction with maintained yields
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tomato - Premium Quality</span>
                      <Badge className="bg-yellow-500">82% Success Rate</Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      Predicted 15-20% quality improvement with 18% yield gain
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}