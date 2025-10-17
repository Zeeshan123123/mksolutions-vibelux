import { prisma } from '@/lib/prisma'
import { EventEmitter } from 'events'
import { logger } from '@/lib/logging/production-logger'

export interface ProjectTaskData {
  id: string
  projectId: string
  title: string
  description: string
  taskType: string
  dependencies: string[]
  blockedBy: string[]
  assignedTo: string[]
  contractors: string[]
  plannedStart: Date
  plannedEnd: Date
  actualStart?: Date | null
  actualEnd?: Date | null
  status: string
  progress: number
  estimatedCost?: number | null
  actualCost?: number | null
  costVariance?: number | null
  riskLevel?: string | null
  riskFactors: string[]
  documents: string[]
  notes?: string | null
  isMilestone: boolean
  milestoneType?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStakeholderData {
  id: string
  projectId: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  role: string
  canView: boolean
  canComment: boolean
  canEdit: boolean
  canApprove: boolean
  notifyOnUpdate: boolean
  notifyOnDelay: boolean
  notifyOnMilestone: boolean
  preferredContact: string
  lastAccessed?: Date | null
  accessCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectUpdateData {
  id: string
  projectId: string
  updateType: string
  title: string
  description: string
  impactLevel: string
  affectedTasks: string[]
  delayDays?: number | null
  newEndDate?: Date | null
  costImpact?: number | null
  createdBy: string
  notifiedStakeholders: string[]
  createdAt: Date
}

export class ProjectManagementService extends EventEmitter {
  /**
   * Get all tasks for a project
   */
  static async getProjectTasks(projectId: string): Promise<ProjectTaskData[]> {
    try {
      const tasks = await prisma.projectTask.findMany({
        where: { projectId },
        orderBy: [
          { isMilestone: 'desc' },
          { plannedStart: 'asc' },
          { title: 'asc' }
        ]
      })
      
      return tasks as ProjectTaskData[]
    } catch (error) {
      logger.error('Failed to fetch project tasks:', error)
      return []
    }
  }
  
  /**
   * Create a new project task
   */
  static async createProjectTask(data: Omit<ProjectTaskData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTaskData | null> {
    try {
      const task = await prisma.projectTask.create({
        data: {
          ...data,
          status: data.status || 'pending',
          progress: data.progress || 0,
          riskFactors: data.riskFactors || [],
          documents: data.documents || [],
          dependencies: data.dependencies || [],
          blockedBy: data.blockedBy || [],
          assignedTo: data.assignedTo || [],
          contractors: data.contractors || []
        }
      })
      
      // Emit event for timeline updates
      this.emitTaskUpdate('task-created', task)
      
      return task as ProjectTaskData
    } catch (error) {
      logger.error('Failed to create project task:', error)
      return null
    }
  }
  
  /**
   * Update a project task
   */
  static async updateProjectTask(
    id: string,
    data: Partial<Omit<ProjectTaskData, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ProjectTaskData | null> {
    try {
      const currentTask = await prisma.projectTask.findUnique({
        where: { id }
      })
      
      if (!currentTask) return null
      
      const updatedTask = await prisma.projectTask.update({
        where: { id },
        data
      })
      
      // Check for delays and notify stakeholders
      if (data.actualEnd && currentTask.plannedEnd) {
        const delayDays = Math.ceil(
          (data.actualEnd.getTime() - currentTask.plannedEnd.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (delayDays > 0) {
          await this.createProjectUpdate({
            projectId: currentTask.projectId,
            updateType: 'delay',
            title: `Task "${currentTask.title}" Delayed`,
            description: `Task delayed by ${delayDays} days`,
            impactLevel: delayDays > 7 ? 'high' : 'medium',
            affectedTasks: [id],
            delayDays,
            newEndDate: data.actualEnd,
            createdBy: 'system',
            notifiedStakeholders: []
          })
        }
      }
      
      // Emit event for timeline updates
      this.emitTaskUpdate('task-updated', updatedTask)
      
      return updatedTask as ProjectTaskData
    } catch (error) {
      logger.error('Failed to update project task:', error)
      return null
    }
  }
  
  /**
   * Delete a project task
   */
  static async deleteProjectTask(id: string): Promise<boolean> {
    try {
      await prisma.projectTask.delete({
        where: { id }
      })
      
      // Emit event for timeline updates
      this.emitTaskUpdate('task-deleted', { id })
      
      return true
    } catch (error) {
      logger.error('Failed to delete project task:', error)
      return false
    }
  }
  
  /**
   * Get all stakeholders for a project
   */
  static async getProjectStakeholders(projectId: string): Promise<ProjectStakeholderData[]> {
    try {
      const stakeholders = await prisma.projectStakeholder.findMany({
        where: { projectId },
        orderBy: [
          { role: 'asc' },
          { name: 'asc' }
        ]
      })
      
      return stakeholders as ProjectStakeholderData[]
    } catch (error) {
      logger.error('Failed to fetch project stakeholders:', error)
      return []
    }
  }
  
  /**
   * Add a stakeholder to a project
   */
  static async addProjectStakeholder(
    data: Omit<ProjectStakeholderData, 'id' | 'lastAccessed' | 'accessCount' | 'createdAt' | 'updatedAt'>
  ): Promise<ProjectStakeholderData | null> {
    try {
      const stakeholder = await prisma.projectStakeholder.create({
        data: {
          ...data,
          accessCount: 0
        }
      })
      
      return stakeholder as ProjectStakeholderData
    } catch (error) {
      logger.error('Failed to add project stakeholder:', error)
      return null
    }
  }
  
  /**
   * Update stakeholder permissions
   */
  static async updateStakeholder(
    id: string,
    data: Partial<Omit<ProjectStakeholderData, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ProjectStakeholderData | null> {
    try {
      const stakeholder = await prisma.projectStakeholder.update({
        where: { id },
        data
      })
      
      return stakeholder as ProjectStakeholderData
    } catch (error) {
      logger.error('Failed to update stakeholder:', error)
      return null
    }
  }
  
  /**
   * Remove a stakeholder from a project
   */
  static async removeStakeholder(id: string): Promise<boolean> {
    try {
      await prisma.projectStakeholder.delete({
        where: { id }
      })
      
      return true
    } catch (error) {
      logger.error('Failed to remove stakeholder:', error)
      return false
    }
  }
  
  /**
   * Create a project update and notify stakeholders
   */
  static async createProjectUpdate(
    data: Omit<ProjectUpdateData, 'id' | 'createdAt'>
  ): Promise<ProjectUpdateData | null> {
    try {
      // Get stakeholders to notify
      const stakeholders = await prisma.projectStakeholder.findMany({
        where: {
          projectId: data.projectId,
          ...(data.updateType === 'delay' ? { notifyOnDelay: true } :
             data.updateType === 'milestone' ? { notifyOnMilestone: true } :
             { notifyOnUpdate: true })
        }
      })
      
      // Create the update
      const update = await prisma.projectUpdate.create({
        data: {
          ...data,
          notifiedStakeholders: stakeholders.map(s => s.id)
        }
      })
      
      // Send notifications to stakeholders
      for (const stakeholder of stakeholders) {
        await this.notifyStakeholder(stakeholder, update)
      }
      
      return update as ProjectUpdateData
    } catch (error) {
      logger.error('Failed to create project update:', error)
      return null
    }
  }
  
  /**
   * Get project updates
   */
  static async getProjectUpdates(projectId: string): Promise<ProjectUpdateData[]> {
    try {
      const updates = await prisma.projectUpdate.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      return updates as ProjectUpdateData[]
    } catch (error) {
      logger.error('Failed to fetch project updates:', error)
      return []
    }
  }
  
  /**
   * Calculate project timeline and dependencies
   */
  static async calculateProjectTimeline(projectId: string): Promise<{
    criticalPath: string[]
    totalDuration: number
    expectedCompletion: Date
    risks: Array<{ taskId: string; risk: string; impact: string }>
  }> {
    try {
      const tasks = await this.getProjectTasks(projectId)
      
      // Build dependency graph
      const taskMap = new Map(tasks.map(t => [t.id, t]))
      const visited = new Set<string>()
      const criticalPath: string[] = []
      
      // Find critical path using topological sort
      const findCriticalPath = (taskId: string, path: string[] = []): string[] => {
        if (visited.has(taskId)) return path
        visited.add(taskId)
        
        const task = taskMap.get(taskId)
        if (!task) return path
        
        path.push(taskId)
        
        // Find dependent tasks
        const dependents = tasks.filter(t => t.dependencies.includes(taskId))
        if (dependents.length === 0) return path
        
        // Find longest path through dependents
        let longestPath = path
        for (const dependent of dependents) {
          const newPath = findCriticalPath(dependent.id, [...path])
          if (newPath.length > longestPath.length) {
            longestPath = newPath
          }
        }
        
        return longestPath
      }
      
      // Find tasks with no dependencies (start points)
      const startTasks = tasks.filter(t => t.dependencies.length === 0)
      for (const task of startTasks) {
        const path = findCriticalPath(task.id)
        if (path.length > criticalPath.length) {
          criticalPath.push(...path)
        }
      }
      
      // Calculate total duration
      let totalDuration = 0
      let currentDate = new Date()
      
      for (const taskId of criticalPath) {
        const task = taskMap.get(taskId)
        if (task) {
          const duration = Math.ceil(
            (task.plannedEnd.getTime() - task.plannedStart.getTime()) / (1000 * 60 * 60 * 24)
          )
          totalDuration += duration
          currentDate = new Date(currentDate.getTime() + duration * 24 * 60 * 60 * 1000)
        }
      }
      
      // Identify risks
      const risks: Array<{ taskId: string; risk: string; impact: string }> = []
      
      for (const task of tasks) {
        if (task.riskLevel === 'high') {
          risks.push({
            taskId: task.id,
            risk: task.riskFactors.join(', '),
            impact: 'high'
          })
        }
        
        // Check for resource conflicts
        const concurrentTasks = tasks.filter(t => 
          t.id !== task.id &&
          t.plannedStart <= task.plannedEnd &&
          t.plannedEnd >= task.plannedStart &&
          t.assignedTo.some(a => task.assignedTo.includes(a))
        )
        
        if (concurrentTasks.length > 0) {
          risks.push({
            taskId: task.id,
            risk: 'Resource conflict',
            impact: 'medium'
          })
        }
        
        // Check for delayed dependencies
        if (task.status === 'delayed' && task.dependencies.length > 0) {
          risks.push({
            taskId: task.id,
            risk: 'Delayed dependencies',
            impact: 'high'
          })
        }
      }
      
      return {
        criticalPath,
        totalDuration,
        expectedCompletion: currentDate,
        risks
      }
    } catch (error) {
      logger.error('Failed to calculate project timeline:', error)
      return {
        criticalPath: [],
        totalDuration: 0,
        expectedCompletion: new Date(),
        risks: []
      }
    }
  }
  
  /**
   * Send notification to stakeholder
   */
  private static async notifyStakeholder(
    stakeholder: any,
    update: any
  ): Promise<void> {
    try {
      // Send email notification
      if (stakeholder.preferredContact === 'email' || stakeholder.preferredContact === 'both') {
        await this.sendEmailNotification(stakeholder.email, update)
      }
      
      // Send SMS notification
      if (stakeholder.preferredContact === 'sms' || stakeholder.preferredContact === 'both') {
        if (stakeholder.phone) {
          await this.sendSMSNotification(stakeholder.phone, update)
        }
      }
      
      logger.info(`Notified stakeholder ${stakeholder.name} about project update`)
    } catch (error) {
      logger.error('Failed to notify stakeholder:', error)
    }
  }
  
  /**
   * Send email notification
   */
  private static async sendEmailNotification(email: string, update: any): Promise<void> {
    // This would integrate with your email service
    // For now, just log it
    logger.info(`Email notification sent to ${email}:`, update)
  }
  
  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(phone: string, update: any): Promise<void> {
    // This would integrate with Twilio
    // For now, just log it
    logger.info(`SMS notification sent to ${phone}:`, update)
  }
  
  /**
   * Emit task update event
   */
  private static emitTaskUpdate(event: string, data: any): void {
    // This would emit events for real-time updates
    logger.info(`Task event: ${event}`, data)
  }
}