# VibeLux Production Deployment Guide

## Overview

This guide covers the deployment process for VibeLux to production environments, with specific instructions for Vercel deployment and Ensave integration requirements.

## Prerequisites

- Node.js 18+ and npm 9+
- Vercel CLI (`npm i -g vercel`)
- PostgreSQL database (production instance)
- All required API keys and secrets

## Environment Variables

Copy `.env.example` to `.env.production` and fill in all required values:

```bash
cp .env.example .env.production
```

### Critical Variables

1. **Database**
   - `DATABASE_URL`: PostgreSQL connection string
   - `DIRECT_URL`: Direct database URL for migrations

2. **Authentication (Clerk)**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public key from Clerk dashboard
   - `CLERK_SECRET_KEY`: Secret key (keep secure!)

3. **Energy Services**
   - `INFLUXDB_URL`: Time-series database for energy data
   - `INFLUXDB_TOKEN`: Authentication token
   - `ENSAVE_API_KEY`: API key for Ensave integration

## Pre-Deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] Database migrations run: `npm run db:migrate:deploy`
- [ ] Build passes locally: `npm run build`
- [ ] Type checking passes: `npm run type-check`
- [ ] Health check endpoint accessible: `/api/health`
- [ ] Rate limiting configured
- [ ] Error logging setup (Sentry)
- [ ] SSL certificates configured
- [ ] CDN configured for static assets

## Deployment Steps

### 1. Database Setup

```bash
# Run migrations
npm run db:migrate:deploy

# Verify database connection
npm run db:studio
```

### 2. Vercel Deployment

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or use GitHub integration for automatic deploys
```

### 3. Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://www.vibelux.ai/api/health
   ```

2. **Authentication Flow**
   - Test sign in/sign up at `/sign-in`
   - Verify only blake@vibelux.ai can access during debug mode

3. **Energy Features**
   - Test demand response endpoints
   - Verify real-time data flow
   - Check energy monitoring dashboard

## Monitoring & Alerts

### Health Monitoring

The `/api/health` endpoint provides:
- Database connectivity status
- API response times
- Feature flags status
- Environment information

### Recommended Monitoring Setup

1. **Uptime Monitoring**: Use Vercel Analytics or external service
2. **Error Tracking**: Sentry integration for error logging
3. **Performance**: Vercel Speed Insights
4. **Custom Alerts**: Set up for critical endpoints

## Energy & Demand Response Features

### Ensave Integration Points

1. **API Endpoints**
   - `/api/energy/demand-response/*` - DR event handling
   - `/api/energy/monitoring/*` - Real-time energy data
   - `/api/energy/optimization/*` - Energy optimization

2. **Webhook Configuration**
   ```javascript
   // Webhook endpoint for DR events
   POST /api/webhooks/ensave
   Headers: {
     'X-Ensave-Signature': 'webhook_signature'
   }
   ```

3. **Rate Limits**
   - Energy APIs: 200 requests/minute
   - Standard APIs: 100 requests/minute
   - Auth endpoints: 5 requests/15 minutes

### Data Flow Architecture

```
Ensave API → VibeLux Backend → InfluxDB → Frontend Dashboard
     ↓              ↓               ↓            ↓
  WebSocket    PostgreSQL      Time Series   Real-time UI
```

## Security Considerations

1. **API Security**
   - All energy endpoints require authentication
   - API keys stored in environment variables
   - Rate limiting on all public endpoints

2. **Data Encryption**
   - All data encrypted in transit (HTTPS)
   - Sensitive data encrypted at rest
   - No credentials in code or logs

3. **Access Control**
   - Role-based access (RBAC) via Clerk
   - IP whitelisting available for Ensave IPs
   - Audit logs for all energy operations

## Troubleshooting

### Common Issues

1. **Build Timeout**
   - Increase memory: `NODE_OPTIONS='--max-old-space-size=8192'`
   - Enable build caching
   - Consider code splitting

2. **Database Connection**
   - Verify connection string format
   - Check SSL requirements
   - Ensure connection pooling

3. **Authentication Errors**
   - Verify Clerk keys are correct
   - Check redirect URLs match production
   - Clear browser cookies/cache

### Debug Mode

To enable debug logging:
```bash
DEBUG=vibelux:* npm start
```

## Performance Optimization

1. **Edge Runtime**
   - Health check uses edge runtime
   - Consider for energy API endpoints

2. **Caching Strategy**
   - Static assets: 1 year cache
   - API responses: Cache-Control headers
   - Database queries: Connection pooling

3. **Bundle Optimization**
   - Lazy load heavy components
   - Tree shake unused code
   - Optimize images with next/image

## Rollback Procedure

If deployment issues occur:

1. **Vercel Rollback**
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   ```bash
   npm run db:migrate:rollback
   ```

3. **Verify Health**
   - Check `/api/health` endpoint
   - Monitor error rates
   - Test critical user flows

## Support & Contacts

- **Technical Issues**: Create issue at github.com/vibelux/app
- **Ensave Integration**: support@ensave.com
- **Emergency**: Use PagerDuty integration

## Appendix

### Environment Variable Reference

See `.env.example` for complete list with descriptions.

### API Documentation

- Energy APIs: `/api/energy/docs`
- GraphQL Schema: `/api/graphql`
- REST API: Follows RESTful conventions

### Compliance

- IPMVP compliant for energy measurements
- SOC2 Type II compliance in progress
- GDPR compliant data handling