# Content Security Policy (CSP) Configuration Guide

## Overview

This document describes the Content Security Policy implementation in the Vibelux application. CSP is a security feature that helps prevent Cross-Site Scripting (XSS), clickjacking, and other code injection attacks.

## Current Implementation

### CSP Levels

The application supports three CSP levels:

1. **Development** - More permissive for development needs
2. **Production** - Strict but practical for production use
3. **Strict** - Maximum security (can be enabled via `NEXT_PUBLIC_CSP_MODE=strict`)

### Key Security Improvements

1. **Removed `unsafe-inline`** - All inline scripts and styles now use nonces
2. **Removed `unsafe-eval`** - No more eval() or new Function() usage
3. **Nonce-based security** - Dynamic nonces for inline content
4. **CSP violation reporting** - Monitoring for policy violations
5. **Strict CSP mode** - Optional enhanced security with `strict-dynamic`

## Configuration Files

### 1. CSP Configuration (`src/lib/csp/config.ts`)

The main CSP configuration file defines policies for different environments:

```typescript
// Production CSP - No unsafe-inline or unsafe-eval
const productionCSP: CSPDirectives = {
  'script-src': [
    "'self'",
    "'nonce-{nonce}'",
    "https://clerk.com",
    // ... other trusted sources
  ],
  'style-src': [
    "'self'",
    "'nonce-{nonce}'",
    "https://fonts.googleapis.com",
    // ... other trusted sources
  ],
  // ... other directives
};
```

### 2. Middleware (`src/middleware.ts`)

CSP headers are applied to all responses through the middleware:

```typescript
// Apply CSP headers to all responses
response = await applyCSPHeaders(req, response);
```

### 3. CSP Middleware (`src/middleware/csp.ts`)

Handles nonce generation and header application:

```typescript
export async function applyCSPHeaders(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const nonce = generateNonce();
  const cspHeader = buildCSP(cspConfig, nonce);
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set(NONCE_HEADER, nonce);
  return response;
}
```

## Nonce Distribution System

### 1. Server-Side Nonce Generation

Nonces are generated in the middleware for each request:

```typescript
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}
```

### 2. Nonce Provider (`src/components/NonceProvider.tsx`)

Distributes nonces to client components via React Context:

```typescript
<NonceProvider nonce={nonce}>
  {children}
</NonceProvider>
```

### 3. Using Nonces in Components

```typescript
import { useNonce, NonceScript, NonceStyle } from '@/components/NonceProvider';

function MyComponent() {
  const nonce = useNonce();
  
  return (
    <>
      <NonceScript>
        console.log('This script has a nonce!');
      </NonceScript>
      <NonceStyle>
        .my-class { color: red; }
      </NonceStyle>
    </>
  );
}
```

## Safe Alternatives to Unsafe Practices

### 1. Replacing eval()

Instead of using eval() for dynamic expressions, use the safe expression evaluator:

```typescript
import { evaluateExpression } from '@/lib/utils/safe-expression-evaluator';

// Before (unsafe):
const result = eval(userExpression);

// After (safe):
const result = evaluateExpression(userExpression, variables);
```

### 2. Sanitizing HTML Content

Use the nonce-aware sanitization for user-generated content:

```typescript
import { sanitizeWithNonce } from '@/lib/utils/sanitize-with-nonce';

const sanitizedHTML = sanitizeWithNonce(userContent, nonce);
```

### 3. Dynamic Script Loading

For dynamic script loading, use Next.js Script component with nonce:

```typescript
import Script from 'next/script';
import { useNonce } from '@/components/NonceProvider';

function MyComponent() {
  const nonce = useNonce();
  
  return (
    <Script
      src="https://trusted-source.com/script.js"
      nonce={nonce}
      strategy="lazyOnload"
    />
  );
}
```

## CSP Violation Reporting

### 1. Report Endpoint (`/api/csp-report`)

Violations are reported to this endpoint:

```typescript
// CSP directive
'report-uri': ['/api/csp-report'],
'report-to': ['csp-endpoint'],
```

### 2. Monitoring Violations

In development, view violations at: `/api/csp-report?limit=50`

Critical violations (potential attacks) are logged with high priority.

### 3. Analyzing Violations

Common violation types and solutions:

- **inline-style**: Add nonce to style tags or move to CSS files
- **inline-script**: Use NonceScript component or external scripts
- **eval**: Use safe expression evaluator
- **unsafe-inline**: Update third-party libraries or add to trusted sources

## Best Practices

### 1. Adding New Scripts

Always use nonces for inline scripts:

```typescript
// Bad
<script>console.log('hello');</script>

// Good
<NonceScript>console.log('hello');</NonceScript>
```

### 2. Third-Party Integrations

Add trusted domains to CSP configuration:

```typescript
// In src/lib/csp/config.ts
'script-src': [
  // ... existing sources
  "https://new-trusted-domain.com",
],
```

### 3. Testing CSP Changes

1. Test in development first
2. Monitor CSP reports for violations
3. Enable strict mode gradually
4. Use CSP report-only mode for testing:

```typescript
// For testing new policies
response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
```

### 4. Environment Variables

- `NODE_ENV` - Determines development vs production CSP
- `NEXT_PUBLIC_CSP_MODE` - Set to 'strict' for enhanced security

## Troubleshooting

### Common Issues

1. **Scripts not loading**: Check if source is in CSP whitelist
2. **Styles not applying**: Ensure nonce is properly distributed
3. **Third-party widgets breaking**: Add their domains to CSP
4. **Development hot-reload issues**: Development CSP includes unsafe-eval

### Debug Mode

Enable CSP debugging by checking browser console for violations:

```
Refused to execute inline script because it violates the following Content Security Policy directive...
```

## Security Considerations

1. **Never disable CSP** in production
2. **Avoid unsafe-inline** except in development
3. **Regular audits** of CSP reports for anomalies
4. **Update trusted sources** carefully
5. **Test thoroughly** before deploying CSP changes

## Migration Guide

When updating existing code:

1. Replace all eval() usage with safe alternatives
2. Add nonces to inline scripts and styles
3. Move inline event handlers to addEventListener
4. Sanitize user-generated HTML with nonce support
5. Test thoroughly with CSP enabled

## Future Enhancements

1. **Trusted Types** - Already configured for strict mode
2. **Subresource Integrity (SRI)** - For external scripts
3. **CSP Level 3 features** - As browser support improves
4. **Automated CSP testing** - Integration tests for CSP compliance

## Resources

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)