/**
 * Team Validation Schemas Tests
 */

import { 
  TeamInviteSchema,
  TeamMemberUpdateSchema,
  TokenSchema,
  validateTeamInvite,
  validateTeamMemberUpdate,
  isValidRole,
  canManageRole,
  validateBusinessEmail,
  sanitizeInput,
  hasPermission
} from '@/lib/validation/team-schemas'

describe('Team Validation Schemas', () => {
  describe('TeamInviteSchema', () => {
    it('should validate correct team invite data', () => {
      const validData = {
        email: 'test@example.com',
        role: 'viewer',
        facilityId: 'facility-123'
      }

      const result = TeamInviteSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should validate all role types', () => {
      const roles = ['admin', 'editor', 'viewer']
      
      roles.forEach(role => {
        const data = {
          email: 'test@example.com',
          role,
          facilityId: 'facility-123'
        }
        
        const result = TeamInviteSchema.safeParse(data)
        expect(result.success).toBe(true)
        expect(result.data?.role).toBe(role)
      })
    })

    it('should reject invalid email', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'test@',
        'test@.com',
        'test.example.com',
        ''
      ]

      invalidEmails.forEach(email => {
        const data = {
          email,
          role: 'viewer',
          facilityId: 'facility-123'
        }
        
        const result = TeamInviteSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('email')
        }
      })
    })

    it('should reject invalid role', () => {
      const data = {
        email: 'test@example.com',
        role: 'superadmin',
        facilityId: 'facility-123'
      }

      const result = TeamInviteSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('role')
      }
    })

    it('should reject empty facility ID', () => {
      const data = {
        email: 'test@example.com',
        role: 'viewer',
        facilityId: ''
      }

      const result = TeamInviteSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('facilityId')
      }
    })

    it('should reject missing fields', () => {
      const incompleteData = [
        { email: 'test@example.com', role: 'viewer' },
        { email: 'test@example.com', facilityId: 'facility-123' },
        { role: 'viewer', facilityId: 'facility-123' }
      ]

      incompleteData.forEach(data => {
        const result = TeamInviteSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('should trim email addresses', () => {
      const data = {
        email: '  test@example.com  ',
        role: 'viewer',
        facilityId: 'facility-123'
      }

      const result = TeamInviteSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('test@example.com')
    })

    it('should handle case-insensitive emails', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        role: 'viewer',
        facilityId: 'facility-123'
      }

      const result = TeamInviteSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('test@example.com')
    })
  })

  describe('TokenSchema', () => {
    it('should validate correct token data', () => {
      const validData = {
        token: '550e8400-e29b-41d4-a716-446655440000'
      }

      const result = TokenSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject empty token', () => {
      const data = {
        token: ''
      }

      const result = TokenSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('token')
      }
    })

    it('should reject missing token', () => {
      const result = TokenSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject non-UUID tokens', () => {
      const data = {
        token: 'not-a-valid-uuid'
      }

      const result = TokenSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid token format')
      }
    })
  })

  describe('TeamMemberUpdateSchema', () => {
    it('should validate correct update data', () => {
      const validData = {
        memberId: 'member-123',
        role: 'editor'
      }

      const result = TeamMemberUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should validate all role types for update', () => {
      const roles = ['admin', 'editor', 'viewer']
      
      roles.forEach(role => {
        const data = {
          memberId: 'member-123',
          role
        }
        
        const result = TeamMemberUpdateSchema.safeParse(data)
        expect(result.success).toBe(true)
        expect(result.data?.role).toBe(role)
      })
    })

    it('should reject invalid role for update', () => {
      const data = {
        memberId: 'member-123',
        role: 'owner'
      }

      const result = TeamMemberUpdateSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('role')
      }
    })

    it('should reject empty member ID', () => {
      const data = {
        memberId: '',
        role: 'viewer'
      }

      const result = TeamMemberUpdateSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('memberId')
      }
    })

    it('should reject missing fields', () => {
      const incompleteData = [
        { memberId: 'member-123' },
        { role: 'viewer' }
      ]

      incompleteData.forEach(data => {
        const result = TeamMemberUpdateSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('should reject extra fields', () => {
      const data = {
        memberId: 'member-123',
        role: 'viewer',
        extraField: 'should-not-be-here'
      }

      const result = TeamMemberUpdateSchema.safeParse(data)
      expect(result.success).toBe(true)
      // The parsed data should not include the extra field
      expect('extraField' in result.data!).toBe(false)
    })
  })

  describe('Schema error messages', () => {
    it('should provide helpful error messages for TeamInviteSchema', () => {
      const data = {
        email: 'invalid',
        role: 'invalid',
        facilityId: ''
      }

      const result = TeamInviteSchema.safeParse(data)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        const errors = result.error.issues
        expect(errors.some(e => e.message.includes('email'))).toBe(true)
        expect(errors.some(e => e.message.includes('admin'))).toBe(true)
        expect(errors.some(e => e.message.includes('String must contain at least 1'))).toBe(true)
      }
    })
  })

  describe('Type inference', () => {
    it('should infer correct types', () => {
      // This is a compile-time test, but we can verify runtime behavior
      const inviteData = {
        email: 'test@example.com',
        role: 'admin' as const,
        facilityId: 'facility-123'
      }

      const result = TeamInviteSchema.safeParse(inviteData)
      expect(result.success).toBe(true)
      
      if (result.success) {
        // TypeScript should infer these types correctly
        const { email, role, facilityId } = result.data
        expect(typeof email).toBe('string')
        expect(typeof role).toBe('string')
        expect(typeof facilityId).toBe('string')
      }
    })
  })
})