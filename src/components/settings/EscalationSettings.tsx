'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { Save, AlertTriangle, Clock } from 'lucide-react';

interface EscalationConfig {
  enabled: boolean;
  levels: {
    CRITICAL: number[];
    HIGH: number[];
    MEDIUM: number[];
    LOW: number[];
  };
  recipients: string[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface EscalationSettingsProps {
  facilityId: string;
}

export function EscalationSettings({ facilityId }: EscalationSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<EscalationConfig>({
    enabled: true,
    levels: {
      CRITICAL: [10, 20],
      HIGH: [15, 30],
      MEDIUM: [30, 60],
      LOW: [60]
    },
    recipients: []
  });

  useEffect(() => {
    loadConfig();
    loadUsers();
  }, [facilityId]);

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/settings/alerts/escalation?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      logger.error('system', 'Error loading escalation config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Load facility managers and admins
      const response = await fetch(`/api/facilities/${facilityId}/users?role=MANAGER,ADMIN`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      logger.error('system', 'Error loading users:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/alerts/escalation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facilityId,
          config
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save escalation settings');
      }

      logger.info('system', 'Escalation settings saved successfully');
      alert('Escalation settings saved successfully');
    } catch (error) {
      logger.error('system', 'Error saving escalation settings:', error);
      alert('Failed to save escalation settings');
    } finally {
      setSaving(false);
    }
  };

  const updateLevel = (severity: keyof typeof config.levels, index: number, value: number) => {
    setConfig(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [severity]: prev.levels[severity].map((v, i) => i === index ? value : v)
      }
    }));
  };

  const toggleRecipient = (userId: string) => {
    setConfig(prev => ({
      ...prev,
      recipients: prev.recipients.includes(userId)
        ? prev.recipients.filter(id => id !== userId)
        : [...prev.recipients, userId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Alert Escalation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically escalate unacknowledged alerts to managers
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {config.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      {/* Escalation Timeframes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Escalation Timeframes
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure how long to wait before escalating unacknowledged alerts (in minutes)
        </p>

        <div className="space-y-6">
          {/* Critical */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <h4 className="font-medium text-gray-900 dark:text-white">Critical Alerts</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-5">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  First Escalation
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={config.levels.CRITICAL[0]}
                    onChange={(e) => updateLevel('CRITICAL', 0, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Second Escalation
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={config.levels.CRITICAL[1]}
                    onChange={(e) => updateLevel('CRITICAL', 1, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* High */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <h4 className="font-medium text-gray-900 dark:text-white">High Alerts</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-5">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  First Escalation
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={config.levels.HIGH[0]}
                    onChange={(e) => updateLevel('HIGH', 0, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Second Escalation
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={config.levels.HIGH[1]}
                    onChange={(e) => updateLevel('HIGH', 1, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medium */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <h4 className="font-medium text-gray-900 dark:text-white">Medium Alerts</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-5">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  First Escalation
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={config.levels.MEDIUM[0]}
                    onChange={(e) => updateLevel('MEDIUM', 0, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Second Escalation
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={config.levels.MEDIUM[1]}
                    onChange={(e) => updateLevel('MEDIUM', 1, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Low */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <h4 className="font-medium text-gray-900 dark:text-white">Low Alerts</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-5">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  First Escalation
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={config.levels.LOW[0]}
                    onChange={(e) => updateLevel('LOW', 0, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Recipients */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-purple-500" />
          Escalation Recipients
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Select users who should receive escalated alerts
        </p>

        {users.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No managers or admins found for this facility
          </p>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <label
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={config.recipients.includes(user.id)}
                  onChange={() => toggleRecipient(user.id)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email} • {user.role}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Escalation Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

