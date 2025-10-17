import { cache } from './cache'
import { Resend } from 'resend'

// Initialize Resend for alerts
const resend = new Resend(process.env.RESEND_API_KEY)

export interface AlertLevel {
  level: 'low' | 'medium' | 'high' | 'critical'
  threshold: number
  cooldown: number // seconds
}

export interface Metric {
  name: string
  value: number
  timestamp: number
  tags: Record<string, string>
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'gt' | 'lt' | 'eq' | 'ne'
  threshold: number
  level: AlertLevel['level']
  cooldown: number
  enabled: boolean
  description: string
  actions: Array<'email' | 'webhook' | 'log'>
}

class MonitoringService {
  private metrics: Map<string, Metric[]> = new Map()
  private alertRules: AlertRule[] = []
  private alertCooldowns: Map<string, number> = new Map()

  constructor() {
    this.initializeDefaultAlerts()
  }

  private initializeDefaultAlerts(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        metric: 'error_rate',
        condition: 'gt',
        threshold: 5, // 5% error rate
        level: 'high',
        cooldown: 300, // 5 minutes
        enabled: true,
        description: 'Error rate exceeds 5%',
        actions: ['email', 'log']
      },
      {
        id: 'low-memory',
        name: 'Low Memory',
        metric: 'memory_usage',
        condition: 'gt',
        threshold: 85, // 85% memory usage
        level: 'medium',
        cooldown: 600, // 10 minutes
        enabled: true,
        description: 'Memory usage exceeds 85%',
        actions: ['email', 'log']
      },
      {
        id: 'high-response-time',
        name: 'High Response Time',
        metric: 'response_time',
        condition: 'gt',
        threshold: 2000, // 2 seconds
        level: 'medium',
        cooldown: 300, // 5 minutes
        enabled: true,
        description: 'Average response time exceeds 2 seconds',
        actions: ['log']
      },
      {
        id: 'failed-database-connections',
        name: 'Database Connection Failures',
        metric: 'db_connection_failures',
        condition: 'gt',
        threshold: 10, // 10 failures
        level: 'critical',
        cooldown: 180, // 3 minutes
        enabled: true,
        description: 'Database connection failures exceed 10',
        actions: ['email', 'log']
      },
      {
        id: 'high-redis-latency',
        name: 'High Redis Latency',
        metric: 'redis_latency',
        condition: 'gt',
        threshold: 100, // 100ms
        level: 'medium',
        cooldown: 300, // 5 minutes
        enabled: true,
        description: 'Redis latency exceeds 100ms',
        actions: ['log']
      },
      {
        id: 'high-concurrent-users',
        name: 'High Concurrent Users',
        metric: 'concurrent_users',
        condition: 'gt',
        threshold: 1000, // 1000 users
        level: 'low',
        cooldown: 600, // 10 minutes
        enabled: true,
        description: 'Concurrent users exceed 1000',
        actions: ['log']
      }
    ]
  }

  // Record a metric
  recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metrics = this.metrics.get(name)!
    metrics.push(metric)

    // Keep only last 1000 metrics per type
    if (metrics.length > 1000) {
      metrics.shift()
    }

    // Check alert rules
    this.checkAlerts(name, value)
  }

  // Get metric values
  getMetrics(name: string, timeRange: number = 3600000): Metric[] {
    const metrics = this.metrics.get(name) || []
    const cutoff = Date.now() - timeRange
    return metrics.filter(m => m.timestamp >= cutoff)
  }

  // Calculate metric statistics
  getMetricStats(name: string, timeRange: number = 3600000): {
    count: number
    avg: number
    min: number
    max: number
    sum: number
  } {
    const metrics = this.getMetrics(name, timeRange)
    
    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, sum: 0 }
    }

    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { count: values.length, avg, min, max, sum }
  }

  // Check alert rules
  private async checkAlerts(metricName: string, value: number): Promise<void> {
    const relevantRules = this.alertRules.filter(rule => 
      rule.metric === metricName && rule.enabled
    )

    for (const rule of relevantRules) {
      const shouldAlert = this.evaluateCondition(value, rule.condition, rule.threshold)
      
      if (shouldAlert) {
        const now = Date.now()
        const lastAlert = this.alertCooldowns.get(rule.id) || 0
        
        if (now - lastAlert > rule.cooldown * 1000) {
          await this.triggerAlert(rule, value)
          this.alertCooldowns.set(rule.id, now)
        }
      }
    }
  }

  // Evaluate alert condition
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold
      case 'lt': return value < threshold
      case 'eq': return value === threshold
      case 'ne': return value !== threshold
      default: return false
    }
  }

  // Trigger alert
  private async triggerAlert(rule: AlertRule, value: number): Promise<void> {
    const alertData = {
      id: rule.id,
      name: rule.name,
      level: rule.level,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      description: rule.description,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }

    // Execute alert actions
    for (const action of rule.actions) {
      try {
        switch (action) {
          case 'email':
            await this.sendEmailAlert(alertData)
            break
          case 'webhook':
            await this.sendWebhookAlert(alertData)
            break
          case 'log':
            this.logAlert(alertData)
            break
        }
      } catch (error) {
        logger.error('api', `Failed to execute alert action ${action}:`, error instanceof Error ? error : undefined, error instanceof Error ? undefined : { error })
      }
    }

    // Store alert in cache for dashboard
    await cache.set(`alert:${rule.id}:${Date.now()}`, alertData, {
      ttl: 86400, // 24 hours
      prefix: 'monitoring:',
      tags: ['alerts']
    })
  }

  // Send email alert
  private async sendEmailAlert(alertData: any): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) return

    const subject = `[${alertData.level.toUpperCase()}] ${alertData.name} - VibeLux`
    const html = `
      <h2>Alert: ${alertData.name}</h2>
      <p><strong>Level:</strong> ${alertData.level}</p>
      <p><strong>Metric:</strong> ${alertData.metric}</p>
      <p><strong>Current Value:</strong> ${alertData.value}</p>
      <p><strong>Threshold:</strong> ${alertData.threshold}</p>
      <p><strong>Description:</strong> ${alertData.description}</p>
      <p><strong>Time:</strong> ${alertData.timestamp}</p>
      <p><strong>Environment:</strong> ${alertData.environment}</p>
    `

    await resend.emails.send({
      from: 'alerts@vibelux.com',
      to: adminEmail,
      subject,
      html
    })
  }

  // Send webhook alert
  private async sendWebhookAlert(alertData: any): Promise<void> {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL
    if (!webhookUrl) return

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData)
    })
  }

  // Log alert
  private logAlert(alertData: any): void {
    logger.error('api', `[ALERT] ${alertData.name}:`, undefined, alertData)
  }

  // Get system health metrics
  async getSystemHealth(): Promise<{
    uptime: number
    memory: any
    cpu: any
    database: any
    redis: any
    errors: any
  }> {
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    // Get recent error metrics
    const errorMetrics = this.getMetricStats('errors', 3600000)
    const responseTimeMetrics = this.getMetricStats('response_time', 3600000)

    return {
      uptime,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
        usage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      database: {
        connections: this.getMetricStats('db_connections', 3600000),
        queries: this.getMetricStats('db_queries', 3600000),
        errors: this.getMetricStats('db_errors', 3600000)
      },
      redis: {
        latency: this.getMetricStats('redis_latency', 3600000),
        commands: this.getMetricStats('redis_commands', 3600000)
      },
      errors: {
        total: errorMetrics.sum,
        rate: errorMetrics.avg,
        last_hour: errorMetrics.count
      }
    }
  }

  // Get recent alerts
  async getRecentAlerts(limit: number = 50): Promise<any[]> {
    // This would typically query from a database or cache
    // For now, we'll return a placeholder
    return []
  }

  // Clear metrics
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }

  // Add or update alert rule
  setAlertRule(rule: AlertRule): void {
    const index = this.alertRules.findIndex(r => r.id === rule.id)
    if (index >= 0) {
      this.alertRules[index] = rule
    } else {
      this.alertRules.push(rule)
    }
  }

  // Remove alert rule
  removeAlertRule(id: string): void {
    this.alertRules = this.alertRules.filter(r => r.id !== id)
  }

  // Get alert rules
  getAlertRules(): AlertRule[] {
    return this.alertRules
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService()

// Helper functions for common metrics
export const metrics = {
  recordError: (error: Error, tags?: Record<string, string>) => {
    monitoring.recordMetric('errors', 1, { ...tags, error: error.message })
  },
  
  recordResponseTime: (ms: number, endpoint?: string) => {
    monitoring.recordMetric('response_time', ms, { endpoint })
  },
  
  recordDatabaseQuery: (duration: number, query?: string) => {
    monitoring.recordMetric('db_queries', 1, { query })
    monitoring.recordMetric('db_query_duration', duration, { query })
  },
  
  recordUserAction: (action: string, userId?: string) => {
    monitoring.recordMetric('user_actions', 1, { action, userId })
  },
  
  recordAPICall: (endpoint: string, method: string, status: number) => {
    monitoring.recordMetric('api_calls', 1, { endpoint, method, status: status.toString() })
  },
  
  recordMemoryUsage: () => {
    const usage = process.memoryUsage()
    monitoring.recordMetric('memory_usage', (usage.heapUsed / usage.heapTotal) * 100)
  }
}

// Middleware for automatic metrics collection
export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    metrics.recordResponseTime(duration, req.path)
    metrics.recordAPICall(req.path, req.method, res.statusCode)
  })
  
  next()
}