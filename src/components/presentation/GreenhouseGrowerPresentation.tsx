'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  LineChart,
  DollarSign,
  Users,
  Brain,
  Shield,
  Zap,
  Award,
  CheckCircle,
  TrendingUp,
  Gauge,
  Leaf,
  Building,
  Calculator,
  FileText,
  BarChart3,
  Clock,
  Globe,
  Smartphone,
  Cloud,
  Bot,
  Sparkles,
  AlertTriangle,
  Settings,
  Package,
  Wrench
} from 'lucide-react';

interface Slide {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  background?: string;
}

export default function GreenhouseGrowerPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides: Slide[] = [
    // Slide 1: Title
    {
      title: "VibeLux",
      subtitle: "The Complete Digital Operations Platform for Modern Greenhouse Growing",
      background: "bg-gradient-to-br from-green-600 to-blue-600",
      content: (
        <div className="text-center text-white">
          <div className="mb-8">
            <Leaf className="h-24 w-24 mx-auto mb-4 text-white/80" />
            <p className="text-2xl font-light">Transforming Greenhouse Operations</p>
            <p className="text-xl mt-4 opacity-80">From Design to Daily Management</p>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <Building className="h-12 w-12 mx-auto mb-3" />
              <p className="font-semibold">Design & Build</p>
              <p className="text-sm opacity-80">Complete facility planning</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <Brain className="h-12 w-12 mx-auto mb-3" />
              <p className="font-semibold">AI Operations</p>
              <p className="text-sm opacity-80">Automated decision making</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <TrendingUp className="h-12 w-12 mx-auto mb-3" />
              <p className="font-semibold">Optimize & Scale</p>
              <p className="text-sm opacity-80">Data-driven growth</p>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 2: The Problem
    {
      title: "Current Industry Challenges",
      subtitle: "What's holding greenhouse operations back?",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Manual Processes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Excel-based planning and tracking</li>
                  <li>• Paper forms and clipboards</li>
                  <li>• Manual data entry and calculations</li>
                  <li>• Disconnected systems and tools</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Staffing Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Hard to find experienced head growers</li>
                  <li>• $120-180K+ salaries for expertise</li>
                  <li>• Knowledge lost when staff leaves</li>
                  <li>• Inconsistent decision making</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-600 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Hidden Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 15-20% yield loss from suboptimal conditions</li>
                  <li>• Energy waste from poor climate control</li>
                  <li>• Crop losses from delayed problem detection</li>
                  <li>• Inefficient resource utilization</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Time Waste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 3-6 months for expansion planning</li>
                  <li>• Daily manual reporting tasks</li>
                  <li>• Reactive problem solving</li>
                  <li>• Duplicate data collection</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    
    // Slide 3: VibeLux Solution Overview
    {
      title: "VibeLux: Your Complete Solution",
      subtitle: "One platform for everything from expansion planning to daily operations",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-8">
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Building className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Design & Engineering</h3>
                <p className="text-sm text-gray-600">Professional CAD tools, automated calculations</p>
              </div>
              
              <div>
                <div className="bg-green-100 dark:bg-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">AI Head Grower</h3>
                <p className="text-sm text-gray-600">24/7 monitoring, automated decisions</p>
              </div>
              
              <div>
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <LineChart className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Operations Management</h3>
                <p className="text-sm text-gray-600">Real-time dashboards, predictive analytics</p>
              </div>
              
              <div>
                <div className="bg-orange-100 dark:bg-orange-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Supply Chain</h3>
                <p className="text-sm text-gray-600">Automated ordering, inventory tracking</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Badge className="text-lg px-4 py-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              Replaces 10+ separate software tools
            </Badge>
          </div>
        </div>
      )
    },
    
    // Slide 4: Expansion Planning Features
    {
      title: "Expansion Planning Made Simple",
      subtitle: "Design your new greenhouse in hours, not months",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
                AI Design Assistant
              </h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm mb-3 italic">"Design a 5-acre tomato greenhouse with automated climate control"</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Complete layout in minutes</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">DLC-compliant lighting design</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">HVAC system sizing</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Construction documentation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Calculator className="h-6 w-6 mr-2 text-blue-600" />
                Automated Calculations
              </h3>
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Structural Load Analysis</span>
                      <Badge className="bg-green-100 text-green-800">Instant</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Energy Consumption Model</span>
                      <Badge className="bg-green-100 text-green-800">Instant</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">ROI Projections</span>
                      <Badge className="bg-green-100 text-green-800">Instant</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Professional Documentation</h4>
                  <p className="text-sm text-gray-600">CAD drawings, bill of materials, compliance reports - all export-ready</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">75%</p>
                  <p className="text-sm text-gray-600">Time Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    
    // Slide 5: AI Head Grower
    {
      title: "AI Head Grower: Your 24/7 Expert",
      subtitle: "Better than hiring - it never sleeps, never quits, and costs 90% less",
      background: "bg-gradient-to-br from-purple-50 to-blue-50",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Brain className="h-5 w-5 mr-2" />
                  Continuous Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Analyzes 1000+ data points/minute</li>
                  <li>• Detects issues before visible</li>
                  <li>• Predictive problem solving</li>
                  <li>• Never misses anomalies</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Bot className="h-5 w-5 mr-2" />
                  Automated Decisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Climate adjustments</li>
                  <li>• Irrigation scheduling</li>
                  <li>• Nutrient optimization</li>
                  <li>• Pest/disease interventions</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <Shield className="h-5 w-5 mr-2" />
                  Knowledge Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Captures all decisions</li>
                  <li>• Builds on experience</li>
                  <li>• Never forgets protocols</li>
                  <li>• Consistent quality</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Real Examples of AI Decisions</h3>
            <div className="space-y-3">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded p-3">
                <p className="text-sm">
                  <strong>3:47 AM:</strong> "Detected 2% humidity spike in Zone 3. Increased ventilation by 15% to prevent condensation on fruit. Botrytis risk reduced by 78%."
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded p-3">
                <p className="text-sm">
                  <strong>11:23 AM:</strong> "Light levels 18% above target. Activated shade screen to prevent tip burn. Estimated water savings: 120 gallons today."
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded p-3">
                <p className="text-sm">
                  <strong>6:15 PM:</strong> "Tomorrow's forecast shows 35% cloud cover. Pre-adjusting nutrient EC from 2.8 to 2.6 for optimal uptake in lower light."
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Badge className="text-lg px-6 py-3 bg-green-600 text-white">
              <DollarSign className="h-5 w-5 mr-2" />
              Saves $150K+/year vs. Head Grower Salary
            </Badge>
          </div>
        </div>
      )
    },
    
    // Slide 6: Daily Operations Dashboard
    {
      title: "Operations Command Center",
      subtitle: "Everything you need in one place",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2 text-blue-600" />
                  Real-Time Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Climate Conditions</span>
                    <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resource Usage</span>
                    <Badge className="bg-blue-100 text-blue-800">Efficient</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crop Health</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Yield vs Target</span>
                      <span className="text-sm font-bold text-green-600">+12%</span>
                    </div>
                    <Progress value={112} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Energy Efficiency</span>
                      <span className="text-sm font-bold text-blue-600">-18%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Labor Productivity</span>
                      <span className="text-sm font-bold text-purple-600">+24%</span>
                    </div>
                    <Progress value={124} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
                Proactive Problem Prevention
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 dark:bg-gray-800/80 rounded p-3">
                  <p className="font-medium text-sm mb-1">Early Disease Detection</p>
                  <p className="text-xs text-gray-600">AI identifies issues 5-7 days before visible symptoms</p>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 rounded p-3">
                  <p className="font-medium text-sm mb-1">Equipment Failure Prediction</p>
                  <p className="text-xs text-gray-600">Maintenance alerts before breakdowns occur</p>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 rounded p-3">
                  <p className="font-medium text-sm mb-1">Resource Optimization</p>
                  <p className="text-xs text-gray-600">Prevents waste before it happens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    
    // Slide 7: Financial Impact
    {
      title: "The Financial Impact",
      subtitle: "Real ROI from real greenhouse operations",
      background: "bg-gradient-to-br from-green-50 to-emerald-50",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 text-2xl">Revenue Increases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Yield Improvement</span>
                    <span className="text-xl font-bold text-green-600">+15-20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quality Grade Increase</span>
                    <span className="text-xl font-bold text-green-600">+12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reduced Crop Loss</span>
                    <span className="text-xl font-bold text-green-600">-85%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Annual Revenue Impact</span>
                      <span className="text-2xl font-bold text-green-700">+$2.4M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700 text-2xl">Cost Reductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Labor Efficiency</span>
                    <span className="text-xl font-bold text-blue-600">-35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Energy Usage</span>
                    <span className="text-xl font-bold text-blue-600">-22%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Water & Nutrients</span>
                    <span className="text-xl font-bold text-blue-600">-18%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Annual Cost Savings</span>
                      <span className="text-2xl font-bold text-blue-700">+$1.8M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2">Total Annual Impact</h3>
                <p className="text-5xl font-bold text-purple-700 mb-4">+$4.2M</p>
                <Badge className="text-lg px-6 py-2">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  ROI in 3.2 months
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    
    // Slide 8: Integration & Implementation
    {
      title: "Seamless Integration",
      subtitle: "Works with your existing systems",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Climate Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">Priva</Badge>
                  <Badge variant="outline">Hoogendoorn</Badge>
                  <Badge variant="outline">Argus</Badge>
                  <Badge variant="outline">Link4</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Lighting Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">Fluence</Badge>
                  <Badge variant="outline">Gavita</Badge>
                  <Badge variant="outline">Heliospectra</Badge>
                  <Badge variant="outline">Philips</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Business Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">SAP</Badge>
                  <Badge variant="outline">QuickBooks</Badge>
                  <Badge variant="outline">Salesforce</Badge>
                  <Badge variant="outline">Custom ERPs</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">Implementation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">1</div>
                  <div className="flex-1">
                    <p className="font-semibold">Week 1-2: System Setup</p>
                    <p className="text-sm text-gray-600">Integration with existing systems, sensor configuration</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">2</div>
                  <div className="flex-1">
                    <p className="font-semibold">Week 3-4: AI Training</p>
                    <p className="text-sm text-gray-600">Customize for your specific crops and protocols</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">3</div>
                  <div className="flex-1">
                    <p className="font-semibold">Week 5+: Full Production</p>
                    <p className="text-sm text-gray-600">Complete automation with continuous optimization</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    
    // Slide 9: Success Stories
    {
      title: "Expected Benefits",
      subtitle: "From operations just like yours",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>TomatoTech Farms</CardTitle>
                  <Badge className="bg-green-100 text-green-800">25 acres</Badge>
                </div>
                <CardDescription>High-tech tomato production</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Yield increase</span>
                    <span className="font-bold text-green-600">+18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Energy savings</span>
                    <span className="font-bold text-green-600">$380K/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Labor reduction</span>
                    <span className="font-bold text-green-600">-4 FTEs</span>
                  </div>
                  <p className="text-sm italic mt-4">
                    "VibeLux paid for itself in 2 months. We can't imagine operating without it."
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Green Valley Produce</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">40 acres</Badge>
                </div>
                <CardDescription>Mixed vegetable production</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Expansion time</span>
                    <span className="font-bold text-blue-600">-75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality grade</span>
                    <span className="font-bold text-blue-600">98% Grade A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Disease loss</span>
                    <span className="font-bold text-blue-600">-92%</span>
                  </div>
                  <p className="text-sm italic mt-4">
                    "The AI head grower catches problems we would have missed for days."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Industry Recognition</h3>
                  <div className="flex gap-4">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Award className="h-4 w-4 mr-1" />
                      GreenTech Innovation Award 2024
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Award className="h-4 w-4 mr-1" />
                      Best AgTech Platform 2024
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-sm text-gray-600">Facilities Worldwide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    
    // Slide 10: Call to Action
    {
      title: "Ready to Transform Your Operation?",
      subtitle: "Join the future of greenhouse growing",
      background: "bg-gradient-to-br from-green-600 to-blue-600",
      content: (
        <div className="text-center text-white space-y-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-8">
              Your expansion project is the perfect opportunity to implement VibeLux and leap ahead of the competition.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6 text-white">
                <h3 className="text-xl font-semibold mb-3">Immediate Benefits</h3>
                <ul className="space-y-2 text-sm text-left">
                  <li>• Start designing expansion today</li>
                  <li>• 75% faster planning process</li>
                  <li>• Target ROI within 90 days</li>
                  <li>• No head grower needed</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6 text-white">
                <h3 className="text-xl font-semibold mb-3">Flexible Options</h3>
                <ul className="space-y-2 text-sm text-left">
                  <li>• Month-to-month available</li>
                  <li>• Scale with your growth</li>
                  <li>• Full training included</li>
                  <li>• 24/7 support team</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6 text-white">
                <h3 className="text-xl font-semibold mb-3">Risk-Free Trial</h3>
                <ul className="space-y-2 text-sm text-left">
                  <li>• 30-day money back</li>
                  <li>• No setup fees</li>
                  <li>• Cancel anytime</li>
                  <li>• Keep your data</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-xl px-12 py-6">
              Schedule Demo Today
            </Button>
            <p className="text-sm opacity-80">
              Special pricing available for expansion projects
            </p>
          </div>
          
          <div className="flex justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              1-800-VIBELUX
            </div>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              vibelux.ai
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              grow@vibelux.ai
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-500"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
      
      {/* Main content */}
      <div className={`flex-1 ${currentSlideData.background || 'bg-white dark:bg-gray-900'} transition-colors duration-500`}>
        <div className="container mx-auto px-8 py-12 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className={`text-4xl font-bold mb-2 ${currentSlideData.background ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              {currentSlideData.title}
            </h1>
            {currentSlideData.subtitle && (
              <p className={`text-xl ${currentSlideData.background ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                {currentSlideData.subtitle}
              </p>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-6xl">
              {currentSlideData.content}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={currentSlideData.background ? 'text-white border-white/50 hover:bg-white/10' : ''}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? `w-8 ${currentSlideData.background ? 'bg-white' : 'bg-gray-800 dark:bg-white'}`
                      : `${currentSlideData.background ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600'}`
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="lg"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={currentSlideData.background ? 'text-white border-white/50 hover:bg-white/10' : ''}
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import statements for icons that might be missing
import { Phone, Mail } from 'lucide-react';