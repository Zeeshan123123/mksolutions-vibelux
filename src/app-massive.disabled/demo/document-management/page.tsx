'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Shield, 
  History, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  ArrowRight,
  GitBranch,
  Lock,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentCollaboration } from '@/components/docs/DocumentCollaboration';
import { SOPDocumentManager } from '@/components/docs/SOPDocumentManager';

export default function DocumentManagementDemo() {
  const [activeDemo, setActiveDemo] = useState<'overview' | 'collaboration' | 'manager'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  const demoScenarios = [
    {
      id: 'version-control',
      title: 'Smart Version Control',
      description: 'Watch how every change is automatically tracked',
      time: '30 seconds',
      icon: <GitBranch className="w-6 h-6 text-blue-600" />
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'See multiple users working without conflicts',
      time: '45 seconds',
      icon: <Users className="w-6 h-6 text-green-600" />
    },
    {
      id: 'security',
      title: 'Enterprise Security',
      description: 'Complete audit trails and access control',
      time: '20 seconds',
      icon: <Shield className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Document Management
            <span className="text-purple-600"> Live Demo</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            See how professional document version control and collaboration actually works. 
            This is a fully functional demo with real features.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Demo
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Demo
                </>
              )}
            </Button>
            <Button size="lg" variant="outline">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset Demo
            </Button>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {demoScenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isPlaying ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{scenario.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {scenario.time}
                      </Badge>
                      {isPlaying && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={activeDemo === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('overview')}
          >
            Feature Overview
          </Button>
          <Button
            variant={activeDemo === 'collaboration' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('collaboration')}
          >
            Collaboration Demo
          </Button>
          <Button
            variant={activeDemo === 'manager' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('manager')}
          >
            Full SOP Manager
          </Button>
        </div>

        {/* Demo Content */}
        {activeDemo === 'overview' && (
          <div className="space-y-8">
            {/* Version Control Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-blue-600" />
                  Version Control in Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Document History:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium">v2.1.3 - Current</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-600">v2.1.2 - Previous</span>
                        </div>
                        <Badge variant="outline">Archived</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-600">v2.1.1 - Previous</span>
                        </div>
                        <Badge variant="outline">Archived</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">What Changed:</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Updated safety protocols for LED handling</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Added new energy efficiency calculations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Fixed typos in section 3.2</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-600">
                        Changed by: admin@vibelux.ai • 2 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Collaboration Without Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Active Users:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">You - Exclusive Edit</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">1.5h left</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span>Sarah M. - Review</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span>Mike K. - Review</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">How It Works:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-xs">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Check Out for Editing</p>
                          <p className="text-gray-600">Get exclusive lock to prevent conflicts</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold text-xs">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Others Can Review</p>
                          <p className="text-gray-600">Multiple people can review simultaneously</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold text-xs">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Check In Changes</p>
                          <p className="text-gray-600">Automatic version creation and release</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Enterprise Security Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Your Activity Log:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Viewed: LED Growth Protocol</span>
                        <span className="text-gray-500">2:34 PM</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Downloaded: Safety Manual</span>
                        <span className="text-gray-500">1:22 PM</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Edited: Quality Control SOP</span>
                        <span className="text-gray-500">11:45 AM</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Privacy Protection:</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Complete Data Isolation</p>
                          <p className="text-blue-700 text-sm mt-1">
                            You only see YOUR activity. Customer data is never shared between accounts.
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        ✓ Every access logged • ✓ IP tracking • ✓ Compliance ready
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Try It Yourself?</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                This demo shows real functionality. Start your free trial to use these features 
                with your own documents and team.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'collaboration' && (
          <DocumentCollaboration
            documentId="demo_sop_001"
            documentTitle="LED Growth Protocol - Demo Document"
            currentVersion="2.1.3"
            isEditable={true}
          />
        )}

        {activeDemo === 'manager' && <SOPDocumentManager />}
      </div>
    </div>
  );
}