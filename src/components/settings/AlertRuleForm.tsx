'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { X, Save, AlertTriangle } from 'lucide-react';

interface AlertRuleFormProps {
  facilityId: string;
  ruleId?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface Sensor {
  id: string;
  name: string;
  sensorType: string;
  zone: {
    id: string;
    name: string;
  };
}

export function AlertRuleForm({ facilityId, ruleId, onSave, onCancel }: AlertRuleFormProps) {
  const [loading, setLoading] = useState(false);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sensorId: '',
    alertType: 'TEMPERATURE_HIGH',
    condition: 'GT',
    threshold: 0,
    thresholdMax: null as number | null,
    severity: 'MEDIUM',
    duration: null as number | null,
    cooldownMinutes: 15,
    actions: {
      email: true,
      sms: false,
      push: true,
      webhook: false
    },
    notificationMessage: '',
    enabled: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSensors();
    if (ruleId) {
      loadRule();
    }
  }, [facilityId, ruleId]);

  const loadSensors = async () => {
    try {
      const response = await fetch(`/api/sensors?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        setSensors(data.sensors);
      }
    } catch (error) {
      logger.error('system', 'Error loading sensors:', error);
    }
  };

  const loadRule = async () => {
    try {
      const response = await fetch(`/api/settings/alerts/configurations?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        const rule = data.configurations.find((r: any) => r.id === ruleId);
        if (rule) {
          setFormData({
            name: rule.name,
            sensorId: rule.sensorId,
            alertType: rule.alertType,
            condition: rule.condition,
            threshold: rule.threshold,
            thresholdMax: rule.thresholdMax,
            severity: rule.severity,
            duration: rule.duration,
            cooldownMinutes: rule.cooldownMinutes,
            actions: rule.actions,
            notificationMessage: rule.notificationMessage || '',
            enabled: rule.enabled
          });
        }
      }
    } catch (error) {
      logger.error('system', 'Error loading rule:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.sensorId) {
      newErrors.sensorId = 'Sensor is required';
    }

    if (formData.condition === 'BETWEEN') {
      if (formData.thresholdMax === null) {
        newErrors.thresholdMax = 'Maximum threshold is required for BETWEEN condition';
      } else if (formData.thresholdMax <= formData.threshold) {
        newErrors.thresholdMax = 'Maximum must be greater than minimum threshold';
      }
    }

    if (formData.duration !== null && formData.duration < 0) {
      newErrors.duration = 'Duration must be 0 or greater';
    }

    if (formData.cooldownMinutes < 1) {
      newErrors.cooldownMinutes = 'Cooldown must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...(ruleId && { id: ruleId }),
        facilityId,
        ...formData
      };

      const response = await fetch('/api/settings/alerts/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save rule');
      }

      logger.info('system', 'Alert rule saved successfully');
      onSave();
    } catch (error) {
      logger.error('system', 'Error saving rule:', error);
      alert(error instanceof Error ? error.message : 'Failed to save rule');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {ruleId ? 'Edit Alert Rule' : 'Create Alert Rule'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rule Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="e.g., High Temperature Warning"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Sensor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sensor *
            </label>
            <select
              value={formData.sensorId}
              onChange={(e) => updateField('sensorId', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500 ${
                errors.sensorId ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <option value="">Select a sensor</option>
              {sensors.map(sensor => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.zone.name} - {sensor.name} ({sensor.sensorType})
                </option>
              ))}
            </select>
            {errors.sensorId && (
              <p className="text-red-500 text-sm mt-1">{errors.sensorId}</p>
            )}
          </div>

          {/* Alert Type and Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Type *
              </label>
              <select
                value={formData.alertType}
                onChange={(e) => updateField('alertType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
              >
                <option value="TEMPERATURE_HIGH">Temperature High</option>
                <option value="TEMPERATURE_LOW">Temperature Low</option>
                <option value="HUMIDITY_HIGH">Humidity High</option>
                <option value="HUMIDITY_LOW">Humidity Low</option>
                <option value="CO2_HIGH">CO₂ High</option>
                <option value="CO2_LOW">CO₂ Low</option>
                <option value="LIGHT_HIGH">Light High</option>
                <option value="LIGHT_LOW">Light Low</option>
                <option value="VPD_OUT_OF_RANGE">VPD Out of Range</option>
                <option value="PH_HIGH">pH High</option>
                <option value="PH_LOW">pH Low</option>
                <option value="EC_HIGH">EC High</option>
                <option value="EC_LOW">EC Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => updateField('severity', e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Condition and Thresholds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condition *
            </label>
            <select
              value={formData.condition}
              onChange={(e) => updateField('condition', e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500 mb-4"
            >
              <option value="GT">Greater Than (&gt;)</option>
              <option value="GTE">Greater Than or Equal (≥)</option>
              <option value="LT">Less Than (&lt;)</option>
              <option value="LTE">Less Than or Equal (≤)</option>
              <option value="BETWEEN">Outside Range (Between)</option>
              <option value="RATE">Rate of Change</option>
            </select>

            <div className={formData.condition === 'BETWEEN' ? 'grid grid-cols-2 gap-4' : ''}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.condition === 'BETWEEN' ? 'Minimum Threshold *' : 'Threshold *'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.threshold}
                  onChange={(e) => updateField('threshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {formData.condition === 'BETWEEN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Threshold *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thresholdMax || ''}
                    onChange={(e) => updateField('thresholdMax', e.target.value ? parseFloat(e.target.value) : null)}
                    className={`w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500 ${
                      errors.thresholdMax ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.thresholdMax && (
                    <p className="text-red-500 text-sm mt-1">{errors.thresholdMax}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Duration and Cooldown */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration || ''}
                onChange={(e) => updateField('duration', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500"
                placeholder="Optional"
              />
              <p className="text-xs text-gray-500 mt-1">How long condition must persist before alerting</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cooldown (minutes) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.cooldownMinutes}
                onChange={(e) => updateField('cooldownMinutes', parseInt(e.target.value))}
                className={`w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500 ${
                  errors.cooldownMinutes ? 'ring-2 ring-red-500' : ''
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum time between duplicate alerts</p>
            </div>
          </div>

          {/* Notification Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Notification Message
            </label>
            <textarea
              value={formData.notificationMessage}
              onChange={(e) => updateField('notificationMessage', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Use {{value}}, {{threshold}}, {{sensor}} as placeholders"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use default message</p>
          </div>

          {/* Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Channels
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.actions.email}
                  onChange={(e) => updateField('actions', { ...formData.actions, email: e.target.checked })}
                  className="rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Email</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.actions.sms}
                  onChange={(e) => updateField('actions', { ...formData.actions, sms: e.target.checked })}
                  className="rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">SMS</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.actions.push}
                  onChange={(e) => updateField('actions', { ...formData.actions, push: e.target.checked })}
                  className="rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Push Notification</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.actions.webhook}
                  onChange={(e) => updateField('actions', { ...formData.actions, webhook: e.target.checked })}
                  className="rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Webhook</span>
              </label>
            </div>
          </div>

          {/* Enabled Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => updateField('enabled', e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Rule Enabled</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Rule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

