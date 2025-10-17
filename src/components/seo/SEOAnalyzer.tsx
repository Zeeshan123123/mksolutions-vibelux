'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { analyzeContent } from '@/lib/seo/seo-utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  FileText, 
  BarChart3,
  Globe,
  Hash,
  Eye
} from 'lucide-react';

interface SEOAnalyzerProps {
  content?: string;
  title?: string;
  description?: string;
  url?: string;
}

export function SEOAnalyzer({ 
  content: initialContent = '', 
  title: initialTitle = '',
  description: initialDescription = '',
  url = ''
}: SEOAnalyzerProps) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [keywords, setKeywords] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [seoScore, setSeoScore] = useState(0);

  useEffect(() => {
    if (content || title || description) {
      performAnalysis();
    }
  }, [content, title, description, keywords]);

  const performAnalysis = () => {
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    const contentAnalysis = analyzeContent(content, keywordList);
    
    // Calculate SEO score
    let score = 0;
    const maxScore = 100;
    
    // Title analysis (20 points)
    if (title.length >= 30 && title.length <= 60) score += 20;
    else if (title.length >= 20 && title.length <= 70) score += 10;
    
    // Description analysis (20 points)
    if (description.length >= 120 && description.length <= 160) score += 20;
    else if (description.length >= 100 && description.length <= 170) score += 10;
    
    // Content analysis (30 points)
    if (contentAnalysis.wordCount >= 300) score += 15;
    if (contentAnalysis.readabilityScore >= 60) score += 15;
    
    // Keyword optimization (20 points)
    const wellOptimizedKeywords = contentAnalysis.keywordAnalysis.filter(k => k.status === 'good').length;
    score += (wellOptimizedKeywords / Math.max(keywordList.length, 1)) * 20;
    
    // Structure (10 points)
    if (content.includes('##')) score += 5; // Has headings
    if (content.match(/!\[.*\]\(.*\)/)) score += 5; // Has images
    
    setSeoScore(Math.round(score));
    setAnalysis(contentAnalysis);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">OK</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              SEO Analysis
            </span>
            {getScoreBadge(seoScore)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall SEO Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(seoScore)}`}>
                  {seoScore}/100
                </span>
              </div>
              <Progress value={seoScore} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm text-muted-foreground">Readability</div>
                <div className="font-semibold">
                  {analysis?.readabilityScore ? `${Math.round(analysis.readabilityScore)}%` : 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-sm text-muted-foreground">Word Count</div>
                <div className="font-semibold">{analysis?.wordCount || 0}</div>
              </div>
              <div className="text-center">
                <Hash className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm text-muted-foreground">Keywords</div>
                <div className="font-semibold">
                  {analysis?.keywordAnalysis?.filter((k: any) => k.status === 'good').length || 0}/
                  {analysis?.keywordAnalysis?.length || 0}
                </div>
              </div>
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-sm text-muted-foreground">URL</div>
                <div className="font-semibold">{url ? 'Set' : 'Not Set'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Page Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              SEO Title ({title.length}/60 characters)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your SEO title..."
              className={title.length > 60 ? 'border-red-500' : ''}
            />
            {title.length > 60 && (
              <p className="text-xs text-red-500 mt-1">Title is too long</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Meta Description ({description.length}/160 characters)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter your meta description..."
              rows={3}
              className={description.length > 160 ? 'border-red-500' : ''}
            />
            {description.length > 160 && (
              <p className="text-xs text-red-500 mt-1">Description is too long</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Target Keywords (comma-separated)
            </label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="greenhouse, farming, cultivation..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Page Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your page content..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Readability */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {analysis.readabilityStatus === 'good' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
                Readability Analysis
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Score: {Math.round(analysis.readabilityScore)}/100</p>
                <p>Sentences: {analysis.sentences}</p>
                <p>Paragraphs: {analysis.paragraphs}</p>
              </div>
            </div>
            
            {/* Keyword Analysis */}
            {analysis.keywordAnalysis.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Keyword Analysis</h4>
                <div className="space-y-2">
                  {analysis.keywordAnalysis.map((kw: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {kw.status === 'good' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        {kw.keyword}
                      </span>
                      <span className="text-muted-foreground">
                        {kw.count}x ({kw.density})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}