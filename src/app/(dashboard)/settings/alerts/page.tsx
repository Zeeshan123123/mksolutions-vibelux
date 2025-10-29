'use client';

import React, { useState, useEffect } from 'react';
import { AlertRuleForm } from '@/components/settings/AlertRuleForm';
import { EscalationSettings } from '@/components/settings/EscalationSettings';
import { logger } from '@/lib/client-logger';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Settings,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  alertType: string;
  condition: string;
  threshold: number;
  thresholdMax?: number | null;
  severity: string;
  cooldownMinutes: number;
  sensor: {
    id: string;
    name: string;
    sensorType: string;
  };
}

export default function AlertSettingsPage() {
  const [facilityId, setFacilityId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rules' | 'escalation'>('rules');
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | undefined>();

  // Get facility ID from localStorage or use default
  useEffect(() => {
    async function getFacilityId() {
      try {
        const storedFacilityId = localStorage.getItem('selectedFacilityId');
        
        if (storedFacilityId) {
          setFacilityId(storedFacilityId);
        } else {
          // Use default facility ID
          setFacilityId('cmh5wpg2p0000vdm4hfg2e5q6');
        }
      } catch (error) {
        logger.error('system', 'Error getting facility ID:', error);
        // Fallback to default
        setFacilityId('cmh5wpg2p0000vdm4hfg2e5q6');
      }
    }
    
    getFacilityId();
  }, []);

  useEffect(() => {
    if (facilityId) {
      loadRules();
    }
  }, [facilityId]);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings/alerts/configurations?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        setRules(data.configurations);
      }
    } catch (error) {
      logger.error('system', 'Error loading alert rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;

      const response = await fetch('/api/settings/alerts/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: ruleId,
          facilityId,
          sensorId: rule.sensor.id,
          name: rule.name,
          enabled,
          alertType: rule.alertType,
          condition: rule.condition,
          threshold: rule.threshold,
          thresholdMax: rule.thresholdMax,
          severity: rule.severity,
          cooldownMinutes: rule.cooldownMinutes,
          actions: { email: true, sms: false, push: true, webhook: false }
        })
      });

      if (response.ok) {
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled } : r));
      }
    } catch (error) {
      logger.error('system', 'Error toggling rule:', error);
      alert('Failed to toggle rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to disable this rule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/alerts/configurations/${ruleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRules(prev => prev.filter(r => r.id !== ruleId));
      }
    } catch (error) {
      logger.error('system', 'Error deleting rule:', error);
      alert('Failed to delete rule');
    }
  };

  const handleEditRule = (ruleId: string) => {
    setEditingRuleId(ruleId);
    setShowRuleForm(true);
  };

  const handleAddRule = () => {
    setEditingRuleId(undefined);
    setShowRuleForm(true);
  };

  const handleFormClose = () => {
    setShowRuleForm(false);
    setEditingRuleId(undefined);
    loadRules();
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[severity as keyof typeof classes] || classes.MEDIUM}`}>
        {severity}
      </span>
    );
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      GT: '>',
      GTE: '≥',
      LT: '<',
      LTE: '≤',
      BETWEEN: 'Outside Range',
      RATE: 'Rate of Change'
    };
    return labels[condition] || condition;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-purple-500" />
            Alert Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Configure alert rules and escalation policies
          </p>
        </div>
        <button
          onClick={loadRules}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'rules'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Alert Rules
          </button>
          <button
            onClick={() => setActiveTab('escalation')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'escalation'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Escalation Settings
          </button>
        </div>
      </div>

      {/* Alert Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
            </p>
            <button
              onClick={handleAddRule}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Rule
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No alert rules configured yet</p>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Rule
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rule Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sensor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rules.map(rule => (
                    <tr key={rule.id} className={!rule.enabled ? 'opacity-50' : ''}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {rule.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {rule.alertType.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {rule.sensor.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {rule.sensor.sensorType}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {getConditionLabel(rule.condition)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {rule.condition === 'BETWEEN' && rule.thresholdMax
                          ? `${rule.threshold} - ${rule.thresholdMax}`
                          : rule.threshold}
                      </td>
                      <td className="px-6 py-4">
                        {getSeverityBadge(rule.severity)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                          className="flex items-center gap-2"
                        >
                          {rule.enabled ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">Enabled</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditRule(rule.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit rule"
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Escalation Settings Tab */}
      {activeTab === 'escalation' && (
        <EscalationSettings facilityId={facilityId} />
      )}

      {/* Rule Form Modal */}
      {showRuleForm && (
        <AlertRuleForm
          facilityId={facilityId}
          ruleId={editingRuleId}
          onSave={handleFormClose}
          onCancel={handleFormClose}
        />
      )}
    </div>
  );
}

