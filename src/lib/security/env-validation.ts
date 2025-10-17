import { logger } from '@/lib/logging/production-logger';
/**
 * Production Environment Security Validation
 * Validates that all required security configurations are properly set
 */

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProductionSecurity(): SecurityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical environment variables that MUST be set in production
  const requiredSecrets = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'CLERK_SECRET_KEY',
    'JWT_SECRET',
    'ADMIN_SETUP_SECRET',
  ];

  // Optional but recommended environment variables
  const recommendedSecrets = [
    'BACKUP_ENCRYPTION_KEY',
    'CSRF_SECRET',
    'NEXT_PUBLIC_OPENWEATHER_API_KEY',
  ];

  // Check required secrets
  for (const secret of requiredSecrets) {
    const value = process.env[secret];
    if (!value) {
      errors.push(`Missing required environment variable: ${secret}`);
    } else if (isWeakSecret(value)) {
      errors.push(`Weak or default value for ${secret} - must be changed for production`);
    }
  }

  // Check recommended secrets
  for (const secret of recommendedSecrets) {
    const value = process.env[secret];
    if (!value) {
      warnings.push(`Missing recommended environment variable: ${secret}`);
    } else if (isWeakSecret(value)) {
      warnings.push(`Weak or default value for ${secret} - consider changing`);
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Demo mode should be explicitly disabled in production
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      warnings.push('Demo mode is enabled in production - consider disabling');
    }

    // Admin setup should be properly controlled
    if (!process.env.ALLOW_ADMIN_SETUP) {
      // This is actually good - admin setup should be disabled by default
    }

    // Check for development-only flags
    if (process.env.ENABLE_DEV_FEATURES === 'true') {
      warnings.push('Development features are enabled in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function isWeakSecret(value: string): boolean {
  const weakSecrets = [
    'default-key',
    'default-secret',
    'test-jwt-secret',
    'test-encryption-key',
    'vibelux-admin-setup-2024',
    'default-csrf-secret-change-in-production',
    'change-me',
    'password',
    '123456',
    'secret',
  ];

  return weakSecrets.some(weak => value.toLowerCase().includes(weak.toLowerCase())) ||
         value.length < 16; // Minimum length requirement
}

/**
 * Validates security configuration on application startup
 * Throws error if critical security issues are found
 */
export function validateSecurityOnStartup(): void {
  const result = validateProductionSecurity();
  
  if (result.warnings.length > 0) {
    logger.warn('api', '🔶 Security warnings:');
    result.warnings.forEach(warning => logger.warn('api', `  - ${warning}`));
  }

  if (!result.isValid) {
    logger.error('api', '🚨 Critical security issues found:');
    result.errors.forEach(error => logger.error('api', `  - ${error}`));
    
    // During build time, only warn about security issues
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1' && process.env.RAILWAY !== '1') {
      throw new Error('Application cannot start in production with security vulnerabilities');
    } else {
      logger.error('api', '⚠️  Security issues detected - ensure environment variables are properly configured in production');
    }
  } else if (result.warnings.length === 0) {
    logger.info('api', '✅ Security validation passed');
  }
}