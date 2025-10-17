/**
 * Document Version Control System
 * Handles check-in/checkout, versioning, and collaborative editing for SOP documentation
 */

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  title: string;
  content: string;
  checksum: string;
  authorId: string;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  changeDescription: string;
  changeType: 'major' | 'minor' | 'patch';
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';
  parentVersionId?: string;
  approvedBy?: string;
  approvedAt?: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export interface DocumentCheckout {
  id: string;
  documentId: string;
  versionId: string;
  userId: string;
  userEmail: string;
  checkedOutAt: Date;
  expiresAt: Date;
  lockType: 'exclusive' | 'shared';
  purpose: 'edit' | 'review' | 'translate';
  isActive: boolean;
  workingContent?: string;
  lastSavedAt?: Date;
}

export interface ChangeRequest {
  id: string;
  documentId: string;
  requesterId: string;
  requesterEmail: string;
  title: string;
  description: string;
  proposedChanges: string;
  currentVersionId: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reviewers: string[];
  approvals: { userId: string; approvedAt: Date; comments?: string }[];
  rejections: { userId: string; rejectedAt: Date; reason: string }[];
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  mergedBy?: string;
}

export class DocumentVersionControl {
  
  /**
   * Check out a document for editing
   */
  static async checkoutDocument(params: {
    documentId: string;
    userId: string;
    userEmail: string;
    lockType: 'exclusive' | 'shared';
    purpose: 'edit' | 'review' | 'translate';
    durationHours?: number;
  }): Promise<{ success: boolean; checkout?: DocumentCheckout; error?: string }> {
    try {
      const { documentId, userId, userEmail, lockType, purpose, durationHours = 2 } = params;

      // Check if document is already checked out exclusively
      const existingCheckouts = await this.getActiveCheckouts(documentId);
      const exclusiveCheckout = existingCheckouts.find(c => c.lockType === 'exclusive');
      
      if (exclusiveCheckout && exclusiveCheckout.userId !== userId) {
        return {
          success: false,
          error: `Document is exclusively checked out by ${exclusiveCheckout.userEmail} until ${exclusiveCheckout.expiresAt.toLocaleString()}`
        };
      }

      // Check if requesting exclusive lock when others have shared locks
      if (lockType === 'exclusive' && existingCheckouts.length > 0) {
        const sharedUsers = existingCheckouts.map(c => c.userEmail).join(', ');
        return {
          success: false,
          error: `Cannot get exclusive lock. Document has shared checkouts by: ${sharedUsers}`
        };
      }

      // Create checkout record
      const checkout: DocumentCheckout = {
        id: `checkout_${Date.now()}_${userId}`,
        documentId,
        versionId: await this.getLatestVersionId(documentId),
        userId,
        userEmail,
        checkedOutAt: new Date(),
        expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000),
        lockType,
        purpose,
        isActive: true
      };

      // Store checkout record
      await this.storeCheckout(checkout);

      // Log checkout activity
      await this.logDocumentActivity({
        type: 'CHECKOUT',
        documentId,
        userId,
        userEmail,
        details: { lockType, purpose, expiresAt: checkout.expiresAt },
        timestamp: new Date()
      });

      return { success: true, checkout };

    } catch (error) {
      console.error('Failed to checkout document:', error);
      return { success: false, error: 'Failed to checkout document' };
    }
  }

  /**
   * Check in a document with changes
   */
  static async checkinDocument(params: {
    checkoutId: string;
    content: string;
    changeDescription: string;
    changeType: 'major' | 'minor' | 'patch';
    requestReview?: boolean;
    reviewers?: string[];
  }): Promise<{ success: boolean; version?: DocumentVersion; error?: string }> {
    try {
      const { checkoutId, content, changeDescription, changeType, requestReview = false, reviewers = [] } = params;

      // Get checkout record
      const checkout = await this.getCheckout(checkoutId);
      if (!checkout || !checkout.isActive) {
        return { success: false, error: 'Invalid or expired checkout' };
      }

      // Check if checkout has expired
      if (checkout.expiresAt < new Date()) {
        await this.expireCheckout(checkoutId);
        return { success: false, error: 'Checkout has expired' };
      }

      // Get current version
      const currentVersion = await this.getVersion(checkout.versionId);
      if (!currentVersion) {
        return { success: false, error: 'Current version not found' };
      }

      // Calculate content checksum
      const checksum = await this.calculateChecksum(content);

      // Check if content actually changed
      if (checksum === currentVersion.checksum) {
        // No changes, just release checkout
        await this.releaseCheckout(checkoutId);
        return { success: true, version: currentVersion };
      }

      // Generate new version number
      const newVersion = this.generateVersionNumber(currentVersion.version, changeType);

      // Create new version
      const version: DocumentVersion = {
        id: `version_${Date.now()}_${checkout.userId}`,
        documentId: checkout.documentId,
        version: newVersion,
        title: currentVersion.title,
        content,
        checksum,
        authorId: checkout.userId,
        authorEmail: checkout.userEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
        changeDescription,
        changeType,
        status: requestReview ? 'pending_review' : 'draft',
        parentVersionId: currentVersion.id,
        tags: currentVersion.tags,
        metadata: {
          ...currentVersion.metadata,
          checkedOutAt: checkout.checkedOutAt,
          checkedInAt: new Date()
        }
      };

      // Store new version
      await this.storeVersion(version);

      // Create change request if review is requested
      if (requestReview && reviewers.length > 0) {
        await this.createChangeRequest({
          documentId: checkout.documentId,
          requesterId: checkout.userId,
          requesterEmail: checkout.userEmail,
          title: `Version ${newVersion}: ${changeDescription}`,
          description: changeDescription,
          proposedChanges: content,
          currentVersionId: version.id,
          reviewers,
          priority: changeType === 'major' ? 'high' : 'medium'
        });
      }

      // Release checkout
      await this.releaseCheckout(checkoutId);

      // Log checkin activity
      await this.logDocumentActivity({
        type: 'CHECKIN',
        documentId: checkout.documentId,
        userId: checkout.userId,
        userEmail: checkout.userEmail,
        details: { 
          newVersion, 
          changeType, 
          changeDescription,
          requestReview,
          reviewersCount: reviewers.length 
        },
        timestamp: new Date()
      });

      return { success: true, version };

    } catch (error) {
      console.error('Failed to checkin document:', error);
      return { success: false, error: 'Failed to checkin document' };
    }
  }

  /**
   * Get document change history
   */
  static async getDocumentHistory(
    documentId: string,
    limit: number = 50
  ): Promise<DocumentVersion[]> {
    // Implementation would fetch from database
    return [];
  }

  /**
   * Compare two document versions
   */
  static async compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<{
    version1: DocumentVersion;
    version2: DocumentVersion;
    changes: {
      additions: string[];
      deletions: string[];
      modifications: string[];
    };
  }> {
    const version1 = await this.getVersion(versionId1);
    const version2 = await this.getVersion(versionId2);

    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }

    // Simple line-by-line comparison (in production, use a proper diff library)
    const lines1 = version1.content.split('\n');
    const lines2 = version2.content.split('\n');

    const changes = {
      additions: lines2.filter(line => !lines1.includes(line)),
      deletions: lines1.filter(line => !lines2.includes(line)),
      modifications: [] // Would need more sophisticated diff algorithm
    };

    return { version1, version2, changes };
  }

  /**
   * Approve a change request
   */
  static async approveChangeRequest(
    requestId: string,
    approverId: string,
    approverEmail: string,
    comments?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const request = await this.getChangeRequest(requestId);
      if (!request) {
        return { success: false, error: 'Change request not found' };
      }

      if (request.status !== 'pending') {
        return { success: false, error: `Change request is ${request.status}` };
      }

      // Add approval
      request.approvals.push({
        userId: approverId,
        approvedAt: new Date(),
        comments
      });

      // Check if all required approvals are received
      const requiredApprovals = request.reviewers.length;
      const receivedApprovals = request.approvals.length;

      if (receivedApprovals >= requiredApprovals) {
        request.status = 'approved';
        
        // Auto-merge if all approvals received
        await this.mergeChangeRequest(requestId, approverId);
      }

      await this.updateChangeRequest(request);

      return { success: true };

    } catch (error) {
      console.error('Failed to approve change request:', error);
      return { success: false, error: 'Failed to approve change request' };
    }
  }

  /**
   * Get active checkouts for a document
   */
  static async getActiveCheckouts(documentId: string): Promise<DocumentCheckout[]> {
    // Implementation would query database for active checkouts
    // For now, return empty array
    return [];
  }

  /**
   * Release/unlock a document checkout
   */
  static async releaseCheckout(checkoutId: string): Promise<void> {
    const checkout = await this.getCheckout(checkoutId);
    if (checkout) {
      checkout.isActive = false;
      await this.updateCheckout(checkout);
      
      await this.logDocumentActivity({
        type: 'CHECKOUT_RELEASED',
        documentId: checkout.documentId,
        userId: checkout.userId,
        userEmail: checkout.userEmail,
        details: { checkoutId, releasedAt: new Date() },
        timestamp: new Date()
      });
    }
  }

  /**
   * Auto-expire old checkouts
   */
  static async expireOldCheckouts(): Promise<void> {
    const now = new Date();
    // Implementation would find and expire checkouts past their expiration time
    console.log('Checking for expired checkouts at:', now);
  }

  // Private helper methods
  private static async getLatestVersionId(documentId: string): Promise<string> {
    // Implementation would get the latest version ID from database
    return `version_latest_${documentId}`;
  }

  private static async storeCheckout(checkout: DocumentCheckout): Promise<void> {
    // Implementation would store checkout in database
    console.log('Storing checkout:', checkout.id);
  }

  private static async getCheckout(checkoutId: string): Promise<DocumentCheckout | null> {
    // Implementation would fetch checkout from database
    return null;
  }

  private static async updateCheckout(checkout: DocumentCheckout): Promise<void> {
    // Implementation would update checkout in database
    console.log('Updating checkout:', checkout.id);
  }

  private static async expireCheckout(checkoutId: string): Promise<void> {
    const checkout = await this.getCheckout(checkoutId);
    if (checkout) {
      checkout.isActive = false;
      await this.updateCheckout(checkout);
    }
  }

  private static async storeVersion(version: DocumentVersion): Promise<void> {
    // Implementation would store version in database
    console.log('Storing version:', version.id);
  }

  private static async getVersion(versionId: string): Promise<DocumentVersion | null> {
    // Implementation would fetch version from database
    return null;
  }

  private static async calculateChecksum(content: string): Promise<string> {
    // Simple checksum - in production, use crypto.subtle
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private static generateVersionNumber(currentVersion: string, changeType: 'major' | 'minor' | 'patch'): string {
    const parts = currentVersion.split('.').map(Number);
    const [major = 1, minor = 0, patch = 0] = parts;

    switch (changeType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  private static async createChangeRequest(params: Partial<ChangeRequest>): Promise<void> {
    // Implementation would create change request in database
    console.log('Creating change request for document:', params.documentId);
  }

  private static async getChangeRequest(requestId: string): Promise<ChangeRequest | null> {
    // Implementation would fetch change request from database
    return null;
  }

  private static async updateChangeRequest(request: ChangeRequest): Promise<void> {
    // Implementation would update change request in database
    console.log('Updating change request:', request.id);
  }

  private static async mergeChangeRequest(requestId: string, mergerId: string): Promise<void> {
    // Implementation would merge the approved changes
    console.log('Merging change request:', requestId, 'by:', mergerId);
  }

  private static async logDocumentActivity(activity: {
    type: string;
    documentId: string;
    userId: string;
    userEmail: string;
    details: any;
    timestamp: Date;
  }): Promise<void> {
    console.log('DOCUMENT_ACTIVITY:', activity);
  }
}