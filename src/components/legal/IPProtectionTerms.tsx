'use client';

import React from 'react';
import { Shield, AlertTriangle, FileText, Lock, Eye, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentSecurity } from '@/lib/documentSecurity';

export function IPProtectionTerms() {
  const protectionClauses = DocumentSecurity.getIPProtectionClauses();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Intellectual Property Protection</h1>
          <Lock className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          VibeLux documentation contains valuable proprietary information. 
          Please review these important terms regarding access and usage.
        </p>
      </div>

      {/* Warning Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">Important Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-amber-700">
          <p>
            All documentation access is monitored and logged. Unauthorized distribution 
            or sharing of VibeLux proprietary information is strictly prohibited and 
            may result in legal action.
          </p>
        </CardContent>
      </Card>

      {/* Protection Mechanisms */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center">
            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Access Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Document views logged</li>
              <li>• Download attempts tracked</li>
              <li>• Print activities monitored</li>
              <li>• IP addresses recorded</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Digital Watermarking</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• User identity embedded</li>
              <li>• Timestamp tracking</li>
              <li>• Document traceability</li>
              <li>• Forensic evidence</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Role-based permissions</li>
              <li>• Subscription tier limits</li>
              <li>• Geographic restrictions</li>
              <li>• Time-based access</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Terms and Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {protectionClauses.map((clause, index) => (
              <div key={index} className="flex gap-3">
                <Badge variant="outline" className="mt-1 px-2 py-1 text-xs">
                  {index + 1}
                </Badge>
                <p className="text-sm leading-relaxed">{clause}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Classification Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Document Classification Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Badge className="bg-green-100 text-green-800">PUBLIC</Badge>
              <span className="text-sm">
                General information, marketing materials, basic getting started guides
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Badge className="bg-blue-100 text-blue-800">AUTHENTICATED</Badge>
              <span className="text-sm">
                User guides, basic feature documentation, FAQ content
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Badge className="bg-purple-100 text-purple-800">PREMIUM</Badge>
              <span className="text-sm">
                Advanced features, integrations, machine learning capabilities
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Badge className="bg-orange-100 text-orange-800">ENTERPRISE</Badge>
              <span className="text-sm">
                API documentation, system architecture, administrative guides
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <Badge className="bg-red-100 text-red-800">INTERNAL</Badge>
              <span className="text-sm">
                Implementation details, competitive analysis, internal roadmaps
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enforcement and Penalties */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Enforcement and Penalties
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-700">
          <div className="space-y-2 text-sm">
            <p><strong>Immediate Consequences:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Account suspension or termination</li>
              <li>Revocation of documentation access</li>
              <li>Legal action for breach of contract</li>
            </ul>
            
            <p className="mt-4"><strong>Financial Penalties:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Liquidated damages of $10,000 per incident</li>
              <li>Legal fees and court costs</li>
              <li>Lost profits and competitive damages</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Questions or Concerns?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            If you have questions about these terms or need clarification on 
            documentation usage rights, please contact our legal team:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> legal@vibelux.com</p>
            <p><strong>Phone:</strong> 1-800-VIBELUX ext. 101</p>
            <p><strong>Address:</strong> VibeLux Legal Department, 123 Innovation Drive, Tech City, TC 12345</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact IP notice for embedding in documents
 */
export function IPProtectionNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <Shield className="h-3 w-3" />
        <span>
          CONFIDENTIAL: This document contains proprietary VibeLux information. 
          Unauthorized distribution prohibited.
        </span>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 mt-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Confidential Information</p>
            <p>
              This document contains proprietary and confidential information owned by VibeLux. 
              Any unauthorized reproduction, distribution, or disclosure is strictly prohibited 
              and may result in legal action. All access is monitored and logged.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}