import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateCSRFToken,
  verifyCSRFToken,
  getCSRFTokenFromRequest,
  isExcludedPath,
  requiresCSRFProtection,
  createCSRFErrorResponse,
} from '@/lib/csrf';
import { csrfProtection } from '@/middleware/csrf';

// Mock NextAuth secret
process.env.CSRF_SECRET = 'test-secret-key';

describe('CSRF Protection', () => {
  let mockRequest: NextRequest;
  let sessionId: string;

  beforeEach(() => {
    sessionId = 'test-session-123';
    mockRequest = {
      method: 'POST',
      nextUrl: { pathname: '/api/test' },
      headers: new Headers(),
    } as NextRequest;
  });

  describe('generateCSRFToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateCSRFToken(sessionId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens for different sessions', async () => {
      const token1 = await generateCSRFToken('session1');
      const token2 = await generateCSRFToken('session2');
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyCSRFToken', () => {
    it('should verify a valid token', async () => {
      const token = await generateCSRFToken(sessionId);
      const isValid = await verifyCSRFToken(token, sessionId);
      expect(isValid).toBe(true);
    });

    it('should reject token with wrong session ID', async () => {
      const token = await generateCSRFToken(sessionId);
      const isValid = await verifyCSRFToken(token, 'wrong-session');
      expect(isValid).toBe(false);
    });

    it('should reject invalid token', async () => {
      const isValid = await verifyCSRFToken('invalid-token', sessionId);
      expect(isValid).toBe(false);
    });
  });

  describe('getCSRFTokenFromRequest', () => {
    it('should extract token from X-CSRF-Token header', () => {
      const token = 'test-token-123';
      mockRequest.headers.set('X-CSRF-Token', token);
      
      const extractedToken = getCSRFTokenFromRequest(mockRequest);
      expect(extractedToken).toBe(token);
    });

    it('should return null if no token is found', () => {
      const extractedToken = getCSRFTokenFromRequest(mockRequest);
      expect(extractedToken).toBeNull();
    });
  });

  describe('isExcludedPath', () => {
    it('should exclude webhook paths', () => {
      expect(isExcludedPath('/api/webhooks/stripe')).toBe(true);
      expect(isExcludedPath('/api/webhooks/github')).toBe(true);
    });

    it('should exclude health check paths', () => {
      expect(isExcludedPath('/api/health')).toBe(true);
    });

    it('should not exclude regular API paths', () => {
      expect(isExcludedPath('/api/users')).toBe(false);
      expect(isExcludedPath('/api/v1/sensors')).toBe(false);
    });
  });

  describe('requiresCSRFProtection', () => {
    it('should require protection for state-changing methods', () => {
      expect(requiresCSRFProtection('POST')).toBe(true);
      expect(requiresCSRFProtection('PUT')).toBe(true);
      expect(requiresCSRFProtection('DELETE')).toBe(true);
      expect(requiresCSRFProtection('PATCH')).toBe(true);
    });

    it('should not require protection for safe methods', () => {
      expect(requiresCSRFProtection('GET')).toBe(false);
      expect(requiresCSRFProtection('HEAD')).toBe(false);
      expect(requiresCSRFProtection('OPTIONS')).toBe(false);
    });
  });

  describe('createCSRFErrorResponse', () => {
    it('should create proper error response', () => {
      const response = createCSRFErrorResponse('Test error');
      expect(response.status).toBe(403);
      expect(response.headers.get('X-CSRF-Error')).toBe('true');
    });
  });

  describe('csrfProtection middleware', () => {
    it('should allow requests to excluded paths', async () => {
      const webhookRequest = {
        method: 'POST',
        nextUrl: { pathname: '/api/webhooks/stripe' },
        headers: new Headers(),
      } as NextRequest;

      const response = await csrfProtection(webhookRequest);
      expect(response).toBeNull();
    });

    it('should allow safe methods without token', async () => {
      const getRequest = {
        method: 'GET',
        nextUrl: { pathname: '/api/users' },
        headers: new Headers(),
      } as NextRequest;

      const response = await csrfProtection(getRequest);
      expect(response).toBeNull();
    });

    it('should reject POST requests without token', async () => {
      // Mock getSessionId to return a session
      jest.mock('@/lib/csrf', () => ({
        ...jest.requireActual('@/lib/csrf'),
        getSessionId: jest.fn().mockResolvedValue('test-session'),
      }));

      const response = await csrfProtection(mockRequest);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(403);
    });
  });
});

describe('CSRF Integration Tests', () => {
  it('should complete full token lifecycle', async () => {
    const sessionId = 'integration-test-session';
    
    // Generate token
    const token = await generateCSRFToken(sessionId);
    expect(token).toBeDefined();
    
    // Verify token
    const isValid = await verifyCSRFToken(token, sessionId);
    expect(isValid).toBe(true);
    
    // Create request with token
    const request = {
      method: 'POST',
      nextUrl: { pathname: '/api/test' },
      headers: new Headers([['X-CSRF-Token', token]]),
    } as NextRequest;
    
    // Extract token from request
    const extractedToken = getCSRFTokenFromRequest(request);
    expect(extractedToken).toBe(token);
    
    // Verify extracted token
    const extractedIsValid = await verifyCSRFToken(extractedToken!, sessionId);
    expect(extractedIsValid).toBe(true);
  });
});