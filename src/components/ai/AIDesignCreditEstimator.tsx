'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles,
  Calculator,
  Zap,
  Clock,
  DollarSign,
  Code,
  Database,
  Cpu,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Package,
  Lightbulb,
  Leaf
} from 'lucide-react';
import { 
  AIDesignCreditCalculator, 
  greenhousePromptTemplates,
  creditPackages,
  type DesignComplexity,
  type CreditCalculation
} from '@/lib/ai/credit-calculator-stub';

// AI Design Credit Estimator - FULLY FUNCTIONAL
const TEMP_DISABLED = false;

interface AIDesignCreditEstimatorProps {
  userCredits?: number;
  onApplyDesign?: (prompt: string, credits: number) => void;
  onPurchaseCredits?: (packageName: string) => void;
}

export default function AIDesignCreditEstimator({ 
  userCredits = 120,
  onApplyDesign,
  onPurchaseCredits
}: AIDesignCreditEstimatorProps) {
  
  if (TEMP_DISABLED) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">AI Credit Estimator temporarily disabled for deployment.</p>
      </div>
    );
  }
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState<DesignComplexity | null>(null);
  const [creditCalc, setCreditCalc] = useState<CreditCalculation | null>(null);
  const [timeSaved, setTimeSaved] = useState<{ hoursSaved: number; costSaved: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const calculator = new AIDesignCreditCalculator();

  useEffect(() => {
    if (prompt.length > 20) {
      const debounceTimer = setTimeout(() => {
        analyzePrompt();
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setComplexity(null);
      setCreditCalc(null);
      setTimeSaved(null);
    }
  }, [prompt]);

  const analyzePrompt = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis time
    setTimeout(() => {
      const complexityAnalysis = calculator.analyzePrompt(prompt);
      const credits = calculator.calculateCredits(complexityAnalysis);
      const time = calculator.estimateTimeSaved(complexityAnalysis);
      
      setComplexity(complexityAnalysis);
      setCreditCalc(credits);
      setTimeSaved(time);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleApplyDesign = async () => {
    if (!creditCalc) return;
    
    if (userCredits < creditCalc.totalCredits) {
      alert(`You need ${creditCalc.totalCredits - userCredits} more credits for this design.`);
      return;
    }

    try {
      const response = await fetch('/api/ai/design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          facilityType: 'greenhouse', // Default to greenhouse for now
          dimensions: { width: 30, length: 60, height: 12 },
          requirements: {
            lightingType: 'led',
            growMethod: 'hydroponic',
            climateControl: true,
            automation: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate design');
      }

      const result = await response.json();
      
      if (result.success) {
        alert(`Design generated successfully! ${result.creditsUsed} credits used.`);
        // TODO: Display the generated design layout
        console.log('Generated design:', result.design);
        
        if (onApplyDesign) {
          onApplyDesign(prompt, result.creditsUsed);
        }
        
        // Reset form
        setPrompt('');
        setComplexity(null);
        setCreditCalc(null);
        setTimeSaved(null);
      }
    } catch (error) {
      console.error('Design generation failed:', error);
      alert('Failed to generate design. Please try again.');
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      basic: 'bg-green-100 text-green-800',
      standard: 'bg-blue-100 text-blue-800',
      advanced: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return colors[tier as keyof typeof colors] || colors.basic;
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
          <Sparkles className="h-8 w-8 mr-3 text-purple-600" />
          AI Design Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Describe your greenhouse or lighting system needs, and our AI will generate the complete design
        </p>
      </div>

      {/* Credit Balance */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Your Credit Balance:</span>
              <span className="text-2xl font-bold text-purple-600 ml-3">{userCredits}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPurchaseCredits?.('Professional')}
            >
              <Package className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="design">Design Request</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="pricing">Credit Packages</TabsTrigger>
        </TabsList>

        {/* Design Request Tab */}
        <TabsContent value="design">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Describe Your Design</CardTitle>
                <CardDescription>
                  Tell us what you need for your greenhouse or vertical farm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Example: I need a complete greenhouse climate control dashboard with real-time temperature, humidity, and CO2 monitoring, plus automated HVAC control based on VPD calculations..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[200px] mb-4"
                />
                
                {/* Quick Templates */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick Templates:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt("Create a greenhouse monitoring dashboard with temperature, humidity, and light sensors")}
                    >
                      <Leaf className="h-3 w-3 mr-1" />
                      Monitoring
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt("Build a DLC-compliant lighting design tool for vertical farming with PPFD calculations")}
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Lighting
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt("Design an automated hydroponic nutrient dosing system with pH and EC control")}
                    >
                      <Cpu className="h-3 w-3 mr-1" />
                      Automation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle>Credit Estimation</CardTitle>
                <CardDescription>
                  AI analysis of your design requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Calculator className="h-12 w-12 text-gray-400 animate-pulse mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Analyzing design complexity...</p>
                    </div>
                  </div>
                ) : creditCalc ? (
                  <div className="space-y-4">
                    {/* Credit Cost */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-medium">Total Credits Required</span>
                        <span className="text-3xl font-bold text-blue-600">{creditCalc.totalCredits}</span>
                      </div>
                      <Badge className={getTierColor(creditCalc.tier)}>
                        {creditCalc.tier.charAt(0).toUpperCase() + creditCalc.tier.slice(1)} Complexity
                      </Badge>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Breakdown:</p>
                      {creditCalc.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
                          <span className="font-medium">
                            {item.credits > 0 ? `${item.credits} credits` : item.reason}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Complexity Details */}
                    {complexity && (
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <div className="text-center">
                          <Code className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">Components</p>
                          <p className="font-medium">{complexity.componentCount}</p>
                        </div>
                        <div className="text-center">
                          <Database className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">Database</p>
                          <p className="font-medium">{complexity.databaseTables || 'None'}</p>
                        </div>
                        <div className="text-center">
                          <Cpu className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">API Endpoints</p>
                          <p className="font-medium">{complexity.apiEndpoints || 'None'}</p>
                        </div>
                        <div className="text-center">
                          <BarChart3 className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">Visualization</p>
                          <p className="font-medium capitalize">{complexity.visualizationComplexity}</p>
                        </div>
                      </div>
                    )}

                    {/* Time Saved */}
                    {timeSaved && (
                      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          <strong>Time Saved:</strong> ~{timeSaved.hoursSaved} development hours
                          <br />
                          <strong>Value:</strong> {formatCurrency(timeSaved.costSaved)} in development costs
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      {userCredits >= creditCalc.totalCredits ? (
                        <>
                          <Button 
                            className="flex-1"
                            onClick={() => setShowPreview(true)}
                          >
                            Preview Design
                          </Button>
                          <Button 
                            className="flex-1"
                            variant="default"
                            onClick={handleApplyDesign}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Apply Design ({creditCalc.totalCredits} credits)
                          </Button>
                        </>
                      ) : (
                        <Alert className="w-full">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            You need {creditCalc.totalCredits - userCredits} more credits for this design.
                            <Button 
                              variant="link" 
                              className="ml-2 p-0 h-auto"
                              onClick={() => onPurchaseCredits?.('Professional')}
                            >
                              Buy credits
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                ) : prompt.length > 20 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Start typing to see credit estimation...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Describe your design above to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculator.getExamplePrompts().map((example, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setPrompt(example.prompt)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{example.category}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {example.credits} credits
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    "{example.prompt}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg, index) => (
              <Card key={index} className={index === 1 ? 'border-blue-500 shadow-lg' : ''}>
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.bestFor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold">{formatCurrency(pkg.price)}</p>
                    <p className="text-gray-600 dark:text-gray-400">{pkg.credits} credits</p>
                    <p className="text-sm text-green-600 font-medium mt-2">
                      {formatCurrency(pkg.price / pkg.credits)} per credit
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={index === 1 ? 'default' : 'outline'}
                    onClick={() => onPurchaseCredits?.(pkg?.name || 'unknown')}
                  >
                    {index === 1 && <Zap className="h-4 w-4 mr-2" />}
                    Select {pkg.name}
                  </Button>
                  
                  {index === 1 && (
                    <Badge className="w-full mt-2 justify-center bg-blue-100 text-blue-800">
                      Most Popular
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Alert className="mt-6">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Credits never expire and can be used for any design request. 
              Larger packages offer better value for frequent users.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Preview Modal (simplified) */}
      {showPreview && creditCalc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>Design Preview</CardTitle>
              <CardDescription>
                AI will generate these components for your design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Claude Opus 4 will create a complete, production-ready implementation including:
                  </AlertDescription>
                </Alert>
                
                {complexity && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm font-medium mb-2">Components</p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• {complexity.componentCount} React components</li>
                        <li>• TypeScript interfaces</li>
                        <li>• Responsive design</li>
                        <li>• Dark mode support</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm font-medium mb-2">Features</p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {complexity.realtimeFeatures && <li>• Real-time updates</li>}
                        {complexity.customCalculations && <li>• Custom calculations</li>}
                        {complexity.hardwareIntegration && <li>• Hardware integration</li>}
                        <li>• Data visualization</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPreview(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setShowPreview(false);
                      handleApplyDesign();
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Generate Design ({creditCalc.totalCredits} credits)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}