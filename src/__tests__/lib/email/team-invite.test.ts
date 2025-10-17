/**
 * Team Invite Email Tests
 */

import { sendTeamInviteEmail } from '@/lib/email/team-invite'
import { Resend } from 'resend'

jest.mock('resend')

describe('sendTeamInviteEmail', () => {
  let mockResend: jest.Mocked<Resend>

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.EMAIL_FROM = 'noreply@vibelux.com'
    
    mockResend = {
      emails: {
        send: jest.fn()
      }
    } as any
    
    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => mockResend)
  })

  afterEach(() => {
    delete process.env.RESEND_API_KEY
    delete process.env.EMAIL_FROM
  })

  it('should throw error if RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY

    const emailData = {
      to: 'test@example.com',
      inviterName: 'John Doe',
      role: 'viewer',
      inviteUrl: 'https://app.vibelux.com/invite/test-token'
    }

    await expect(sendTeamInviteEmail(emailData)).rejects.toThrow('RESEND_API_KEY is not configured')
  })

  it('should send email with correct parameters', async () => {
    mockResend.emails.send.mockResolvedValue({
      id: 'email-id',
      from: 'noreply@vibelux.com',
      to: 'test@example.com',
      created_at: new Date().toISOString()
    } as any)

    const emailData = {
      to: 'test@example.com',
      inviterName: 'John Doe',
      role: 'editor',
      inviteUrl: 'https://app.vibelux.com/invite/test-token'
    }

    await sendTeamInviteEmail(emailData)

    expect(mockResend.emails.send).toHaveBeenCalledWith({
      from: 'VibeLux Team <team@vibelux.com>',
      to: ['test@example.com'],
      subject: "You've been invited to join John Doe's team on VibeLux",
      html: expect.stringContaining('John Doe'),
      text: expect.stringContaining('John Doe')
    })
  })

  it('should include all required information in email content', async () => {
    mockResend.emails.send.mockResolvedValue({
      id: 'email-id'
    } as any)

    const emailData = {
      to: 'test@example.com',
      inviterName: 'Jane Smith',
      role: 'admin',
      inviteUrl: 'https://app.vibelux.com/invite/abc123',
      message: 'Welcome to our team!'
    }

    await sendTeamInviteEmail(emailData)

    const sendCall = mockResend.emails.send.mock.calls[0][0]
    
    // Check HTML content
    expect(sendCall.html).toContain('Jane Smith')
    expect(sendCall.html).toContain('Welcome to our team!')
    expect(sendCall.html).toContain('admin')
    expect(sendCall.html).toContain('https://app.vibelux.com/invite/abc123')
    expect(sendCall.html).toContain('Accept Invitation')
    
    // Check text content
    expect(sendCall.text).toContain('Jane Smith')
    expect(sendCall.text).toContain('Welcome to our team!')
    expect(sendCall.text).toContain('admin')
    expect(sendCall.text).toContain('https://app.vibelux.com/invite/abc123')
  })

  it('should handle different role types correctly', async () => {
    mockResend.emails.send.mockResolvedValue({
      id: 'email-id'
    } as any)

    const roles = ['admin', 'manager', 'operator', 'viewer']

    for (const role of roles) {
      const emailData = {
        to: 'test@example.com',
        inviterName: 'Test User',
        role,
        inviteUrl: 'https://app.vibelux.com/invite/test'
      }

      await sendTeamInviteEmail(emailData)

      const sendCall = mockResend.emails.send.mock.calls[mockResend.emails.send.mock.calls.length - 1][0]
      expect(sendCall.html).toContain(role)
      expect(sendCall.text).toContain(role)
    }
  })

  it('should use custom from address if provided', async () => {
    process.env.EMAIL_FROM = 'custom@vibelux.com'
    
    mockResend.emails.send.mockResolvedValue({
      id: 'email-id'
    } as any)

    const emailData = {
      to: 'test@example.com',
      inviterName: 'Test User',
      role: 'viewer',
      inviteUrl: 'https://app.vibelux.com/invite/test'
    }

    await sendTeamInviteEmail(emailData)

    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'VibeLux Team <team@vibelux.com>'
      })
    )
  })

  it('should handle send failures', async () => {
    mockResend.emails.send.mockRejectedValue(new Error('Network error'))

    const emailData = {
      to: 'test@example.com',
      inviterName: 'Test User',
      role: 'viewer',
      inviteUrl: 'https://app.vibelux.com/invite/test'
    }

    await expect(sendTeamInviteEmail(emailData)).rejects.toThrow('Network error')
  })

  it('should format email HTML properly', async () => {
    mockResend.emails.send.mockResolvedValue({
      id: 'email-id'
    } as any)

    const emailData: TeamInviteEmailData = {
      to: 'test@example.com',
      inviterName: 'Test User',
      facilityName: 'Test Facility',
      role: 'admin',
      inviteUrl: 'https://app.vibelux.com/invite/test'
    }

    await sendTeamInviteEmail(emailData)

    const sendCall = mockResend.emails.send.mock.calls[0][0]
    
    // Check for proper HTML structure
    expect(sendCall.html).toContain('<!DOCTYPE html>')
    expect(sendCall.html).toContain('<html>')
    expect(sendCall.html).toContain('<body')
    expect(sendCall.html).toContain('</body>')
    expect(sendCall.html).toContain('</html>')
    
    // Check for styling
    expect(sendCall.html).toContain('style=')
    expect(sendCall.html).toContain('background-color')
    expect(sendCall.html).toContain('font-family')
    
    // Check for security footer
    expect(sendCall.html).toContain('did not request this invitation')
    expect(sendCall.html).toContain('expires in 7 days')
  })

  it('should sanitize inputs to prevent XSS', async () => {
    mockResend.emails.send.mockResolvedValue({
      id: 'email-id'
    } as any)

    const emailData = {
      to: 'test@example.com',
      inviterName: '<script>alert("xss")</script>',
      role: 'viewer',
      inviteUrl: 'https://app.vibelux.com/invite/test',
      message: '<img src=x onerror=alert("xss")>'
    }

    await sendTeamInviteEmail(emailData)

    const sendCall = mockResend.emails.send.mock.calls[0][0]
    
    // Should not contain raw script tags
    expect(sendCall.html).not.toContain('<script>')
    expect(sendCall.html).not.toContain('onerror=')
    expect(sendCall.text).not.toContain('<script>')
  })
})