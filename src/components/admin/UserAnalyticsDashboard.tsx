'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  TrendingUp,
  Activity,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  Filter,
  Download,
  MapPin,
  Eye,
  MousePointer,
  Timer,
  LogIn,
  UserPlus,
  UserMinus,
  BarChart3,
  PieChart,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sankey,
  Rectangle
} from 'recharts';

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
  avgSessionDuration: number;
  avgPageViews: number;
  bounceRate: number;
  retentionRate: number;
}

interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  avgLTV: number;
  churnRate: number;
}

interface DeviceStats {
  device: string;
  users: number;
  sessions: number;
  avgDuration: number;
}

interface GeographicData {
  location: string;
  users: number;
  revenue: number;
  growth: number;
}

interface UserJourneyStep {
  step: string;
  users: number;
  dropoff: number;
  conversionRate: number;
}

export function UserAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [segment, setSegment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [userJourney, setUserJourney] = useState<UserJourneyStep[]>([]);

  useEffect(() => {
    generateMockData();
  }, [timeRange, segment]);

  const generateMockData = () => {
    setLoading(true);

    // Mock metrics
    const mockMetrics: UserMetrics = {
      totalUsers: 12847,
      activeUsers: 3842,
      newUsers: 523,
      churnedUsers: 89,
      avgSessionDuration: 8.5,
      avgPageViews: 6.3,
      bounceRate: 32.5,
      retentionRate: 78.4
    };
    setMetrics(mockMetrics);

    // Mock user growth data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const mockGrowth = [];
    const startUsers = 10000;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      mockGrowth.push({
        date: date.toISOString().split('T')[0],
        totalUsers: startUsers + i * 95 + Math.floor(Math.random() * 50),
        activeUsers: Math.floor((startUsers + i * 95) * 0.3) + Math.floor(Math.random() * 100),
        newUsers: 50 + Math.floor(Math.random() * 30),
        sessions: 1200 + Math.floor(Math.random() * 400)
      });
    }
    setUserGrowth(mockGrowth);

    // Mock user segments
    const mockSegments: UserSegment[] = [
      { name: 'Power Users', count: 1284, percentage: 10, avgLTV: 450, churnRate: 2.1 },
      { name: 'Regular Users', count: 3855, percentage: 30, avgLTV: 180, churnRate: 5.3 },
      { name: 'Casual Users', count: 5138, percentage: 40, avgLTV: 75, churnRate: 12.7 },
      { name: 'Trial Users', count: 2570, percentage: 20, avgLTV: 0, churnRate: 45.2 }
    ];
    setUserSegments(mockSegments);

    // Mock device stats
    const mockDevices: DeviceStats[] = [
      { device: 'Desktop', users: 6423, sessions: 28450, avgDuration: 9.2 },
      { device: 'Mobile', users: 4891, sessions: 18230, avgDuration: 6.8 },
      { device: 'Tablet', users: 1533, sessions: 5420, avgDuration: 8.1 }
    ];
    setDeviceStats(mockDevices);

    // Mock geographic data
    const mockGeo: GeographicData[] = [
      { location: 'United States', users: 5234, revenue: 125600, growth: 18.5 },
      { location: 'Canada', users: 2145, revenue: 48900, growth: 22.3 },
      { location: 'United Kingdom', users: 1532, revenue: 38200, growth: 15.7 },
      { location: 'Australia', users: 987, revenue: 24500, growth: 28.9 },
      { location: 'Germany', users: 823, revenue: 19800, growth: 12.4 },
      { location: 'Other', users: 2126, revenue: 42300, growth: 19.8 }
    ];
    setGeographicData(mockGeo);

    // Mock user journey
    const mockJourney: UserJourneyStep[] = [
      { step: 'Landing Page', users: 10000, dropoff: 0, conversionRate: 100 },
      { step: 'Sign Up', users: 4500, dropoff: 55, conversionRate: 45 },
      { step: 'Onboarding', users: 3800, dropoff: 15.6, conversionRate: 84.4 },
      { step: 'First Design', users: 2850, dropoff: 25, conversionRate: 75 },
      { step: 'Subscription', users: 1425, dropoff: 50, conversionRate: 50 },
      { step: 'Active User', users: 1283, dropoff: 10, conversionRate: 90 }
    ];
    setUserJourney(mockJourney);

    setTimeout(() => setLoading(false), 500);
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const exportData = () => {
    const data = {
      metrics,
      userGrowth,
      userSegments,
      deviceStats,
      geographicData,
      userJourney,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">User Analytics</h2>
          <p className="text-gray-400 mt-1">Comprehensive user behavior and engagement insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="power">Power Users</SelectItem>
              <SelectItem value="regular">Regular Users</SelectItem>
              <SelectItem value="trial">Trial Users</SelectItem>
            </SelectContent>
          </Select>
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics?.activeUsers || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgSessionDuration} min</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.avgPageViews} pages/session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <UserPlus className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              30-day retention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>
                Track user acquisition and engagement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="totalUsers" 
                      stackId="1"
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.6}
                      name="Total Users"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stackId="2"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>New vs Returning Users</CardTitle>
                <CardDescription>Daily user acquisition breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowth.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Legend />
                      <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
                      <Bar dataKey="sessions" fill="#f59e0b" name="Sessions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity Heatmap</CardTitle>
                <CardDescription>Peak usage times by day and hour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                    <div key={day} className="space-y-1">
                      <div className="text-xs text-gray-400 text-center">{day}</div>
                      {[0, 6, 12, 18].map((hour) => (
                        <div
                          key={hour}
                          className="w-full h-8 rounded"
                          style={{
                            backgroundColor: `rgba(139, 92, 246, ${
                              Math.random() * 0.8 + 0.2
                            })`
                          }}
                          title={`${day} ${hour}:00 - ${hour + 6}:00`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Darker = Higher Activity
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Segments Distribution</CardTitle>
                <CardDescription>Breakdown of users by engagement level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={userSegments}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {userSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>Key metrics by user segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userSegments.map((segment, index) => (
                    <div key={segment.name} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-white">{segment.name}</span>
                        </div>
                        <Badge variant="outline">{segment.count.toLocaleString()} users</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Avg LTV:</span>
                          <span className="ml-2 text-white font-medium">${segment.avgLTV}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Churn Rate:</span>
                          <span className="ml-2 text-white font-medium">{segment.churnRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cohort Analysis</CardTitle>
              <CardDescription>User retention by signup cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-400">Cohort</th>
                      <th className="text-center py-2 text-gray-400">Week 1</th>
                      <th className="text-center py-2 text-gray-400">Week 2</th>
                      <th className="text-center py-2 text-gray-400">Week 3</th>
                      <th className="text-center py-2 text-gray-400">Week 4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Jan 2024', 'Feb 2024', 'Mar 2024'].map((cohort) => (
                      <tr key={cohort} className="border-b border-gray-800">
                        <td className="py-2 text-white">{cohort}</td>
                        <td className="text-center py-2">
                          <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded">
                            {(90 + Math.random() * 10).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-2">
                          <span className="px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded">
                            {(70 + Math.random() * 10).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-2">
                          <span className="px-2 py-1 bg-orange-900/50 text-orange-400 rounded">
                            {(50 + Math.random() * 10).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-2">
                          <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded">
                            {(40 + Math.random() * 10).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>User distribution by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceStats.map((device) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.device === 'Desktop' && <Monitor className="w-4 h-4 text-blue-400" />}
                        {device.device === 'Mobile' && <Smartphone className="w-4 h-4 text-green-400" />}
                        {device.device === 'Tablet' && <Tablet className="w-4 h-4 text-purple-400" />}
                        <span className="text-sm">{device.device}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{device.users.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{device.avgDuration} min avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Features Used</CardTitle>
                <CardDescription>Most popular platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { feature: 'Light Designer', usage: 89 },
                    { feature: 'Recipe Marketplace', usage: 72 },
                    { feature: 'Analytics Dashboard', usage: 68 },
                    { feature: 'AI Assistant', usage: 54 },
                    { feature: 'Export Tools', usage: 41 }
                  ].map((item) => (
                    <div key={item.feature}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.feature}</span>
                        <span className="text-gray-400">{item.usage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${item.usage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Actions</CardTitle>
                <CardDescription>Common user activities today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      Page Views
                    </span>
                    <span className="font-medium">24,583</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-gray-400" />
                      Clicks
                    </span>
                    <span className="font-medium">18,234</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-gray-400" />
                      Time on Site
                    </span>
                    <span className="font-medium">6h 42m</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-400" />
                      Exports
                    </span>
                    <span className="font-medium">432</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>Load times and bounce rates by page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { page: '/design', loadTime: 1.2, bounceRate: 12, views: 8234 },
                  { page: '/marketplace', loadTime: 1.8, bounceRate: 28, views: 5432 },
                  { page: '/analytics', loadTime: 2.1, bounceRate: 15, views: 3421 },
                  { page: '/settings', loadTime: 0.9, bounceRate: 45, views: 2134 },
                  { page: '/reports', loadTime: 2.5, bounceRate: 22, views: 1876 }
                ].map((page) => (
                  <div key={page.page} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{page.page}</span>
                      <Badge variant={page.loadTime < 2 ? "default" : "secondary"}>
                        {page.loadTime}s
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Views:</span>
                        <span className="ml-1 text-white">{page.views.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Bounce:</span>
                        <span className="ml-1 text-white">{page.bounceRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Load:</span>
                        <span className="ml-1 text-white">{page.loadTime}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Funnel</CardTitle>
              <CardDescription>
                Conversion funnel from landing to active user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userJourney.map((step, index) => (
                  <div key={step.step}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{step.step}</span>
                      <span className="text-sm text-gray-400">
                        {step.users.toLocaleString()} users ({step.conversionRate}%)
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-700 rounded-full h-8">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-8 rounded-full flex items-center justify-end pr-3"
                          style={{ width: `${(step.users / userJourney[0].users) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {((step.users / userJourney[0].users) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {index < userJourney.length - 1 && (
                        <div className="absolute -bottom-3 right-0 text-xs text-red-400">
                          -{step.dropoff}% dropoff
                        </div>
                      )}
                    </div>
                    {index < userJourney.length - 1 && <div className="h-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Common User Paths</CardTitle>
                <CardDescription>Most frequent navigation patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { path: 'Home → Design → Save', users: 3421, conversion: 78 },
                    { path: 'Home → Marketplace → Install', users: 2134, conversion: 45 },
                    { path: 'Design → Analytics → Export', users: 1876, conversion: 92 },
                    { path: 'Marketplace → Reviews → Purchase', users: 1234, conversion: 67 }
                  ].map((path) => (
                    <div key={path.path} className="p-3 bg-gray-800 rounded-lg">
                      <div className="font-medium text-white mb-1">{path.path}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{path.users.toLocaleString()} users</span>
                        <Badge variant={path.conversion > 70 ? "default" : "secondary"}>
                          {path.conversion}% conversion
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drop-off Points</CardTitle>
                <CardDescription>Where users are leaving the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { page: 'Pricing Page', dropoff: 45, reason: 'Price sensitivity' },
                    { page: 'Onboarding Step 3', dropoff: 32, reason: 'Complexity' },
                    { page: 'Design Export', dropoff: 28, reason: 'Feature limitation' },
                    { page: 'Account Settings', dropoff: 22, reason: 'Subscription management' }
                  ].map((item) => (
                    <div key={item.page} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{item.page}</span>
                        <Badge variant="destructive">{item.dropoff}% drop</Badge>
                      </div>
                      <div className="text-sm text-gray-400">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User and revenue breakdown by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geographicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="location" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="users" fill="#8b5cf6" name="Users" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Regions</CardTitle>
                <CardDescription>Performance metrics by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicData.map((region) => (
                    <div key={region.location} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-white">{region.location}</span>
                        </div>
                        <Badge variant={region.growth > 20 ? "default" : "secondary"}>
                          +{region.growth}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Users:</span>
                          <span className="ml-1 text-white">{region.users.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Revenue:</span>
                          <span className="ml-1 text-white">${region.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>Regions with high growth potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { region: 'Mexico', potential: 'High', users: 234, growth: 145 },
                    { region: 'Brazil', potential: 'High', users: 189, growth: 123 },
                    { region: 'Netherlands', potential: 'Medium', users: 156, growth: 87 },
                    { region: 'Japan', potential: 'Medium', users: 134, growth: 76 }
                  ].map((item) => (
                    <div key={item.region} className="p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{item.region}</span>
                        <Badge className={item.potential === 'High' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {item.potential} Potential
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.users} users</span>
                        <span className="text-green-400">+{item.growth}% YoY</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}