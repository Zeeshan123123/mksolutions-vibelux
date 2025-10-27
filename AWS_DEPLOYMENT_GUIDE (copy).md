# VibeLux AWS Production Deployment Guide

## 🚀 Quick Start

1. **Prerequisites**
   - AWS CLI configured with appropriate permissions
   - Docker installed and running
   - Node.js 18+ and npm installed

2. **Deploy Infrastructure**
   ```bash
   ./scripts/deploy-production-aws.sh
   ```

3. **Update Environment Variables** (See below for complete list)

4. **Run Database Migrations**
   ```bash
   # Connect to ECS task and run:
   npx prisma migrate deploy
   ```

## 📋 Required Environment Variables

### Core Application
```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:5432/vibelux
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_APP_URL=https://vibelux.ai
NEXT_PUBLIC_DOMAIN=vibelux.ai
```

### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### AI Services
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
```

### Payment Processing (Stripe)
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email Services
```bash
SENDGRID_API_KEY=SG....
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@vibelux.ai
```

### Communications (Twilio)
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_API_KEY_SID=SK...
TWILIO_API_KEY_SECRET=...
```

### Real-time Services (Pusher)
```bash
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_APP_ID=...
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

### Cache/Session Storage
```bash
REDIS_URL=redis://vibelux-redis:6379
```

### Utility API Integrations
```bash
UTILITYAPI_KEY=...
UTILITYAPI_SECRET=...
UTILITY_ENCRYPTION_KEY=...
PGE_CLIENT_ID=...
PGE_CLIENT_SECRET=...
SCE_CLIENT_ID=...
SCE_CLIENT_SECRET=...
```

### File Storage
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=vibelux
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Monitoring & Analytics
```bash
SLACK_CRON_WEBHOOK=...
CRON_ALERT_EMAIL=alerts@vibelux.ai
HEALTHCHECK_URL=...
```

### Database Connections
```bash
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=vibelux-token
INFLUXDB_ORG=vibelux
INFLUXDB_BUCKET=bms-data
```

### External Integrations
```bash
MQTT_BROKER_URL=mqtt://localhost:1883
```

## 🏗️ Infrastructure Components

### Current Architecture
- **ECS Fargate**: 2 vCPU, 4GB RAM (upgraded from 1 vCPU, 2GB)
- **RDS PostgreSQL**: db.t3.medium, 100GB GP3 storage
- **ElastiCache Redis**: cache.t3.micro for sessions and caching
- **Application Load Balancer**: Health checks on `/api/health`
- **CloudFront CDN**: Global distribution
- **S3**: Static asset storage
- **ECR**: Container registry

### Security
- All secrets stored in AWS Systems Manager Parameter Store
- VPC with public/private subnets
- Security groups with least privilege access
- SSL/TLS termination at load balancer

## 💰 Cost Estimates (Monthly)

| Component | Configuration | Cost Range |
|-----------|--------------|------------|
| ECS Fargate | 2 vCPU, 4GB RAM | $85-120 |
| RDS PostgreSQL | db.t3.medium, 100GB | $95-130 |
| ElastiCache Redis | cache.t3.micro | $18-25 |
| Application Load Balancer | Standard | $22 |
| CloudFront CDN | Standard usage | $15-35 |
| S3 Storage | 50GB assets | $5-10 |
| CloudWatch | Enhanced monitoring | $10-20 |
| **Total** | | **$250-362** |

## 📈 Scaling Configuration

### Auto Scaling
```json
{
  "minCapacity": 1,
  "maxCapacity": 10,
  "targetCPUUtilization": 70,
  "targetMemoryUtilization": 80,
  "scaleOutCooldown": 300,
  "scaleInCooldown": 300
}
```

### Database Scaling
- Read replicas can be added for read-heavy workloads
- Connection pooling configured in Prisma
- Query optimization through indexes

## 🔧 Deployment Process

### Automated CI/CD
1. **CodePipeline** triggers on GitHub commits
2. **CodeBuild** runs tests and builds Docker image
3. **ECR** stores the container image
4. **ECS** deploys with blue/green strategy
5. **Health checks** ensure successful deployment

### Manual Deployment
```bash
# 1. Build and deploy infrastructure
./scripts/deploy-production-aws.sh

# 2. Update environment variables in AWS Console
aws ssm put-parameter --name "/vibelux/production/anthropic-api-key" --value "your-key" --type "SecureString" --overwrite

# 3. Deploy application
aws ecs update-service --cluster vibelux-production --service vibelux-production-service --force-new-deployment
```

## 🏥 Health Monitoring

### Health Check Endpoints
- **Application**: `/api/health`
- **Database**: Included in health check
- **External APIs**: `/api/admin/health/external`

### CloudWatch Metrics
- CPU and memory utilization
- Request count and response times
- Error rates and custom application metrics
- Database performance metrics

### Alerts
- High CPU/memory usage (>80%)
- Error rates above threshold (>5%)
- Database connection issues
- External API failures

## 🔐 Security Best Practices

### Network Security
- VPC with isolated subnets
- Security groups with minimal required access
- WAF (recommended for production)
- DDoS protection through CloudFront

### Data Security
- Encryption in transit (TLS 1.2+)
- Encryption at rest (RDS, S3)
- Secrets in Parameter Store (encrypted)
- Regular security audits

### Access Control
- IAM roles with least privilege
- No hardcoded credentials
- API key rotation policy
- Audit logging enabled

## 🚨 Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check ECS logs in CloudWatch
   - Verify all environment variables are set
   - Ensure database is accessible

2. **High Memory Usage**
   - Monitor with CloudWatch
   - Consider upgrading to larger instance
   - Optimize Prisma queries and connections

3. **Database Connection Issues**
   - Check security group rules
   - Verify connection string
   - Monitor connection pool usage

4. **External API Failures**
   - Check API keys and quotas
   - Verify network connectivity
   - Review rate limiting settings

### Useful Commands
```bash
# View ECS logs
aws logs tail /ecs/vibelux-production --follow

# Check service status
aws ecs describe-services --cluster vibelux-production --services vibelux-production-service

# Scale service
aws ecs update-service --cluster vibelux-production --service vibelux-production-service --desired-count 3

# Database connection test
aws ecs execute-command --cluster vibelux-production --task TASK_ID --container vibelux-app --interactive --command "/bin/bash"
```

## 📊 Performance Optimization

### Application Performance
- Next.js standalone build for minimal container size
- Static asset optimization through CloudFront
- Database query optimization
- Connection pooling and caching

### Infrastructure Performance
- Multi-AZ deployment for high availability
- Auto-scaling based on metrics
- CloudFront edge locations for global performance
- Redis caching for session and application data

## 🔄 Backup and Recovery

### Database Backups
- Automated daily backups (7-day retention)
- Point-in-time recovery available
- Cross-region backup replication (recommended)

### Application Recovery
- Blue/green deployment for rollbacks
- Container image versioning in ECR
- Infrastructure as Code for disaster recovery

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review CloudWatch metrics and costs
- **Monthly**: Security patches and updates
- **Quarterly**: Performance optimization review
- **Annually**: Architecture and cost optimization review

### Monitoring Dashboards
- Application performance metrics
- Infrastructure health
- Cost tracking and optimization
- Security audit logs

---

## 🎯 Next Steps After Deployment

1. **Configure Custom Domain**
   - Set up ACM certificate
   - Configure Route 53 DNS
   - Update CloudFront distribution

2. **Enable Advanced Monitoring**
   - Set up CloudWatch dashboards
   - Configure SNS alerts
   - Enable X-Ray tracing

3. **Implement CI/CD Pipeline**
   - GitHub Actions integration
   - Automated testing
   - Deployment approvals

4. **Performance Testing**
   - Load testing with realistic traffic
   - Database performance tuning
   - CDN optimization

5. **Security Hardening**
   - WAF rules configuration
   - Penetration testing
   - Compliance audits

---

For support or questions about this deployment, please refer to the AWS documentation or contact the VibeLux development team.