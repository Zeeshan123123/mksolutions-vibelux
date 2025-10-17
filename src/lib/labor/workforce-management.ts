/**
 * Labor Management System
 * Comprehensive workforce tracking, task optimization, and productivity analytics
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';

export type EmployeeRole = 'grower' | 'technician' | 'supervisor' | 'manager' | 'contractor';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'planting' | 'harvesting' | 'pruning' | 'irrigation' | 'pest_control' | 'maintenance' | 'quality_control' | 'packaging';
export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  
  // Skills and Certifications
  skills: string[];
  certifications: Array<{
    name: string;
    expiryDate: Date;
    issuedBy: string;
  }>;
  
  // Work Information
  department: string;
  supervisor?: string;
  hourlyRate: number;
  overtimeRate: number;
  
  // Availability
  defaultShift: ShiftType;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  
  // Performance
  productivityScore: number;
  qualityScore: number;
  attendanceRate: number;
  
  // Status
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Location
  facilityId: string;
  roomId?: string;
  zoneId?: string;
  plantIds?: string[];
  
  // Assignment
  assignedTo?: string;
  assignedBy: string;
  teamMembers?: string[];
  
  // Timing
  estimatedDuration: number; // minutes
  actualDuration?: number;
  scheduledDate: Date;
  startTime?: Date;
  endTime?: Date;
  dueDate: Date;
  
  // Requirements
  requiredSkills: string[];
  requiredCertifications: string[];
  minimumWorkers: number;
  maximumWorkers: number;
  
  // Instructions
  instructions: string;
  safetyRequirements: string[];
  equipmentNeeded: string[];
  
  // Completion
  completionNotes?: string;
  qualityCheckRequired: boolean;
  qualityCheckBy?: string;
  qualityCheckDate?: Date;
  
  // Metrics
  plantsProcessed?: number;
  yieldCollected?: number;
  issuesFound?: number;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  taskId?: string;
  
  // Time Information
  clockIn: Date;
  clockOut?: Date;
  breakDuration: number; // minutes
  totalHours: number;
  
  // Work Details
  workType: TaskCategory;
  location: string;
  
  // Productivity
  unitsCompleted?: number;
  plantsProcessed?: number;
  
  // Verification
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Payroll
  regularHours: number;
  overtimeHours: number;
  totalPay: number;
  
  // Status
  status: 'active' | 'completed' | 'approved' | 'disputed';
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface LaborSchedule {
  id: string;
  date: Date;
  
  // Shifts
  shifts: Array<{
    shiftType: ShiftType;
    startTime: string;
    endTime: string;
    employeeIds: string[];
    supervisor: string;
  }>;
  
  // Tasks
  scheduledTasks: string[];
  
  // Staffing
  requiredStaff: number;
  scheduledStaff: number;
  
  // Status
  status: 'draft' | 'published' | 'active' | 'completed';
  
  // Tracking
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductivityMetrics {
  employeeId: string;
  period: { startDate: Date; endDate: Date };
  
  // Task Metrics
  tasksCompleted: number;
  tasksOnTime: number;
  averageTaskDuration: number;
  efficiencyRate: number;
  
  // Output Metrics
  plantsProcessed: number;
  yieldHarvested: number;
  qualityScore: number;
  
  // Time Metrics
  totalHours: number;
  productiveHours: number;
  overtimeHours: number;
  
  // Financial Metrics
  laborCost: number;
  revenueGenerated: number;
  costPerUnit: number;
  
  // Comparative Metrics
  performanceVsAverage: number;
  performanceVsTarget: number;
  
  // Recommendations
  strengths: string[];
  improvementAreas: string[];
}

class WorkforceManagementSystem extends EventEmitter {
  private facilityId: string;
  private userId: string;

  constructor(facilityId: string, userId: string) {
    super();
    this.facilityId = facilityId;
    this.userId = userId;
  }

  /**
   * Create new employee
   */
  async createEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    try {
      const employee: Employee = {
        id: this.generateEmployeeId(),
        ...employeeData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveEmployee(employee);

      this.emit('employee-created', employee);
      logger.info('api', `Created employee: ${employee.name}`);
      
      return employee;
    } catch (error) {
      logger.error('api', 'Failed to create employee:', error );
      throw error;
    }
  }

  /**
   * Create work task
   */
  async createTask(taskData: Omit<WorkTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkTask> {
    try {
      const task: WorkTask = {
        id: this.generateTaskId(),
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTask(task);

      // Notify assigned employee
      if (task.assignedTo) {
        await this.notifyEmployee(task.assignedTo, 'task_assigned', task);
      }

      this.emit('task-created', task);
      logger.info('api', `Created task: ${task.title}`);
      
      return task;
    } catch (error) {
      logger.error('api', 'Failed to create task:', error );
      throw error;
    }
  }

  /**
   * Assign task to employee
   */
  async assignTask(taskId: string, employeeId: string): Promise<WorkTask> {
    try {
      const task = await this.getTask(taskId);
      if (!task) throw new Error('Task not found');

      const employee = await this.getEmployee(employeeId);
      if (!employee) throw new Error('Employee not found');

      // Verify employee qualifications
      const qualified = await this.verifyEmployeeQualifications(employee, task);
      if (!qualified) throw new Error('Employee not qualified for this task');

      task.assignedTo = employeeId;
      task.status = 'assigned';
      task.updatedAt = new Date();

      await this.saveTask(task);

      // Update employee schedule
      await this.updateEmployeeSchedule(employeeId, task);

      this.emit('task-assigned', { task, employee });
      logger.info('api', `Assigned task ${taskId} to ${employee.name}`);
      
      return task;
    } catch (error) {
      logger.error('api', 'Failed to assign task:', error );
      throw error;
    }
  }

  /**
   * Clock in/out
   */
  async clockIn(employeeId: string, taskId?: string): Promise<TimeEntry> {
    try {
      // Check for existing active time entry
      const activeEntry = await this.getActiveTimeEntry(employeeId);
      if (activeEntry) throw new Error('Employee already clocked in');

      const timeEntry: TimeEntry = {
        id: this.generateTimeEntryId(),
        employeeId,
        taskId,
        clockIn: new Date(),
        breakDuration: 0,
        totalHours: 0,
        workType: 'maintenance', // Default, will be updated
        location: this.facilityId,
        regularHours: 0,
        overtimeHours: 0,
        totalPay: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTimeEntry(timeEntry);

      // Update task status if applicable
      if (taskId) {
        await this.updateTaskStatus(taskId, 'in_progress');
      }

      this.emit('employee-clocked-in', timeEntry);
      logger.info('api', `Employee ${employeeId} clocked in`);
      
      return timeEntry;
    } catch (error) {
      logger.error('api', 'Failed to clock in:', error );
      throw error;
    }
  }

  async clockOut(employeeId: string): Promise<TimeEntry> {
    try {
      const timeEntry = await this.getActiveTimeEntry(employeeId);
      if (!timeEntry) throw new Error('No active time entry found');

      timeEntry.clockOut = new Date();
      timeEntry.totalHours = (timeEntry.clockOut.getTime() - timeEntry.clockIn.getTime()) / (1000 * 60 * 60) - (timeEntry.breakDuration / 60);
      
      // Calculate pay
      const employee = await this.getEmployee(employeeId);
      if (employee) {
        const regularHours = Math.min(timeEntry.totalHours, 8);
        const overtimeHours = Math.max(0, timeEntry.totalHours - 8);
        
        timeEntry.regularHours = regularHours;
        timeEntry.overtimeHours = overtimeHours;
        timeEntry.totalPay = (regularHours * employee.hourlyRate) + (overtimeHours * employee.overtimeRate);
      }

      timeEntry.status = 'completed';
      timeEntry.updatedAt = new Date();

      await this.saveTimeEntry(timeEntry);

      this.emit('employee-clocked-out', timeEntry);
      logger.info('api', `Employee ${employeeId} clocked out`);
      
      return timeEntry;
    } catch (error) {
      logger.error('api', 'Failed to clock out:', error );
      throw error;
    }
  }

  /**
   * Create labor schedule
   */
  async createSchedule(date: Date, requiredStaff: number): Promise<LaborSchedule> {
    try {
      // Get available employees
      const availableEmployees = await this.getAvailableEmployees(date);
      
      // Get scheduled tasks for the date
      const scheduledTasks = await this.getScheduledTasks(date);
      
      // Auto-generate optimal schedule
      const shifts = this.generateOptimalShifts(availableEmployees, scheduledTasks, requiredStaff);

      const schedule: LaborSchedule = {
        id: this.generateScheduleId(),
        date,
        shifts,
        scheduledTasks: scheduledTasks.map(t => t.id),
        requiredStaff,
        scheduledStaff: shifts.reduce((sum, shift) => sum + shift.employeeIds.length, 0),
        status: 'draft',
        createdBy: this.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSchedule(schedule);

      this.emit('schedule-created', schedule);
      logger.info('api', `Created schedule for ${date.toDateString()}`);
      
      return schedule;
    } catch (error) {
      logger.error('api', 'Failed to create schedule:', error );
      throw error;
    }
  }

  /**
   * Get productivity metrics
   */
  async getProductivityMetrics(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProductivityMetrics> {
    try {
      const employee = await this.getEmployee(employeeId);
      if (!employee) throw new Error('Employee not found');

      // Get completed tasks
      const tasks = await this.getEmployeeTasks(employeeId, startDate, endDate);
      const timeEntries = await this.getEmployeeTimeEntries(employeeId, startDate, endDate);

      // Calculate metrics
      const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
      const tasksOnTime = tasks.filter(t => t.status === 'completed' && t.endTime && t.endTime <= t.dueDate).length;
      const averageTaskDuration = tasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / tasksCompleted || 0;
      
      const totalHours = timeEntries.reduce((sum, te) => sum + te.totalHours, 0);
      const productiveHours = timeEntries.reduce((sum, te) => sum + (te.totalHours - te.breakDuration / 60), 0);
      const overtimeHours = timeEntries.reduce((sum, te) => sum + te.overtimeHours, 0);
      
      const laborCost = timeEntries.reduce((sum, te) => sum + te.totalPay, 0);
      const plantsProcessed = tasks.reduce((sum, t) => sum + (t.plantsProcessed || 0), 0);
      const yieldHarvested = tasks.reduce((sum, t) => sum + (t.yieldCollected || 0), 0);
      
      const efficiencyRate = productiveHours / totalHours * 100 || 0;
      const qualityScore = employee.qualityScore;

      // Generate recommendations
      const strengths = [];
      const improvementAreas = [];
      
      if (efficiencyRate > 85) strengths.push('High efficiency rate');
      if (tasksOnTime / tasksCompleted > 0.9) strengths.push('Excellent on-time completion');
      if (qualityScore > 90) strengths.push('Outstanding quality scores');
      
      if (efficiencyRate < 70) improvementAreas.push('Improve time management');
      if (overtimeHours / totalHours > 0.2) improvementAreas.push('Reduce overtime dependency');
      if (qualityScore < 80) improvementAreas.push('Focus on quality improvement');

      const metrics: ProductivityMetrics = {
        employeeId,
        period: { startDate, endDate },
        tasksCompleted,
        tasksOnTime,
        averageTaskDuration,
        efficiencyRate,
        plantsProcessed,
        yieldHarvested,
        qualityScore,
        totalHours,
        productiveHours,
        overtimeHours,
        laborCost,
        revenueGenerated: yieldHarvested * 50, // Placeholder calculation
        costPerUnit: plantsProcessed > 0 ? laborCost / plantsProcessed : 0,
        performanceVsAverage: 105, // Placeholder
        performanceVsTarget: 98, // Placeholder
        strengths,
        improvementAreas
      };

      return metrics;
    } catch (error) {
      logger.error('api', 'Failed to get productivity metrics:', error );
      throw error;
    }
  }

  /**
   * Get labor analytics dashboard
   */
  async getLaborAnalytics(period: { startDate: Date; endDate: Date }): Promise<{
    totalLaborCost: number;
    totalHours: number;
    averageProductivity: number;
    taskCompletionRate: number;
    overtimePercentage: number;
    topPerformers: Array<{ employee: Employee; score: number }>;
    departmentBreakdown: Array<{ department: string; hours: number; cost: number }>;
    taskCategoryAnalysis: Array<{ category: TaskCategory; count: number; avgDuration: number }>;
  }> {
    try {
      const timeEntries = await this.getTimeEntriesInRange(period.startDate, period.endDate);
      const tasks = await this.getTasksInRange(period.startDate, period.endDate);
      const employees = await this.getAllEmployees();

      const totalLaborCost = timeEntries.reduce((sum, te) => sum + te.totalPay, 0);
      const totalHours = timeEntries.reduce((sum, te) => sum + te.totalHours, 0);
      const overtimeHours = timeEntries.reduce((sum, te) => sum + te.overtimeHours, 0);
      const overtimePercentage = (overtimeHours / totalHours) * 100 || 0;

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const taskCompletionRate = (completedTasks / tasks.length) * 100 || 0;

      // Calculate average productivity
      const totalProductivity = employees.reduce((sum, e) => sum + e.productivityScore, 0);
      const averageProductivity = totalProductivity / employees.length || 0;

      // Get top performers
      const topPerformers = employees
        .sort((a, b) => b.productivityScore - a.productivityScore)
        .slice(0, 5)
        .map(e => ({ employee: e, score: e.productivityScore }));

      // Department breakdown
      const departmentBreakdown = this.calculateDepartmentBreakdown(timeEntries, employees);

      // Task category analysis
      const taskCategoryAnalysis = this.analyzeTaskCategories(tasks);

      return {
        totalLaborCost,
        totalHours,
        averageProductivity,
        taskCompletionRate,
        overtimePercentage,
        topPerformers,
        departmentBreakdown,
        taskCategoryAnalysis
      };
    } catch (error) {
      logger.error('api', 'Failed to get labor analytics:', error );
      throw error;
    }
  }

  // Helper methods
  private async verifyEmployeeQualifications(employee: Employee, task: WorkTask): Promise<boolean> {
    // Check required skills
    const hasRequiredSkills = task.requiredSkills.every(skill => 
      employee.skills.includes(skill)
    );

    // Check required certifications
    const hasRequiredCerts = task.requiredCertifications.every(cert =>
      employee.certifications.some(c => 
        c.name === cert && c.expiryDate > new Date()
      )
    );

    return hasRequiredSkills && hasRequiredCerts;
  }

  private generateOptimalShifts(
    employees: Employee[],
    tasks: WorkTask[],
    requiredStaff: number
  ): LaborSchedule['shifts'] {
    // Simple scheduling algorithm - can be enhanced with more sophisticated optimization
    const shifts: LaborSchedule['shifts'] = [];
    
    const shiftTypes: ShiftType[] = ['morning', 'afternoon', 'evening'];
    const staffPerShift = Math.ceil(requiredStaff / shiftTypes.length);

    for (const shiftType of shiftTypes) {
      const availableForShift = employees.filter(e => 
        e.defaultShift === shiftType || e.defaultShift === 'flexible'
      );

      const selectedEmployees = availableForShift
        .sort((a, b) => b.productivityScore - a.productivityScore)
        .slice(0, staffPerShift)
        .map(e => e.id);

      const supervisor = employees.find(e => 
        e.role === 'supervisor' && selectedEmployees.includes(e.id)
      )?.id || selectedEmployees[0];

      shifts.push({
        shiftType,
        startTime: this.getShiftStartTime(shiftType),
        endTime: this.getShiftEndTime(shiftType),
        employeeIds: selectedEmployees,
        supervisor
      });
    }

    return shifts;
  }

  private getShiftStartTime(shiftType: ShiftType): string {
    const times = {
      morning: '06:00',
      afternoon: '14:00',
      evening: '22:00',
      night: '22:00',
      flexible: '08:00'
    };
    return times[shiftType];
  }

  private getShiftEndTime(shiftType: ShiftType): string {
    const times = {
      morning: '14:00',
      afternoon: '22:00',
      evening: '06:00',
      night: '06:00',
      flexible: '17:00'
    };
    return times[shiftType];
  }

  private calculateDepartmentBreakdown(
    timeEntries: TimeEntry[],
    employees: Employee[]
  ): Array<{ department: string; hours: number; cost: number }> {
    const breakdown: Record<string, { hours: number; cost: number }> = {};

    for (const entry of timeEntries) {
      const employee = employees.find(e => e.id === entry.employeeId);
      if (employee) {
        if (!breakdown[employee.department]) {
          breakdown[employee.department] = { hours: 0, cost: 0 };
        }
        breakdown[employee.department].hours += entry.totalHours;
        breakdown[employee.department].cost += entry.totalPay;
      }
    }

    return Object.entries(breakdown).map(([department, data]) => ({
      department,
      ...data
    }));
  }

  private analyzeTaskCategories(tasks: WorkTask[]): Array<{
    category: TaskCategory;
    count: number;
    avgDuration: number;
  }> {
    const categories: Record<TaskCategory, { count: number; totalDuration: number }> = {} as any;

    for (const task of tasks) {
      if (!categories[task.category]) {
        categories[task.category] = { count: 0, totalDuration: 0 };
      }
      categories[task.category].count++;
      categories[task.category].totalDuration += task.actualDuration || task.estimatedDuration;
    }

    return Object.entries(categories).map(([category, data]) => ({
      category: category as TaskCategory,
      count: data.count,
      avgDuration: data.totalDuration / data.count
    }));
  }

  // Database operations
  private async saveEmployee(employee: Employee): Promise<void> {
    await prisma.employee.upsert({
      where: { id: employee.id },
      create: { ...employee, facilityId: this.facilityId },
      update: employee
    });
  }

  private async getEmployee(employeeId: string): Promise<Employee | null> {
    return await prisma.employee.findUnique({
      where: { id: employeeId }
    });
  }

  private async getAllEmployees(): Promise<Employee[]> {
    return await prisma.employee.findMany({
      where: { facilityId: this.facilityId, isActive: true }
    });
  }

  private async saveTask(task: WorkTask): Promise<void> {
    await prisma.workTask.upsert({
      where: { id: task.id },
      create: task,
      update: task
    });
  }

  private async getTask(taskId: string): Promise<WorkTask | null> {
    return await prisma.workTask.findUnique({
      where: { id: taskId }
    });
  }

  private async saveTimeEntry(timeEntry: TimeEntry): Promise<void> {
    await prisma.timeEntry.upsert({
      where: { id: timeEntry.id },
      create: timeEntry,
      update: timeEntry
    });
  }

  private async getActiveTimeEntry(employeeId: string): Promise<TimeEntry | null> {
    return await prisma.timeEntry.findFirst({
      where: { 
        employeeId,
        status: 'active'
      }
    });
  }

  private async saveSchedule(schedule: LaborSchedule): Promise<void> {
    await prisma.laborSchedule.upsert({
      where: { id: schedule.id },
      create: { ...schedule, facilityId: this.facilityId },
      update: schedule
    });
  }

  private async getAvailableEmployees(date: Date): Promise<Employee[]> {
    const dayOfWeek = date.getDay();
    return await prisma.employee.findMany({
      where: {
        facilityId: this.facilityId,
        isActive: true,
        availability: {
          some: {
            dayOfWeek
          }
        }
      }
    });
  }

  private async getScheduledTasks(date: Date): Promise<WorkTask[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.workTask.findMany({
      where: {
        facilityId: this.facilityId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }

  private async updateEmployeeSchedule(employeeId: string, task: WorkTask): Promise<void> {
    // Update employee's schedule with new task
  }

  private async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await prisma.workTask.update({
      where: { id: taskId },
      data: { status, updatedAt: new Date() }
    });
  }

  private async notifyEmployee(employeeId: string, type: string, data: any): Promise<void> {
    // Send notification to employee
  }

  private async getEmployeeTasks(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkTask[]> {
    return await prisma.workTask.findMany({
      where: {
        assignedTo: employeeId,
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getEmployeeTimeEntries(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeEntry[]> {
    return await prisma.timeEntry.findMany({
      where: {
        employeeId,
        clockIn: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getTimeEntriesInRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return await prisma.timeEntry.findMany({
      where: {
        clockIn: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getTasksInRange(startDate: Date, endDate: Date): Promise<WorkTask[]> {
    return await prisma.workTask.findMany({
      where: {
        facilityId: this.facilityId,
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  // ID generators
  private generateEmployeeId(): string {
    return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTimeEntryId(): string {
    return `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { WorkforceManagementSystem };
export default WorkforceManagementSystem;