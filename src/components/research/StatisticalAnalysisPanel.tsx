'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  LineChart, 
  Calculator, 
  Download, 
  Play,
  CheckCircle,
  AlertCircle,
  FileText,
  Table,
  TrendingUp,
  Target,
  Settings,
  Info,
  BookOpen
} from 'lucide-react';

interface AnalysisResult {
  id: string;
  type: string;
  method: string;
  results: any;
  summary: string;
  performedAt: Date;
}

interface StatisticalAnalysisPanelProps {
  experimentId: string;
  experimentType: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default function StatisticalAnalysisPanel({
  experimentId,
  experimentType,
  onAnalysisComplete,
}: StatisticalAnalysisPanelProps) {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [analysisParams, setAnalysisParams] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, [experimentId]);

  const loadAnalyses = async () => {
    try {
      const response = await fetch(`/api/research/analysis?experimentId=${experimentId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses);
      }
    } catch (error) {
      logger.error('system', 'Error loading analyses:', error );
    }
  };

  const runAnalysis = async () => {
    if (!selectedAnalysis) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/research/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          analysisType: selectedAnalysis,
          parameters: analysisParams,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        await loadAnalyses(); // Refresh analyses list
        onAnalysisComplete?.(data.results);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Analysis failed');
      }
    } catch (error) {
      logger.error('system', 'Analysis error:', error );
      setError('Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedAnalyses = () => {
    switch (experimentType) {
      case 'CRD':
        return [
          { value: 'ANOVA', label: 'One-way ANOVA', description: 'Compare treatment means' },
          { value: 'PostHoc', label: 'Post-hoc Tests', description: 'Multiple comparisons' },
        ];
      case 'RCBD':
        return [
          { value: 'ANOVA', label: 'Two-way ANOVA', description: 'Account for blocking' },
          { value: 'PostHoc', label: 'Post-hoc Tests', description: 'Multiple comparisons' },
        ];
      case 'Factorial':
        return [
          { value: 'ANOVA', label: 'Factorial ANOVA', description: 'Main effects and interactions' },
          { value: 'PostHoc', label: 'Post-hoc Tests', description: 'Multiple comparisons' },
        ];
      default:
        return [
          { value: 'ANOVA', label: 'ANOVA', description: 'Analysis of variance' },
          { value: 'Regression', label: 'Regression', description: 'Regression analysis' },
          { value: 'PostHoc', label: 'Post-hoc Tests', description: 'Multiple comparisons' },
        ];
    }
  };

  const renderANOVAResults = (results: any) => {
    if (!results || !results.sourcesOfVariation) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">ANOVA Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Source</th>
                <th className="border border-gray-300 px-4 py-2 text-center">df</th>
                <th className="border border-gray-300 px-4 py-2 text-center">SS</th>
                <th className="border border-gray-300 px-4 py-2 text-center">MS</th>
                <th className="border border-gray-300 px-4 py-2 text-center">F</th>
                <th className="border border-gray-300 px-4 py-2 text-center">p-value</th>
              </tr>
            </thead>
            <tbody>
              {results.sourcesOfVariation.map((source: any, index: number) => (
                <tr key={index} className={source.pValue && source.pValue < 0.05 ? 'bg-yellow-50' : ''}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{source.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{source.degreesOfFreedom}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{source.sumOfSquares.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{source.meanSquare.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {source.fStatistic ? source.fStatistic.toFixed(4) : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {source.pValue ? (
                      <span className={source.pValue < 0.05 ? 'text-red-600 font-semibold' : ''}>
                        {source.pValue.toFixed(4)}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">R-squared</p>
                <p className="text-2xl font-bold">{results.rSquared.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Adjusted R-squared</p>
                <p className="text-2xl font-bold">{results.adjustedRSquared.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Grand Mean</p>
                <p className="text-2xl font-bold">{results.grandMean.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderRegressionResults = (results: any) => {
    if (!results || !results.coefficients) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Regression Coefficients</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Variable</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Coefficient</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Std. Error</th>
                <th className="border border-gray-300 px-4 py-2 text-center">t-value</th>
                <th className="border border-gray-300 px-4 py-2 text-center">p-value</th>
                <th className="border border-gray-300 px-4 py-2 text-center">95% CI</th>
              </tr>
            </thead>
            <tbody>
              {results.coefficients.map((coef: any, index: number) => (
                <tr key={index} className={coef.pValue < 0.05 ? 'bg-yellow-50' : ''}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{coef.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{coef.value.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{coef.standardError.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{coef.tStatistic.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={coef.pValue < 0.05 ? 'text-red-600 font-semibold' : ''}>
                      {coef.pValue.toFixed(4)}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    [{coef.confidenceInterval[0].toFixed(4)}, {coef.confidenceInterval[1].toFixed(4)}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">R-squared</p>
                <p className="text-2xl font-bold">{results.rSquared.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">F-statistic</p>
                <p className="text-2xl font-bold">{results.fStatistic.toFixed(4)}</p>
                <p className="text-xs text-gray-500">p = {results.fPValue.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderPostHocResults = (results: any) => {
    if (!results || !Array.isArray(results)) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Post-hoc Comparisons (Tukey HSD)</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Comparison</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Mean Difference</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Std. Error</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Test Statistic</th>
                <th className="border border-gray-300 px-4 py-2 text-center">p-value</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Significant</th>
              </tr>
            </thead>
            <tbody>
              {results.map((comparison: any, index: number) => (
                <tr key={index} className={comparison.significant ? 'bg-yellow-50' : ''}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{comparison.comparison}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{comparison.meanDifference.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{comparison.standardError.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{comparison.testStatistic.toFixed(4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={comparison.significant ? 'text-red-600 font-semibold' : ''}>
                      {comparison.pValue.toFixed(4)}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {comparison.significant ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    switch (selectedAnalysis) {
      case 'ANOVA':
        return renderANOVAResults(results);
      case 'Regression':
        return renderRegressionResults(results);
      case 'PostHoc':
        return renderPostHocResults(results);
      default:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Analysis Results</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistical Analysis</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Guide
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="run" className="space-y-4">
        <TabsList>
          <TabsTrigger value="run">Run Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="run" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Analysis Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRecommendedAnalyses().map((analysis) => (
                        <SelectItem key={analysis.value} value={analysis.value}>
                          <div>
                            <div className="font-medium">{analysis.label}</div>
                            <div className="text-sm text-gray-500">{analysis.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Significance Level (α)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="0.10"
                    value={analysisParams.alpha || 0.05}
                    onChange={(e) => setAnalysisParams({
                      ...analysisParams,
                      alpha: parseFloat(e.target.value),
                    })}
                  />
                </div>
              </div>
              
              {selectedAnalysis === 'ANOVA' && experimentType === 'Factorial' && (
                <div className="space-y-2">
                  <Label>Factor Names</Label>
                  <Input
                    placeholder="e.g., Temperature, Light"
                    value={analysisParams.factorNames?.join(', ') || ''}
                    onChange={(e) => setAnalysisParams({
                      ...analysisParams,
                      factorNames: e.target.value.split(',').map(s => s.trim()),
                    })}
                  />
                </div>
              )}
              
              {selectedAnalysis === 'Regression' && (
                <div className="space-y-2">
                  <Label>Independent Variables</Label>
                  <Input
                    placeholder="e.g., x1, x2, x3"
                    value={analysisParams.variableNames?.join(', ') || ''}
                    onChange={(e) => setAnalysisParams({
                      ...analysisParams,
                      variableNames: e.target.value.split(',').map(s => s.trim()),
                    })}
                  />
                </div>
              )}
              
              <Button 
                onClick={runAnalysis} 
                disabled={!selectedAnalysis || loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Running Analysis...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Run Analysis
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderResults()}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{analysis.type}</CardTitle>
                      <p className="text-sm text-gray-600">{analysis.method}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {new Date(analysis.performedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="assumptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Statistical Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">ANOVA Assumptions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Independence of observations</li>
                    <li>Normality of residuals</li>
                    <li>Homogeneity of variance (homoscedasticity)</li>
                    <li>No extreme outliers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Regression Assumptions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Linearity of relationships</li>
                    <li>Independence of residuals</li>
                    <li>Normality of residuals</li>
                    <li>Homoscedasticity</li>
                    <li>No multicollinearity</li>
                  </ul>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Always check these assumptions before interpreting results. Consider transformations or non-parametric alternatives if assumptions are violated.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}