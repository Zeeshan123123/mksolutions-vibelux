# CSRF Protection for VibeLux

This directory contains a comprehensive CSRF (Cross-Site Request Forgery) protection system for the VibeLux application. The system implements the double-submit cookie pattern with JWT tokens for enhanced security.

## Features

- ✅ Automatic CSRF token generation and validation
- ✅ JWT-based tokens with expiration and session binding
- ✅ Double-submit cookie pattern for enhanced security
- ✅ Seamless integration with Clerk authentication
- ✅ Support for both API routes and server actions
- ✅ Automatic token rotation on login/logout
- ✅ Comprehensive error handling and logging
- ✅ TypeScript support with full type safety
- ✅ Easy-to-use React hooks and components

## Architecture

### Core Components

1. **`index.ts`** - Main CSRF utility functions
2. **`server-actions.ts`** - Server action protection wrappers
3. **`api-wrapper.ts`** - API route protection utilities
4. **`/middleware/csrf.ts`** - Next.js middleware integration
5. **`/hooks/use-csrf.ts`** - React hooks for client-side usage
6. **`/components/csrf-form.tsx`** - Protected form components

### Protection Flow

```
1. User visits page → CSRF token generated → Token set in cookie
2. User submits form → Token validated → Request processed
3. User logs in/out → Token rotated → New token generated
```

## Usage

### API Routes

```typescript
// /app/api/users/route.ts
import { withCSRFProtection } from '@/lib/csrf/api-wrapper';

export const { POST, PUT, DELETE } = withCSRFProtection({
  POST: async (req) => {
    // Your API logic here
    const body = await req.json();
    return NextResponse.json({ success: true });
  },
  
  PUT: async (req) => {
    // PUT requests are automatically protected
    return NextResponse.json({ updated: true });
  },
  
  DELETE: async (req) => {
    // DELETE requests are automatically protected
    return NextResponse.json({ deleted: true });
  },
});
```

### Server Actions

```typescript
// /app/actions/users.ts
'use server';

import { csrfProtected } from '@/lib/csrf/server-actions';

export const createUser = csrfProtected(async (formData: FormData) => {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  // Your server action logic
  // CSRF token is automatically validated
  
  return { success: true };
});
```

### React Components

```typescript
// Using the CSRF-protected form component
import { CSRFForm } from '@/components/csrf-form';
import { createUser } from '@/app/actions/users';

export default function UserForm() {
  return (
    <CSRFForm action={createUser}>
      <input type="text" name="name" placeholder="Name" />
      <input type="email" name="email" placeholder="Email" />
      <button type="submit">Create User</button>
    </CSRFForm>
  );
}
```

```typescript
// Using the CSRF hook for API calls
import { useCSRF, csrfFetch } from '@/hooks/use-csrf';

export default function UserManager() {
  const { csrfToken, getHeaders } = useCSRF();
  
  const handleCreateUser = async (userData: any) => {
    const response = await csrfFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response.json();
  };
  
  return (
    <div>
      <button onClick={() => handleCreateUser({ name: 'John' })}>
        Create User
      </button>
    </div>
  );
}
```

## Configuration

### Environment Variables

```env
# Required: Secret key for JWT token signing
CSRF_SECRET=your-secret-key-here

# Alternative: Will use NextAuth secret if CSRF_SECRET is not set
NEXTAUTH_SECRET=your-nextauth-secret
```

### Excluded Paths

The following paths are excluded from CSRF protection by default:

- `/api/webhooks/*` - Webhook endpoints
- `/api/health` - Health check endpoints
- `/api/v1/docs` - Documentation endpoints

To modify excluded paths, update the `EXCLUDED_PATHS` array in `/lib/csrf/index.ts`.

### Protected Methods

The following HTTP methods require CSRF protection:

- `POST`
- `PUT`
- `DELETE`
- `PATCH`

Safe methods (`GET`, `HEAD`, `OPTIONS`) are not protected.

## Security Features

### Token Properties

- **JWT-based**: Tokens are signed JWTs with expiration
- **Session-bound**: Each token is tied to a specific session
- **Time-limited**: Tokens expire after 24 hours
- **Nonce-protected**: Each token includes a random nonce

### Double-Submit Cookie Pattern

The system uses the double-submit cookie pattern:

1. CSRF token is set in an HTTP-only cookie
2. Same token must be sent in request header/body
3. Server validates both match

### Security Headers

All CSRF error responses include:

- `X-CSRF-Error: true` - Indicates CSRF validation failure
- `403 Forbidden` status code

## Logging and Monitoring

The system logs all CSRF events for security monitoring:

```typescript
// Example log events
[CSRF GENERATED] { sessionId: 'abc123', timestamp: '2023-...' }
[CSRF VALIDATED] { sessionId: 'abc123', path: '/api/users' }
[CSRF FAILED] { reason: 'invalid_token', sessionId: 'abc123' }
[CSRF ROTATED] { sessionId: 'abc123', trigger: '/sign-in' }
```

## Error Handling

### Common Error Scenarios

1. **Missing Token**: `CSRF token missing`
2. **Invalid Token**: `Invalid CSRF token`
3. **Session Mismatch**: `CSRF token session mismatch`
4. **Expired Token**: `CSRF token expired`
5. **No Session**: `Unable to establish session`

### Client-Side Error Handling

```typescript
import { useCSRF } from '@/hooks/use-csrf';

function MyComponent() {
  const { csrfToken, error, refreshToken } = useCSRF();
  
  if (error) {
    return (
      <div>
        <p>CSRF Error: {error.message}</p>
        <button onClick={refreshToken}>Retry</button>
      </div>
    );
  }
  
  // Component content
}
```

## Testing

### Unit Tests

```bash
npm test -- csrf.test.ts
```

### Integration Testing

1. Visit `/csrf-example` to test the system interactively
2. Use the provided test forms and API endpoints
3. Monitor browser console for CSRF events

### Manual Testing

1. **Token Generation**: Visit any page, check for CSRF cookie
2. **Token Validation**: Submit a form, verify success
3. **Token Rotation**: Log in/out, verify new token
4. **Error Handling**: Remove token, verify 403 response

## Best Practices

### DO

- Always use `CSRFForm` for server actions
- Use `csrfFetch` for API calls
- Handle CSRF errors gracefully
- Test CSRF protection in development

### DON'T

- Don't disable CSRF protection in production
- Don't expose CSRF tokens in URLs
- Don't rely on CSRF alone for security
- Don't ignore CSRF error logs

## Troubleshooting

### Common Issues

1. **"CSRF token missing"**
   - Check if `useCSRF` hook is properly initialized
   - Verify token is being sent in headers
   - Ensure forms use `CSRFForm` component

2. **"Invalid CSRF token"**
   - Check if token has expired (24h limit)
   - Verify session consistency
   - Try refreshing the token

3. **"Session not found"**
   - Check Clerk authentication setup
   - Verify middleware integration
   - Ensure proper session handling

### Debug Mode

Enable debug logging in development:

```typescript
// Set in environment
NODE_ENV=development

// Will log all CSRF events to console
```

## Contributing

When adding new API routes or server actions:

1. Use provided wrappers (`withCSRFProtection`, `csrfProtected`)
2. Add comprehensive tests
3. Update documentation
4. Test with `/csrf-example` page

## Security Considerations

- CSRF protection is just one layer of security
- Always validate and sanitize user input
- Use HTTPS in production
- Regularly rotate the `CSRF_SECRET`
- Monitor CSRF failure logs for attacks
- Keep dependencies updated

## Performance Impact

- Minimal overhead (~1-2ms per request)
- Tokens are cached in session storage
- JWT verification is fast
- No database queries required

## Future Enhancements

- [ ] Redis-based token storage for horizontal scaling
- [ ] Advanced rate limiting for CSRF failures
- [ ] Integration with security monitoring tools
- [ ] Automated token rotation scheduling
- [ ] Enhanced logging and metrics