/**
 * Weekly Digest Email Template
 * Weekly summary of facility performance and insights
 */

import * as React from 'react';
import {
  BaseEmailTemplate,
  EmailHeading,
  EmailText,
  EmailButton,
  EmailCard,
  EmailMetric,
  EmailDivider,
  colors,
} from '../base-template';
import { Text, Link } from '@react-email/components';

interface WeeklyDigestProps {
  recipientName: string;
  facilityName: string;
  weekRange: string;
  metrics: {
    yield?: { value: number; trend: 'up' | 'down' | 'neutral'; change: number };
    energy?: { value: number; trend: 'up' | 'down' | 'neutral'; change: number };
    water?: { value: number; trend: 'up' | 'down' | 'neutral'; change: number };
    quality?: { value: number; trend: 'up' | 'down' | 'neutral'; change: number };
  };
  topInsights: string[];
  alerts: Array<{
    type: 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
  upcomingTasks: Array<{
    task: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  achievements?: string[];
  dashboardUrl: string;
}

export function WeeklyDigestEmail({
  recipientName,
  facilityName,
  weekRange,
  metrics,
  topInsights,
  alerts,
  upcomingTasks,
  achievements,
  dashboardUrl,
}: WeeklyDigestProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textMuted;
    }
  };

  const formatTrend = (value: number, trend: 'up' | 'down' | 'neutral', change: number) => {
    const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
    const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.textMuted;
    return (
      <div>
        <Text style={{ fontSize: '24px', fontWeight: '700', color: colors.text, margin: 0 }}>
          {value}
        </Text>
        <Text style={{ fontSize: '14px', color: trendColor, margin: 0 }}>
          {trendIcon} {Math.abs(change)}% from last week
        </Text>
      </div>
    );
  };

  return (
    <BaseEmailTemplate preview={`Weekly Digest for ${facilityName} - ${weekRange}`}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Text style={{ fontSize: '14px', color: colors.primary, margin: '0 0 8px' }}>
          WEEKLY DIGEST
        </Text>
        <EmailHeading>{facilityName}</EmailHeading>
        <Text style={{ fontSize: '16px', color: colors.textMuted, margin: 0 }}>
          {weekRange}
        </Text>
      </div>
      
      <EmailText>Hi {recipientName},</EmailText>
      
      <EmailText>
        Here's your weekly performance summary for {facilityName}. 
        Overall, your facility is performing{' '}
        <strong style={{ color: colors.success }}>above average</strong> this week.
      </EmailText>
      
      {/* Key Metrics */}
      <EmailCard title="📊 Key Performance Metrics">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}>
          {metrics.yield && (
            <div>
              <Text style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 4px' }}>
                Average Yield (g/plant)
              </Text>
              {formatTrend(metrics.yield.value, metrics.yield.trend, metrics.yield.change)}
            </div>
          )}
          
          {metrics.energy && (
            <div>
              <Text style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 4px' }}>
                Energy Efficiency (kWh/g)
              </Text>
              {formatTrend(metrics.energy.value, metrics.energy.trend, metrics.energy.change)}
            </div>
          )}
          
          {metrics.water && (
            <div>
              <Text style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 4px' }}>
                Water Usage (L/day)
              </Text>
              {formatTrend(metrics.water.value, metrics.water.trend, metrics.water.change)}
            </div>
          )}
          
          {metrics.quality && (
            <div>
              <Text style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 4px' }}>
                Quality Score
              </Text>
              {formatTrend(metrics.quality.value, metrics.quality.trend, metrics.quality.change)}
            </div>
          )}
        </div>
      </EmailCard>
      
      {/* Top Insights */}
      {topInsights.length > 0 && (
        <EmailCard title="💡 Top Insights">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {topInsights.map((insight, index) => (
              <li key={index} style={{ color: colors.text, marginBottom: '8px' }}>
                {insight}
              </li>
            ))}
          </ul>
        </EmailCard>
      )}
      
      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <EmailCard title="🏆 Achievements This Week">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {achievements.map((achievement, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: `${colors.success}20`,
                  color: colors.success,
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  border: `1px solid ${colors.success}`,
                }}
              >
                {achievement}
              </span>
            ))}
          </div>
        </EmailCard>
      )}
      
      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <EmailCard title="🔔 Recent Alerts">
          {alerts.slice(0, 5).map((alert, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#0a0a0a',
                borderRadius: '6px',
                borderLeft: `3px solid ${
                  alert.type === 'error' ? colors.error :
                  alert.type === 'warning' ? colors.warning :
                  colors.success
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{getAlertIcon(alert.type)}</span>
                <Text style={{ fontSize: '14px', color: colors.text, margin: 0, flex: 1 }}>
                  {alert.message}
                </Text>
              </div>
              <Text style={{ fontSize: '12px', color: colors.textMuted, margin: '4px 0 0 24px' }}>
                {alert.timestamp}
              </Text>
            </div>
          ))}
        </EmailCard>
      )}
      
      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <EmailCard title="📅 Upcoming Tasks">
          {upcomingTasks.slice(0, 5).map((task, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < upcomingTasks.length - 1 ? `1px solid ${colors.border}` : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', color: colors.text, margin: 0 }}>
                  {task.task}
                </Text>
                <Text style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
                  Due: {task.dueDate}
                </Text>
              </div>
              <span
                style={{
                  backgroundColor: `${getPriorityColor(task.priority)}20`,
                  color: getPriorityColor(task.priority),
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </EmailCard>
      )}
      
      <EmailButton href={dashboardUrl}>
        View Full Dashboard
      </EmailButton>
      
      <EmailDivider />
      
      {/* Quick Actions */}
      <EmailCard title="⚡ Quick Actions">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Link
            href={`${dashboardUrl}/reports`}
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              padding: '8px 16px',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            📊 View Reports
          </Link>
          <Link
            href={`${dashboardUrl}/analytics`}
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              padding: '8px 16px',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            📈 Analytics
          </Link>
          <Link
            href={`${dashboardUrl}/tasks`}
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              padding: '8px 16px',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            ✅ Manage Tasks
          </Link>
          <Link
            href={`${dashboardUrl}/settings`}
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              padding: '8px 16px',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            ⚙️ Settings
          </Link>
        </div>
      </EmailCard>
      
      <EmailText muted>
        You're receiving this digest because you're subscribed to weekly reports for {facilityName}.
        <br />
        <Link href={`${dashboardUrl}/preferences`} style={{ color: colors.primary }}>
          Manage email preferences
        </Link>
      </EmailText>
    </BaseEmailTemplate>
  );
}

export default WeeklyDigestEmail;