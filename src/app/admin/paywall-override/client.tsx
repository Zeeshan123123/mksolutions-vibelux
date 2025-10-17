'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/client-logger';
import { 
  Crown, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Settings,
  Users,
  Key,
  Eye,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react';

interface AdminStatus {
  isAdmin: boolean;
  isOwner: boolean;
  userEmail?: string;
}

interface PaywallOverrideClientProps {
  adminStatus: AdminStatus;
}

export default function PaywallOverrideClient({ adminStatus }: PaywallOverrideClientProps) {
  const router = useRouter();
  const [demoMode, setDemoMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const demoRoutes = [
    { path: '/research/statistical-analysis', name: 'Research Suite - Statistical Analysis', module: 'research-analytics-suite' },
    { path: '/research/experiment-designer', name: 'Research Suite - Experiment Designer', module: 'research-analytics-suite' },
    { path: '/design/advanced', name: 'Advanced Designer Suite', module: 'advanced-designer-suite' },
    { path: '/bms', name: 'Smart Facility Suite - BMS', module: 'smart-facility-suite' },
    { path: '/robotics', name: 'Robotic Coordination', module: 'robotic-coordination' },
    { path: '/food-safety', name: 'Food Safety & Operations', module: 'food-safety-operations-suite' },
    { path: '/business-intelligence', name: 'Business Intelligence Suite', module: 'business-intelligence-suite' },
    { path: '/multi-site', name: 'Multi-Site Management', tier: 'enterprise' },
  ];

  const testAPIs = [
    { endpoint: '/api/ai-designer', name: 'AI Designer API', module: 'advanced-designer-suite' },
    { endpoint: '/api/research', name: 'Research API', module: 'research-analytics-suite' },
    { endpoint: '/api/sensors', name: 'Sensor Data API', tier: 'professional' },
    { endpoint: '/api/bms', name: 'BMS Control API', module: 'smart-facility-suite' },
    { endpoint: '/api/robotics', name: 'Robotic Control API', module: 'robotic-coordination' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testAPIEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      logger.info('system', `API Test - ${endpoint}:`, { data: { status: response.status, data } });
      
      if (response.status === 403) {
        alert(`✅ Paywall working: ${endpoint} returned 403 (Access Denied)`);
      } else if (response.status === 200) {
        alert(`✅ Admin access working: ${endpoint} returned 200 (Success)`);
      } else {
        alert(`⚠️ Unexpected response: ${endpoint} returned ${response.status}`);
      }
    } catch (error) {
      logger.error('system', `API Test failed for ${endpoint}:`, error);
      alert(`❌ Test failed: ${endpoint} - ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Paywall Override</h1>
              <p className="text-gray-400">Manage demo access and test paywall functionality</p>
            </div>
          </div>
          
          {/* Admin Status */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Admin Access Active</p>
                  <p className="text-sm text-gray-400">
                    {adminStatus.userEmail} • {adminStatus.isOwner ? 'Owner' : 'Admin'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Full Access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Routes */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Demo Routes (Admin Access)
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              As an admin, you have full access to all features. Test these protected routes:
            </p>
            
            <div className="space-y-3">
              {demoRoutes.map((route) => (
                <div key={route.path} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{route.name}</h3>
                    <p className="text-xs text-gray-400">{route.path}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(route.path)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy path"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => router.push(route.path)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Testing */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-green-400" />
              API Endpoint Testing
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Test protected API endpoints. As admin, you should get 200 responses:
            </p>
            
            <div className="space-y-3">
              {testAPIs.map((api) => (
                <div key={api.endpoint} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{api.name}</h3>
                    <p className="text-xs text-gray-400">{api.endpoint}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(api.endpoint)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy endpoint"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => testAPIEndpoint(api.endpoint)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Admin Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Environment Variables</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">OWNER_EMAILS:</span>
                  <span className="text-green-400">Configured ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ADMIN_EMAILS:</span>
                  <span className="text-green-400">Configured ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Email:</span>
                  <span className="text-white">{adminStatus.userEmail}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Admin Privileges</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Bypass all paywall restrictions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Access all modules and features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Unlimited AI credits and usage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Multi-facility management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Notes</h3>
              <ul className="space-y-1 text-sm text-yellow-200">
                <li>• Admin access is automatic based on your email address</li>
                <li>• You can demo all features without any subscription restrictions</li>
                <li>• For customer demos, use incognito mode to show the actual paywall</li>
                <li>• API endpoints will return success for admin users</li>
                <li>• All usage tracking is bypassed for admin accounts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Demo Instructions</h3>
              <div className="space-y-3 text-sm text-blue-200">
                <div>
                  <strong>For Customer Demos:</strong>
                  <ol className="list-decimal list-inside mt-1 ml-4 space-y-1">
                    <li>Open incognito/private browsing window</li>
                    <li>Navigate to protected features to show paywall</li>
                    <li>Sign in with your admin account to show full access</li>
                    <li>Use the routes above to demonstrate premium features</li>
                  </ol>
                </div>
                <div>
                  <strong>For Development:</strong>
                  <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                    <li>Test API endpoints using the buttons above</li>
                    <li>Check console logs for detailed access control info</li>
                    <li>Use different email addresses to test non-admin access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}