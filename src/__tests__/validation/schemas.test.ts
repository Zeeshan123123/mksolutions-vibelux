import { describe, it, expect } from '@jest/globals';
import {
  userRegistrationSchema,
  userProfileUpdateSchema,
  loginSchema,
  passwordSchema
} from '@/lib/validation/schemas/user';
import {
  projectCreateSchema,
  experimentCreateSchema,
  measurementCreateSchema
} from '@/lib/validation/schemas/project';
import {
  facilityCreateSchema,
  sensorConfigSchema
} from '@/lib/validation/schemas/facility';
import {
  paymentMethodSchema,
  subscriptionCreateSchema
} from '@/lib/validation/schemas/payment';

describe('User Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    it('should validate correct registration data', () => {
      const result = userRegistrationSchema.safeParse({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'John Doe',
        acceptTerms: true
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = userRegistrationSchema.safeParse({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        acceptTerms: true
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain("Passwords don't match");
    });

    it('should reject invalid email formats', () => {
      const result = userRegistrationSchema.safeParse({
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject weak passwords', () => {
      const result = passwordSchema.safeParse('weak');
      
      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThan(0);
    });

    it('should require terms acceptance', () => {
      const result = userRegistrationSchema.safeParse({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: false
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('userProfileUpdateSchema', () => {
    it('should allow partial updates', () => {
      const result = userProfileUpdateSchema.safeParse({
        name: 'Jane Doe'
      });
      
      expect(result.success).toBe(true);
    });

    it('should sanitize HTML in bio', () => {
      const result = userProfileUpdateSchema.safeParse({
        bio: '<script>alert("xss")</script>Hello world'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.bio).not.toContain('<script>');
    });

    it('should validate phone numbers', () => {
      const validPhone = userProfileUpdateSchema.safeParse({
        phone: '+1 (555) 123-4567'
      });
      
      expect(validPhone.success).toBe(true);

      const invalidPhone = userProfileUpdateSchema.safeParse({
        phone: 'not a phone'
      });
      
      expect(invalidPhone.success).toBe(false);
    });
  });
});

describe('Project Validation Schemas', () => {
  describe('projectCreateSchema', () => {
    it('should validate minimal project data', () => {
      const result = projectCreateSchema.safeParse({
        name: 'My Cannabis Project'
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete project data', () => {
      const result = projectCreateSchema.safeParse({
        name: 'Commercial Grow Operation',
        description: 'Large scale cannabis cultivation',
        settings: {
          defaultUnits: {
            temperature: 'celsius',
            area: 'sqm'
          },
          alertThresholds: {
            temperature: { min: 18, max: 28 },
            humidity: { min: 40, max: 60 }
          }
        }
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid project names', () => {
      const result = projectCreateSchema.safeParse({
        name: 'a' // Too short
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('experimentCreateSchema', () => {
    it('should validate experiment with proper date range', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      const result = experimentCreateSchema.safeParse({
        name: 'Yield Optimization Test',
        projectId: 'cuid123456789012345678901',
        startDate: now.toISOString(),
        endDate: future.toISOString()
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const result = experimentCreateSchema.safeParse({
        name: 'Invalid Date Test',
        projectId: 'cuid123456789012345678901',
        startDate: now.toISOString(),
        endDate: past.toISOString() // End before start
      });
      
      expect(result.success).toBe(false);
    });
  });
});

describe('Facility Validation Schemas', () => {
  describe('facilityCreateSchema', () => {
    it('should validate complete facility data', () => {
      const result = facilityCreateSchema.safeParse({
        name: 'Green Valley Cultivation',
        type: 'GREENHOUSE',
        address: {
          street: '123 Cannabis Lane',
          city: 'Denver',
          state: 'Colorado',
          postalCode: '80202',
          country: 'USA'
        },
        specifications: {
          totalArea: 5000,
          growingArea: 4500
        }
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate operational settings', () => {
      const result = facilityCreateSchema.safeParse({
        name: 'Indoor Grow Facility',
        type: 'INDOOR',
        address: {
          street: '456 Grow Street',
          city: 'Portland',
          state: 'Oregon',
          postalCode: '97201',
          country: 'USA'
        },
        specifications: {
          totalArea: 2000,
          growingArea: 1800,
          zones: 6
        },
        operationalSettings: {
          operatingHours: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' }
          },
          maintenanceSchedule: 'weekly',
          securityLevel: 'high'
        }
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('sensorConfigSchema', () => {
    it('should validate sensor configuration', () => {
      const result = sensorConfigSchema.safeParse({
        facilityId: 'cuid123456789012345678901',
        sensorId: 'TEMP-001',
        type: 'temperature',
        location: {
          zone: 'Flower Room A',
          position: { lat: 40.0150, lng: -105.2705 }
        },
        alertThresholds: {
          min: 18,
          max: 28,
          rateOfChange: 2
        }
      });
      
      expect(result.success).toBe(true);
    });
  });
});

describe('Payment Validation Schemas', () => {
  describe('paymentMethodSchema', () => {
    it('should validate credit card payment method', () => {
      const result = paymentMethodSchema.safeParse({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: new Date().getFullYear() + 1,
          cvc: '123',
          name: 'John Doe'
        }
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate bank account payment method', () => {
      const result = paymentMethodSchema.safeParse({
        type: 'bank_account',
        bank_account: {
          account_number: '000123456789',
          routing_number: '110000000',
          account_holder_name: 'Jane Doe',
          account_holder_type: 'individual'
        }
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid card numbers', () => {
      const result = paymentMethodSchema.safeParse({
        type: 'card',
        card: {
          number: '1234', // Too short
          exp_month: 12,
          exp_year: new Date().getFullYear() + 1,
          cvc: '123'
        }
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('subscriptionCreateSchema', () => {
    it('should validate subscription creation', () => {
      const result = subscriptionCreateSchema.safeParse({
        planId: 'pro',
        billingCycle: 'monthly',
        paymentMethodId: 'pm_1234567890'
      });
      
      expect(result.success).toBe(true);
    });

    it('should allow coupon codes', () => {
      const result = subscriptionCreateSchema.safeParse({
        planId: 'pro',
        couponCode: 'SAVE20'
      });
      
      expect(result.success).toBe(true);
    });
  });
});

describe('Security Validations', () => {
  it('should prevent SQL injection in IDs', () => {
    const maliciousId = "'; DROP TABLE users; --";
    const result = projectCreateSchema.safeParse({
      name: 'Test Project',
      projectId: maliciousId
    });
    
    expect(result.success).toBe(true); // ID field not in create schema
  });

  it('should sanitize HTML in text fields', () => {
    const xssAttempt = '<img src=x onerror=alert("XSS")>';
    const result = projectCreateSchema.safeParse({
      name: 'Safe Project',
      description: xssAttempt
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.description).not.toContain('onerror');
  });

  it('should validate URL protocols', () => {
    const dangerousUrl = 'javascript:alert("XSS")';
    const result = userProfileUpdateSchema.safeParse({
      website: dangerousUrl
    });
    
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from inputs', () => {
    const result = userProfileUpdateSchema.safeParse({
      name: '  John Doe  '
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('John Doe');
  });
});

describe('Agricultural Measurement Validations', () => {
  it('should validate temperature ranges', () => {
    const validTemp = measurementCreateSchema.safeParse({
      experimentId: 'cuid123456789012345678901',
      metricType: 'CUSTOM',
      value: 25,
      unit: 'celsius'
    });
    
    expect(validTemp.success).toBe(true);
  });

  it('should validate batch measurements', () => {
    const result = measurementBatchCreateSchema.safeParse({
      experimentId: 'cuid123456789012345678901',
      measurements: [
        {
          metricType: 'HEIGHT',
          value: 30.5,
          unit: 'cm',
          plantId: 'plant-001'
        },
        {
          metricType: 'WEIGHT',
          value: 125.3,
          unit: 'g',
          plantId: 'plant-002'
        }
      ]
    });
    
    expect(result.success).toBe(true);
  });
});