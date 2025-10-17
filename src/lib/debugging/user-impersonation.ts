// User Session Replay and Impersonation System
import { prisma } from '@/lib/prisma';
import { errorTracker } from './error-tracker';

export interface UserSession {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  actions: SessionAction[];
  calculations: SessionCalculation[];
  errors: SessionError[];
  metadata: SessionMetadata;
}

export interface SessionAction {
  id: string;
  timestamp: number;
  type: string;
  payload: any;
  elementId?: string;
  coordinates?: { x: number; y: number };
  screenshot?: string; // Base64 encoded screenshot
}

export interface SessionCalculation {
  id: string;
  timestamp: number;
  step: string;
  input: any;
  output: any;
  processingTime: number;
  warnings?: string[];
  errors?: string[];
}

export interface SessionError {
  id: string;
  timestamp: number;
  type: string;
  error: any;
  severity: string;
  context: any;
}

export interface SessionMetadata {
  userAgent: string;
  screenResolution: string;
  windowSize: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export class UserImpersonationService {
  private static instance: UserImpersonationService;
  private currentSession: UserSession | null = null;
  private isRecording = false;
  private screenshotQueue: string[] = [];

  private constructor() {}

  static getInstance(): UserImpersonationService {
    if (!this.instance) {
      this.instance = new UserImpersonationService();
    }
    return this.instance;
  }

  // Start recording a user session
  async startRecording(userId: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      userId,
      sessionId,
      startTime: new Date(),
      actions: [],
      calculations: [],
      errors: [],
      metadata: await this.gatherSessionMetadata()
    };

    this.isRecording = true;
    this.setupEventListeners();
    
    logger.info('api', '🎬 Started recording user session:', { data: sessionId });
    return sessionId;
  }

  // Stop recording and save session
  async stopRecording(): Promise<void> {
    if (!this.currentSession || !this.isRecording) return;

    this.currentSession.endTime = new Date();
    this.isRecording = false;
    
    // Save session to database
    await this.saveSession(this.currentSession);
    
    logger.info('api', '⏹️ Stopped recording user session:', { data: this.currentSession.sessionId });
    this.currentSession = null;
  }

  // Record user action
  recordAction(type: string, payload: any, elementId?: string, coordinates?: { x: number; y: number }) {
    if (!this.isRecording || !this.currentSession) return;

    const action: SessionAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      payload,
      elementId,
      coordinates
    };

    // Take screenshot for important actions
    if (this.shouldTakeScreenshot(type)) {
      this.captureScreenshot().then(screenshot => {
        action.screenshot = screenshot;
      });
    }

    this.currentSession.actions.push(action);
    
    // Keep only recent actions in memory
    if (this.currentSession.actions.length > 1000) {
      this.currentSession.actions.shift();
    }
  }

  // Record calculation
  recordCalculation(step: string, input: any, output: any, processingTime: number, warnings?: string[], errors?: string[]) {
    if (!this.isRecording || !this.currentSession) return;

    const calculation: SessionCalculation = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      step,
      input,
      output,
      processingTime,
      warnings,
      errors
    };

    this.currentSession.calculations.push(calculation);
  }

  // Record error
  recordError(type: string, error: any, severity: string, context: any) {
    if (!this.isRecording || !this.currentSession) return;

    const sessionError: SessionError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      error,
      severity,
      context
    };

    this.currentSession.errors.push(sessionError);
  }

  // Setup event listeners for automatic recording
  private setupEventListeners() {
    // Mouse events
    document.addEventListener('click', (e) => {
      this.recordAction('click', {
        target: this.getElementSelector(e.target as Element),
        button: e.button
      }, this.getElementId(e.target as Element), { x: e.clientX, y: e.clientY });
    });

    document.addEventListener('dblclick', (e) => {
      this.recordAction('dblclick', {
        target: this.getElementSelector(e.target as Element)
      }, this.getElementId(e.target as Element), { x: e.clientX, y: e.clientY });
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.recordAction('keydown', {
        key: e.key,
        code: e.code,
        target: this.getElementSelector(e.target as Element)
      }, this.getElementId(e.target as Element));
    });

    // Form events
    document.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.recordAction('change', {
        target: this.getElementSelector(target),
        value: target.type === 'password' ? '[REDACTED]' : target.value,
        type: target.type
      }, this.getElementId(target));
    });

    // Scroll events
    window.addEventListener('scroll', () => {
      this.recordAction('scroll', {
        scrollX: window.scrollX,
        scrollY: window.scrollY
      });
    });

    // Resize events
    window.addEventListener('resize', () => {
      this.recordAction('resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    });

    // Focus events
    document.addEventListener('focusin', (e) => {
      this.recordAction('focus', {
        target: this.getElementSelector(e.target as Element)
      }, this.getElementId(e.target as Element));
    });
  }

  // Capture screenshot
  private async captureScreenshot(): Promise<string> {
    try {
      // Use html2canvas or similar library
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // For now, return a placeholder
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } catch (error) {
      logger.error('api', 'Failed to capture screenshot:', error );
      return '';
    }
  }

  // Determine if screenshot should be taken
  private shouldTakeScreenshot(actionType: string): boolean {
    const screenshotActions = [
      'error',
      'fixture_placement_failed',
      'calculation_error',
      'page_load',
      'navigation'
    ];
    return screenshotActions.includes(actionType);
  }

  // Get element selector
  private getElementSelector(element: Element): string {
    if (!element) return '';
    
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ').join('.')}`;
    
    const tagName = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      return `${this.getElementSelector(parent)} > ${tagName}:nth-child(${index + 1})`;
    }
    
    return tagName;
  }

  // Get element ID
  private getElementId(element: Element): string | undefined {
    return element?.id || undefined;
  }

  // Gather session metadata
  private async gatherSessionMetadata(): Promise<SessionMetadata> {
    const userAgent = navigator.userAgent;
    
    return {
      userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
      location: await this.getLocation()
    };
  }

  // Detect device type
  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Detect browser
  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Detect OS
  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Get location (with user permission)
  private async getLocation(): Promise<{ country?: string; region?: string; city?: string }> {
    try {
      // Use IP-based geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        region: data.region,
        city: data.city
      };
    } catch {
      return {};
    }
  }

  // Save session to database
  private async saveSession(session: UserSession): Promise<void> {
    try {
      await fetch('/api/debug/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(session)
      });
    } catch (error) {
      logger.error('api', 'Failed to save session:', error );
    }
  }

  // Replay session for debugging
  async replaySession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/debug/sessions/${sessionId}`);
      const session: UserSession = await response.json();
      
      logger.info('api', '🎬 Replaying session:', { data: sessionId });
      logger.info('api', 'User:', { data: session.userId });
      logger.info('api', 'Duration:', { data: session.endTime ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime() : 'ongoing' });
      logger.info('api', 'Actions:', { data: session.actions.length });
      logger.info('api', 'Calculations:', { data: session.calculations.length });
      logger.info('api', 'Errors:', { data: session.errors.length  });
      
      // Replay actions with timing
      for (const action of session.actions) {
        logger.info('api', `Action: ${action.type}`, { data: action.payload });
        // Add visual indicators or actual replay logic here
      }
    } catch (error) {
      logger.error('api', 'Failed to replay session:', error );
    }
  }

  // Impersonate user for debugging
  async impersonateUser(userId: string, adminUserId: string): Promise<string> {
    // Verify admin permissions
    const isAdmin = await this.verifyAdminPermissions(adminUserId);
    if (!isAdmin) {
      throw new Error('Insufficient permissions for user impersonation');
    }

    // Create impersonation session
    const impersonationToken = `impersonate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the impersonation for audit trail
    await this.logImpersonation(adminUserId, userId, impersonationToken);
    
    logger.info('api', `👤 Admin ${adminUserId} impersonating user ${userId}`);
    return impersonationToken;
  }

  // Verify admin permissions
  private async verifyAdminPermissions(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/verify-permissions?userId=${userId}`);
      const data = await response.json();
      return data.isAdmin;
    } catch {
      return false;
    }
  }

  // Log impersonation for audit
  private async logImpersonation(adminUserId: string, targetUserId: string, token: string): Promise<void> {
    try {
      await fetch('/api/admin/impersonation-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminUserId,
          targetUserId,
          token,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      logger.error('api', 'Failed to log impersonation:', error );
    }
  }
}

// Export singleton instance
export const userImpersonation = UserImpersonationService.getInstance();