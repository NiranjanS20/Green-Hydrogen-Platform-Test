# 🚀 Green Hydrogen Platform - Deployment Guide

This comprehensive guide covers deployment strategies for the Green Hydrogen Platform across different environments and platforms.

## 📋 Table of Contents

- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Migration](#database-migration)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Google Cloud Deployment](#google-cloud-deployment)
- [Azure Deployment](#azure-deployment)
- [Monitoring Setup](#monitoring-setup)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-deployment Checklist

### **Code Quality**
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] ESLint checks pass (`npm run lint`)
- [ ] Security audit clean (`npm audit`)
- [ ] Bundle size optimized (`npm run analyze`)

### **Environment Configuration**
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Storage buckets created
- [ ] External API keys configured
- [ ] SSL certificates ready

### **Security**
- [ ] Secrets properly configured
- [ ] Rate limiting enabled
- [ ] CORS origins configured
- [ ] Security headers implemented
- [ ] Audit logging enabled

---

## 🌍 Environment Setup

### **Development Environment**
```bash
# Clone repository
git clone https://github.com/NiranjanS20/Green-Hydrogen-Platform-Test.git
cd Green-Hydrogen-Platform-Test

# Install dependencies
npm install --legacy-peer-deps

# Setup environment
cp env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### **Staging Environment**
```bash
# Build application
npm run build

# Test production build locally
npm start

# Run integration tests
npm run test:integration

# Performance audit
npm run lighthouse
```

### **Production Environment**
```bash
# Final build with optimizations
NODE_ENV=production npm run build

# Security scan
npm run security:scan

# Deploy to production platform
npm run deploy:production
```

---

## 🗄️ Database Migration

### **Supabase Setup**
```sql
-- 1. Execute core schema
-- Run: database-setup.sql

-- 2. Execute admin system
-- Run: database-admin-approval-system.sql

-- 3. Execute enterprise features
-- Run: database-enterprise-enhancements.sql

-- 4. Verify setup
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **Migration Checklist**
- [ ] Core tables created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Triggers configured
- [ ] Functions deployed
- [ ] Sample data inserted (optional)

### **Data Migration**
```bash
# Export data from old system
supabase db dump --data-only > data-backup.sql

# Import data to new system
supabase db reset
psql -h localhost -p 54322 -d postgres -U postgres -f data-backup.sql
```

---

## ▲ Vercel Deployment

### **Automatic Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### **Manual Configuration**
1. **Connect Repository**: Link GitHub repository to Vercel
2. **Environment Variables**: Configure in Vercel dashboard
3. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`

### **Vercel Configuration File**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "regions": ["iad1", "sfo1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

---

## 🐳 Docker Deployment

### **Dockerfile**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **Docker Compose**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: hydrogen_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database-setup.sql:/docker-entrypoint-initdb.d/01-setup.sql
      - ./database-admin-approval-system.sql:/docker-entrypoint-initdb.d/02-admin.sql
      - ./database-enterprise-enhancements.sql:/docker-entrypoint-initdb.d/03-enterprise.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### **Build and Deploy**
```bash
# Build Docker image
docker build -t green-hydrogen-platform .

# Run with Docker Compose
docker-compose up -d

# Scale application
docker-compose up -d --scale app=3

# View logs
docker-compose logs -f app
```

---

## ☁️ AWS Deployment

### **AWS Amplify**
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install --legacy-peer-deps
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### **AWS ECS with Fargate**
```json
{
  "family": "green-hydrogen-platform",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/green-hydrogen-platform:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SUPABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:supabase-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/green-hydrogen-platform",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## 🌐 Google Cloud Deployment

### **Cloud Run**
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/green-hydrogen-platform', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/green-hydrogen-platform']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'green-hydrogen-platform'
      - '--image'
      - 'gcr.io/$PROJECT_ID/green-hydrogen-platform'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

### **App Engine**
```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 2
  disk_size_gb: 10
```

---

## 🔵 Azure Deployment

### **Azure Container Apps**
```yaml
# container-app.yaml
apiVersion: 2022-03-01
location: East US
name: green-hydrogen-platform
properties:
  managedEnvironmentId: /subscriptions/{subscription-id}/resourceGroups/{rg}/providers/Microsoft.App/managedEnvironments/{env}
  configuration:
    ingress:
      external: true
      targetPort: 3000
    secrets:
      - name: supabase-url
        value: ${SUPABASE_URL}
      - name: supabase-key
        value: ${SUPABASE_ANON_KEY}
  template:
    containers:
      - image: your-registry.azurecr.io/green-hydrogen-platform:latest
        name: app
        env:
          - name: NEXT_PUBLIC_SUPABASE_URL
            secretRef: supabase-url
          - name: NEXT_PUBLIC_SUPABASE_ANON_KEY
            secretRef: supabase-key
        resources:
          cpu: 1.0
          memory: 2Gi
    scale:
      minReplicas: 1
      maxReplicas: 10
```

---

## 📊 Monitoring Setup

### **Application Monitoring**
```typescript
// lib/monitoring.ts
import { createClient } from '@supabase/supabase-js';

export class MonitoringService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async logPerformanceMetric(metric: {
    name: string;
    value: number;
    unit: string;
    component?: string;
  }) {
    await this.supabase
      .from('performance_metrics')
      .insert({
        metric_name: metric.name,
        value: metric.value,
        unit: metric.unit,
        component: metric.component,
        timestamp: new Date().toISOString(),
      });
  }

  async logError(error: Error, context?: Record<string, any>) {
    await this.supabase
      .from('system_logs')
      .insert({
        level: 'error',
        message: error.message,
        component: context?.component || 'unknown',
        error_stack: error.stack,
        metadata: context,
        timestamp: new Date().toISOString(),
      });
  }
}
```

### **Health Check Endpoint**
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check database connection
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (dbError) throw dbError;

    // Check external services
    const checks = {
      database: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

---

## 🔒 Security Configuration

### **Environment Variables Security**
```bash
# Use secrets management
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name "green-hydrogen-platform/supabase" \
  --description "Supabase configuration" \
  --secret-string '{"url":"https://...","key":"..."}'

# Google Secret Manager
gcloud secrets create supabase-config --data-file=supabase-config.json

# Azure Key Vault
az keyvault secret set \
  --vault-name "hydrogen-platform-vault" \
  --name "supabase-config" \
  --file supabase-config.json
```

### **Security Headers**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## ⚡ Performance Optimization

### **Caching Strategy**
```typescript
// lib/cache.ts
export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, { data: any; expiry: number }>();

  static getInstance() {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  set(key: string, data: any, ttlSeconds: number = 300) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
}
```

### **Database Optimization**
```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_production_facilities_user_id_status 
ON production_facilities(user_id, status);

CREATE INDEX CONCURRENTLY idx_notifications_user_id_read_created 
ON notifications(user_id, read, created_at DESC);

CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp 
ON audit_logs(timestamp DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM production_facilities 
WHERE user_id = 'user-id' AND status = 'operational';
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **Build Failures**
```bash
# Clear caches
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps

# Check Node.js version
node --version  # Should be 18+

# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### **Database Connection Issues**
```bash
# Test connection
curl -X POST 'https://your-project.supabase.co/rest/v1/profiles' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"

# Check RLS policies
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### **Performance Issues**
```bash
# Analyze bundle size
ANALYZE=true npm run build

# Check memory usage
node --inspect node_modules/.bin/next dev

# Profile performance
npm run lighthouse
```

### **Monitoring Commands**
```bash
# Check application health
curl https://your-domain.com/api/health

# Monitor logs (Docker)
docker-compose logs -f app

# Monitor logs (Kubernetes)
kubectl logs -f deployment/green-hydrogen-platform

# Check resource usage
docker stats
kubectl top pods
```

---

## 📞 Support

For deployment issues:
- **Documentation**: Check this guide and README
- **GitHub Issues**: Report bugs and request features
- **Community**: Join discussions for help
- **Enterprise Support**: Contact for dedicated assistance

---

**🚀 Happy Deploying!**
