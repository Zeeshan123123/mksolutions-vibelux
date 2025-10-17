"use client"

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/production-logger';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Camera, 
  Lock,
  TrendingUp,
  Download,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Target,
  MapPin,
  AlertCircle,
  Settings,
  BookOpen,
  Calendar,
  DollarSign
} from 'lucide-react';

import { SecurityPlan, SecurityPlanStatus, RiskAssessment, Recommendation, SecurityKPI } from '@/lib/security/security-planning';
import { SecurityPlanningService } from '@/lib/security/security-planning-service';

export default function SecurityPlanningDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [securityPlans, setSecurityPlans] = useState<SecurityPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SecurityPlan | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [kpis, setKPIs] = useState<SecurityKPI[]>([]);
  const [loading, setLoading] = useState(false);

  const planningService = new SecurityPlanningService('facility-1');

  useEffect(() => {
    loadSecurityPlans();
    loadKPIs();
  }, []);

  const loadSecurityPlans = async () => {
    // Load existing security plans
    // This would integrate with the backend API
    const mockPlans: SecurityPlan[] = [
      {
        id: 'plan-1',
        facilityId: 'facility-1',
        version: '2.1',
        status: SecurityPlanStatus.Active,
        createdBy: 'John Doe',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-07-10'),
        effectiveDate: new Date('2024-01-20'),
        expiryDate: new Date('2025-01-20'),
        executiveSummary: 'Comprehensive security plan for cannabis cultivation facility...',
        // ... other properties would be populated
      } as SecurityPlan
    ];
    
    setSecurityPlans(mockPlans);
    if (mockPlans.length > 0) {
      setSelectedPlan(mockPlans[0]);
    }
  };

  const loadKPIs = async () => {
    const mockKPIs: SecurityKPI[] = [
      {
        id: 'kpi-1',
        name: 'Access Control Effectiveness',
        description: 'Percentage of authorized access attempts',
        target: 99.5,
        current: 97.2,
        trend: 'improving',
        frequency: 'daily',
        owner: 'Security Manager',
        formula: '(Authorized Access / Total Access Attempts) * 100',
        dataSource: 'Access Control System',
        greenThreshold: 99,
        yellowThreshold: 95,
        redThreshold: 90
      },
      {
        id: 'kpi-2',
        name: 'Incident Response Time',
        description: 'Average time to respond to security incidents',
        target: 5,
        current: 8.5,
        trend: 'improving',
        frequency: 'daily',
        owner: 'Security Team',
        formula: 'Sum(Response Times) / Count(Incidents)',
        dataSource: 'Incident Management System',
        greenThreshold: 5,
        yellowThreshold: 10,
        redThreshold: 15
      },
      {
        id: 'kpi-3',
        name: 'Camera System Uptime',
        description: 'Percentage of cameras operational',
        target: 99.9,
        current: 98.7,
        trend: 'stable',
        frequency: 'hourly',
        owner: 'IT Security',
        formula: '(Operational Cameras / Total Cameras) * 100',
        dataSource: 'Surveillance System',
        greenThreshold: 99,
        yellowThreshold: 95,
        redThreshold: 90
      }
    ];
    
    setKPIs(mockKPIs);
  };

  const createNewSecurityPlan = async () => {
    setLoading(true);
    try {
      const requirements = {
        facilityType: 'cultivation' as const,
        jurisdiction: 'CA',
        cannabisLicense: true,
        budgetConstraints: 100000,
        timelineConstraints: 90,
        existingInfrastructure: {},
        specialRequirements: ['24/7 monitoring', 'METRC integration'],
        createdBy: 'Current User'
      };
      
      const newPlan = await planningService.createSecurityPlan(requirements);
      setSecurityPlans(prev => [...prev, newPlan]);
      setSelectedPlan(newPlan);
      setActiveTab('plan-details');
    } catch (error) {
      logger.error('security', 'Failed to create security plan:', error );
    } finally {
      setLoading(false);
    }
  };

  const conductRiskAssessment = async () => {
    setLoading(true);
    try {
      const assessment = await planningService.conductRiskAssessment();
      setRiskAssessment(assessment);
      
      const recs = await planningService.generateRecommendations(assessment);
      setRecommendations(recs);
      
      setActiveTab('risk-assessment');
    } catch (error) {
      logger.error('security', 'Failed to conduct risk assessment:', error );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SecurityPlanStatus) => {
    switch (status) {
      case SecurityPlanStatus.Active:
        return 'bg-green-100 text-green-800';
      case SecurityPlanStatus.Draft:
        return 'bg-yellow-100 text-yellow-800';
      case SecurityPlanStatus.Review:
        return 'bg-blue-100 text-blue-800';
      case SecurityPlanStatus.Expired:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKPIColor = (kpi: SecurityKPI) => {
    if (kpi.current >= kpi.greenThreshold) return 'text-green-600';
    if (kpi.current >= kpi.yellowThreshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Security Planning Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive security planning and risk management for your facility
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={conductRiskAssessment}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Risk Assessment
              </button>
              <button
                onClick={createNewSecurityPlan}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Security Plan
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'plan-details', label: 'Security Plans', icon: FileText },
              { id: 'risk-assessment', label: 'Risk Assessment', icon: AlertTriangle },
              { id: 'recommendations', label: 'Recommendations', icon: Target },
              { id: 'kpis', label: 'KPIs', icon: TrendingUp },
              { id: 'compliance', label: 'Compliance', icon: CheckCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Security Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{securityPlans.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-green-600">87%</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Issues</p>
                    <p className="text-2xl font-bold text-yellow-600">3</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compliance</p>
                    <p className="text-2xl font-bold text-blue-600">95%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Security Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { action: 'Security plan updated', time: '2 hours ago', type: 'update' },
                    { action: 'Risk assessment completed', time: '1 day ago', type: 'assessment' },
                    { action: 'New recommendation added', time: '3 days ago', type: 'recommendation' },
                    { action: 'Compliance audit passed', time: '1 week ago', type: 'compliance' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'update' && <Edit className="w-5 h-5 text-blue-500" />}
                        {activity.type === 'assessment' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                        {activity.type === 'recommendation' && <Target className="w-5 h-5 text-purple-500" />}
                        {activity.type === 'compliance' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan-details' && (
          <div className="space-y-6">
            {/* Security Plans List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Security Plans</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {securityPlans.map((plan) => (
                      <tr key={plan.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Security Plan {plan.version}
                              </div>
                              <div className="text-sm text-gray-500">
                                Facility: {plan.facilityId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plan.version}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                            {plan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plan.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-purple-600 hover:text-purple-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plan Details */}
            {selectedPlan && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Plan Details</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
                      <p className="text-sm text-gray-600">{selectedPlan.executiveSummary}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Plan Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <span className="text-gray-900">{selectedPlan.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Effective Date:</span>
                          <span className="text-gray-900">{selectedPlan.effectiveDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created By:</span>
                          <span className="text-gray-900">{selectedPlan.createdBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-6">
            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">{kpi.name}</h3>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">{kpi.current}</span>
                      <span className="text-sm text-gray-500">Target: {kpi.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          kpi.current >= kpi.greenThreshold ? 'bg-green-500' :
                          kpi.current >= kpi.yellowThreshold ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{kpi.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-900">Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}