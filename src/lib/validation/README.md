# VibeLux Validation System Documentation

## Overview

The VibeLux validation system provides comprehensive input validation using Zod schemas to prevent SQL injection, XSS attacks, and ensure data integrity across the application.

## Key Features

- **Type-safe validation** using Zod schemas
- **XSS prevention** through HTML sanitization
- **SQL injection prevention** through parameterized queries and input sanitization
- **Comprehensive error messages** with field-level details
- **Middleware system** for easy integration with Next.js API routes
- **Reusable validation schemas** for all major data models
- **Built-in sanitization** for common input types

## Directory Structure

```
src/lib/validation/
├── schemas/
│   ├── common.ts      # Common validation schemas and utilities
│   ├── user.ts        # User-related validation schemas
│   ├── project.ts     # Project and experiment schemas
│   ├── facility.ts    # Facility management schemas
│   ├── payment.ts     # Payment and subscription schemas
│   └── api.ts         # API-specific validation schemas
├── zod-validator.ts   # Main validation utilities
├── middleware.ts      # API route middleware
└── README.md         # This file
```

## Usage Examples

### 1. Basic API Route with Validation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withValidation, withAuth } from '@/lib/validation/middleware';
import { userProfileUpdateSchema } from '@/lib/validation/schemas/user';

async function handler(req: NextRequest) {
  const validatedData = (req as any).validated.body;
  // Use validated data safely
}

export const PUT = withAuth(
  withValidation(handler, {
    body: userProfileUpdateSchema
  }),
  { requireAuth: true }
);
```

### 2. Using Multiple Middleware

```typescript
import { 
  withValidation, 
  withAuth, 
  withRateLimit,
  withSecurityHeaders,
  withLogging
} from '@/lib/validation/middleware';

export const POST = withLogging(
  withSecurityHeaders(
    withRateLimit(
      withAuth(
        withValidation(handler, {
          body: projectCreateSchema,
          query: paginationSchema
        }),
        { requireAuth: true, requireRoles: ['ADMIN'] }
      ),
      { max: 10, windowMs: 60000 }
    )
  )
);
```

### 3. Manual Validation

```typescript
import { validate } from '@/lib/validation/zod-validator';
import { userRegistrationSchema } from '@/lib/validation/schemas/user';

const result = validate(userRegistrationSchema, formData);

if (!result.success) {
  // Handle validation errors
  console.log(result.errors);
} else {
  // Use validated data
  const user = result.data;
}
```

### 4. Custom Validation Schema

```typescript
import { z } from 'zod';
import { nameSchema, emailSchema } from '@/lib/validation/schemas/common';

const customSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  customField: z.string()
    .min(5, 'Must be at least 5 characters')
    .max(50, 'Cannot exceed 50 characters')
    .regex(/^[A-Z]/, 'Must start with uppercase letter')
});
```

## Security Features

### XSS Prevention

All string inputs that might contain HTML are sanitized using the `safeHtml` transformer:

```typescript
const safeHtml = z.string().transform(str => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
});
```

### SQL Injection Prevention

1. **Parameterized Queries**: Prisma ORM automatically uses parameterized queries
2. **ID Validation**: All IDs are validated against specific patterns (CUID, UUID, MongoDB ID)
3. **Input Sanitization**: Special characters are removed from sensitive inputs

### Path Traversal Prevention

File paths are sanitized to prevent directory traversal attacks:

```typescript
const sanitizePath = (input: string): string => {
  return input
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/[^a-zA-Z0-9\-_./]/g, ''); // Allow only safe characters
};
```

## Common Validation Schemas

### User Data
- `userRegistrationSchema` - New user registration
- `userProfileUpdateSchema` - Profile updates
- `loginSchema` - User authentication
- `passwordResetSchema` - Password reset

### Project Data
- `projectCreateSchema` - New project creation
- `spaceCreateSchema` - Space configuration
- `experimentCreateSchema` - Experiment setup
- `measurementCreateSchema` - Data measurements

### Facility Data
- `facilityCreateSchema` - Facility registration
- `environmentalTargetsSchema` - Environmental controls
- `sensorConfigSchema` - Sensor configuration
- `maintenanceTaskSchema` - Maintenance scheduling

### Payment Data
- `paymentMethodSchema` - Payment method validation
- `subscriptionCreateSchema` - Subscription management
- `invoiceCreateSchema` - Invoice generation
- `refundCreateSchema` - Refund processing

## Middleware Options

### Authentication Middleware
```typescript
withAuth(handler, {
  requireAuth: true,              // Require authenticated user
  requireRoles: ['ADMIN'],        // Require specific roles
  requirePermissions: ['write']   // Require specific permissions
})
```

### Rate Limiting Middleware
```typescript
withRateLimit(handler, {
  windowMs: 60000,    // Time window in milliseconds
  max: 60,            // Maximum requests per window
  keyGenerator: (req) => req.ip  // Custom key generation
})
```

### Validation Middleware
```typescript
withValidation(handler, {
  body: bodySchema,      // Validate request body
  query: querySchema,    // Validate query parameters
  params: paramsSchema,  // Validate route parameters
  headers: headerSchema  // Validate headers
})
```

## Error Handling

Validation errors return a standardized format:

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Best Practices

1. **Always validate user input** - Never trust client-side data
2. **Use appropriate schemas** - Choose schemas that match your data model
3. **Layer your middleware** - Combine validation with auth and rate limiting
4. **Handle errors gracefully** - Provide helpful error messages
5. **Log validation failures** - Track potential security threats
6. **Keep schemas updated** - Maintain schemas as your API evolves
7. **Test edge cases** - Ensure validation handles all scenarios

## Testing Validation

```typescript
import { userRegistrationSchema } from '@/lib/validation/schemas/user';

describe('User Registration Validation', () => {
  it('should validate correct data', () => {
    const result = userRegistrationSchema.safeParse({
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      acceptTerms: true
    });
    
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = userRegistrationSchema.safeParse({
      email: 'invalid-email',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      acceptTerms: true
    });
    
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('email');
  });
});
```

## Performance Considerations

1. **Schema Caching** - Schemas are parsed once and reused
2. **Lazy Validation** - Only validate when necessary
3. **Efficient Sanitization** - Use targeted sanitization for specific fields
4. **Rate Limit Storage** - Use Redis in production for distributed systems

## Migration Guide

To migrate existing routes to use validation:

1. Identify the data model being used
2. Import the appropriate schema from `/lib/validation/schemas/`
3. Wrap your handler with validation middleware
4. Update error handling to use the standardized format
5. Test thoroughly with various inputs

## Support

For questions or issues with the validation system:
1. Check the schema definitions in `/lib/validation/schemas/`
2. Review middleware options in `/lib/validation/middleware.ts`
3. Contact the development team for custom validation needs