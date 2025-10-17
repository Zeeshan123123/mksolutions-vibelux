'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  FileText, 
  Database, 
  BarChart3, 
  Settings, 
  Plus,
  Download,
  Upload,
  BookOpen,
  FlaskConical,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Brain,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  ExternalLink,
  Eye,
  Calculator
} from 'lucide-react';

interface ResearchStats {
  totalPapers: number;
  totalExperiments: number;
  totalDataPoints: number;
  papersBySource: Record<string, number>;
  recentActivity: {
    date: Date;
    papers: number;
    experiments: number;
    dataEntries: number;
  }[];
}

interface Experiment {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: Date;
  treatments: { id: string; name: string }[];
  dataEntries: any[];
  analyses: any[];
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  source: string;
  publicationDate?: Date;
  journal?: string;
  doi?: string;
  abstract?: string;
  keywords: string[];
}

export default function ResearchDashboard() {
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'arxiv', 'scholar']);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await fetch('/api/research/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Load experiments
      const experimentsResponse = await fetch('/api/research/experiments');
      if (experimentsResponse.ok) {
        const experimentsData = await experimentsResponse.json();
        setExperiments(experimentsData.experiments);
      }

      // Load recent papers
      const papersResponse = await fetch('/api/research/papers?limit=10');
      if (papersResponse.ok) {
        const papersData = await papersResponse.json();
        setPapers(papersData.papers);
      }
    } catch (error) {
      logger.error('system', 'Error loading dashboard data:', error );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        sources: selectedSources.join(','),
        limit: '20',
        includeFullText: 'true',
      });

      const response = await fetch(`/api/research/papers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPapers(data.papers);
      }
    } catch (error) {
      logger.error('system', 'Search error:', error );
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'pubmed': return 'bg-blue-100 text-blue-800';
      case 'arxiv': return 'bg-green-100 text-green-800';
      case 'scholar': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading research dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Suite</h1>
          <p className="text-gray-600">
            Comprehensive research management and analysis platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Experiment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Papers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Experiments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExperiments}</p>
                </div>
                <FlaskConical className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDataPoints}</p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Analytics</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {experiments.reduce((sum, exp) => sum + exp.analyses.length, 0)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="papers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="papers">Literature</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="papers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Literature Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for research papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Label className="text-sm font-medium">Sources:</Label>
                {['pubmed', 'arxiv', 'scholar'].map(source => (
                  <div key={source} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id={source}
                      checked={selectedSources.includes(source)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSources([...selectedSources, source]);
                        } else {
                          setSelectedSources(selectedSources.filter(s => s !== source));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={source} className="text-sm capitalize">
                      {source}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-4">
            {papers.map((paper) => (
              <Card key={paper.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {paper.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSourceColor(paper.source)}>
                          {paper.source}
                        </Badge>
                        {paper.publicationDate && (
                          <span className="text-sm text-gray-500">
                            {new Date(paper.publicationDate).getFullYear()}
                          </span>
                        )}
                        {paper.journal && (
                          <span className="text-sm text-gray-500">
                            {paper.journal}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {paper.authors.join(', ')}
                      </p>
                      {paper.abstract && (
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {paper.abstract}
                        </p>
                      )}
                      {paper.keywords.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {paper.keywords.slice(0, 5).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {paper.doi && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="experiments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Experiments</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Experiment
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiments.map((experiment) => (
              <Card key={experiment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{experiment.title}</CardTitle>
                    <Badge className={getStatusColor(experiment.status)}>
                      {experiment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{experiment.type}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(experiment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {experiment.treatments.length} treatments
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {experiment.dataEntries.length} data points
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {experiment.analyses.length} analyses
                      </span>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Statistical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ANOVA</span>
                    <Button size="sm" variant="outline">Run</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regression</span>
                    <Button size="sm" variant="outline">Run</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Post-hoc Tests</span>
                    <Button size="sm" variant="outline">Run</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Power Analysis</span>
                    <Button size="sm" variant="outline">Run</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Experiment Designer
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calculator className="w-4 h-4 mr-2" />
                    Sample Size Calculator
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Protocol Generator
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Data Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.slice(0, 7).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">
                          {activity.date.toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {activity.papers > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {activity.papers} papers
                            </Badge>
                          )}
                          {activity.experiments > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {activity.experiments} experiments
                            </Badge>
                          )}
                          {activity.dataEntries > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {activity.dataEntries} data entries
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Paper Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.papersBySource).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getSourceColor(source)}>
                            {source}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}