'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  LayoutGrid,
  List,
  History,
  Users,
  Shield,
  Settings,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SOPDocumentManager } from '@/components/docs/SOPDocumentManager';
import { DocumentAuditTrail } from '@/components/docs/DocumentAuditTrail';
import { MyDocumentHistory } from '@/components/user/MyDocumentHistory';

type ViewMode = 'documents' | 'audit' | 'history' | 'help';

export default function DocumentsPage() {
  const { user, isLoaded } = useUser();
  const [viewMode, setViewMode] = useState<ViewMode>('documents');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user needs onboarding
  const needsOnboarding = !user?.publicMetadata?.documentsOnboarded;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-4">
              Please sign in to access your document management system.
            </p>
            <Button className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show onboarding for new users
  if (needsOnboarding && !showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to Document Management!</CardTitle>
              <p className="text-gray-600">
                Professional version control and collaboration tools for your team.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Smart Version Control</h3>
                  <p className="text-sm text-gray-600">Track every change with automatic versioning</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-gray-600">Multiple people, zero conflicts</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Enterprise Security</h3>
                  <p className="text-sm text-gray-600">Bank-level protection and audit trails</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => window.location.href = '/onboarding/documents'}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Quick Setup (5 min)
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowOnboarding(true)}
                >
                  Skip & Explore
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>
                  Already familiar with document management?{' '}
                  <button 
                    className="text-purple-600 hover:underline"
                    onClick={() => setShowOnboarding(true)}
                  >
                    Jump right in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600">Professional version control and collaboration</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <HelpCircle className="w-4 h-4 mr-1" />
              Help
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'documents'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('documents')}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </div>
          </button>
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'audit'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('audit')}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Audit Trail
            </div>
          </button>
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'history'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('history')}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              My Activity
            </div>
          </button>
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'help'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('help')}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Getting Started
            </div>
          </button>
        </div>

        {/* Content */}
        {viewMode === 'documents' && <SOPDocumentManager />}
        {viewMode === 'audit' && <DocumentAuditTrail />}
        {viewMode === 'history' && <MyDocumentHistory />}
        {viewMode === 'help' && <HelpContent />}
      </div>
    </div>
  );
}

function HelpContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Getting Started with Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Invite Team Members
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Access Permissions
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Learn the Basics</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Version Control</h4>
                    <p className="text-xs text-gray-600">Every change is tracked automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Collaboration</h4>
                    <p className="text-xs text-gray-600">Check out documents to prevent conflicts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Security</h4>
                    <p className="text-xs text-gray-600">All access is logged and monitored</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-gray-600 mb-3">
              Complete guides and tutorials
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Docs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Demo</h3>
            <p className="text-sm text-gray-600 mb-3">
              See all features in action
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Schedule Demo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get help from our team
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}