/**
 * Environmental Alert Email Template
 * Sent when environmental conditions require attention
 */

import * as React from 'react';
import {
  BaseEmailTemplate,
  EmailHeading,
  EmailText,
  EmailButton,
  EmailAlert,
  EmailCard,
  EmailMetric,
  colors,
} from '../base-template';
import { Text } from '@react-email/components';

interface EnvironmentalAlertEmailProps {
  alertTitle: string;
  alertMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severityColor: string;
  timestamp: string;
  actionUrl: string;
  data?: {
    facility?: string;
    zone?: string;
    sensor?: string;
    currentValue?: number;
    threshold?: number;
    unit?: string;
    duration?: string;
    history?: Array<{ time: string; value: number }>;
  };
}

export function EnvironmentalAlertEmail({
  alertTitle,
  alertMessage,
  severity,
  severityColor,
  timestamp,
  actionUrl,
  data,
}: EnvironmentalAlertEmailProps) {
  const getSeverityEmoji = () => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📊';
      case 'low': return 'ℹ️';
      default: return '📌';
    }
  };

  return (
    <BaseEmailTemplate preview={`${getSeverityEmoji()} ${alertTitle}`}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '48px' }}>{getSeverityEmoji()}</span>
      </div>
      
      <EmailHeading>{alertTitle}</EmailHeading>
      
      <div
        style={{
          backgroundColor: `${severityColor}20`,
          border: `2px solid ${severityColor}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <Text style={{ 
          color: severityColor, 
          fontWeight: '600',
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 8px',
        }}>
          {severity} SEVERITY ALERT
        </Text>
        <Text style={{ color: colors.text, margin: 0 }}>
          {alertMessage}
        </Text>
      </div>
      
      {data && (
        <EmailCard title="Alert Details">
          {data.facility && (
            <EmailText>
              <strong>Facility:</strong> {data.facility}
            </EmailText>
          )}
          {data.zone && (
            <EmailText>
              <strong>Zone:</strong> {data.zone}
            </EmailText>
          )}
          {data.sensor && (
            <EmailText>
              <strong>Sensor:</strong> {data.sensor}
            </EmailText>
          )}
          
          {data.currentValue !== undefined && (
            <div style={{ 
              display: 'flex', 
              gap: '20px',
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
            }}>
              <div style={{ flex: 1 }}>
                <EmailMetric
                  label="Current Value"
                  value={`${data.currentValue}${data.unit || ''}`}
                  trend={data.threshold && data.currentValue > data.threshold ? 'up' : 'down'}
                />
              </div>
              {data.threshold && (
                <div style={{ flex: 1 }}>
                  <EmailMetric
                    label="Threshold"
                    value={`${data.threshold}${data.unit || ''}`}
                    trend="neutral"
                  />
                </div>
              )}
              {data.duration && (
                <div style={{ flex: 1 }}>
                  <EmailMetric
                    label="Duration"
                    value={data.duration}
                    trend="neutral"
                  />
                </div>
              )}
            </div>
          )}
          
          {data.history && data.history.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <Text style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '8px' }}>
                Recent History
              </Text>
              <div style={{ 
                backgroundColor: '#0a0a0a',
                borderRadius: '4px',
                padding: '8px',
              }}>
                {data.history.slice(0, 5).map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: index < 4 ? `1px solid ${colors.border}` : 'none',
                    }}
                  >
                    <Text style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
                      {entry.time}
                    </Text>
                    <Text style={{ fontSize: '12px', color: colors.text, margin: 0 }}>
                      {entry.value}{data.unit || ''}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </EmailCard>
      )}
      
      <EmailButton href={actionUrl}>
        View in Dashboard
      </EmailButton>
      
      <EmailCard title="Recommended Actions">
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {severity === 'critical' && (
            <>
              <li style={{ color: colors.text, marginBottom: '8px' }}>
                Immediate attention required - Check affected systems
              </li>
              <li style={{ color: colors.text, marginBottom: '8px' }}>
                Verify sensor readings for accuracy
              </li>
              <li style={{ color: colors.text }}>
                Implement corrective measures immediately
              </li>
            </>
          )}
          {severity === 'high' && (
            <>
              <li style={{ color: colors.text, marginBottom: '8px' }}>
                Review environmental controls within 1 hour
              </li>
              <li style={{ color: colors.text, marginBottom: '8px' }}>
                Check for equipment malfunctions
              </li>
              <li style={{ color: colors.text }}>
                Monitor trends for escalation
              </li>
            </>
          )}
          {(severity === 'medium' || severity === 'low') && (
            <>
              <li style={{ color: colors.text, marginBottom: '8px' }}>
                Monitor the situation for changes
              </li>
              <li style={{ color: colors.text, marginBottom: '8px' }}>
                Review historical data for patterns
              </li>
              <li style={{ color: colors.text }}>
                Schedule maintenance if recurring
              </li>
            </>
          )}
        </ul>
      </EmailCard>
      
      <EmailText muted>
        <strong>Alert Generated:</strong> {timestamp}
      </EmailText>
      
      <EmailText muted>
        This is an automated alert from your VibeLux monitoring system.
        To adjust alert thresholds or notification preferences, visit your dashboard settings.
      </EmailText>
    </BaseEmailTemplate>
  );
}

export default EnvironmentalAlertEmail;