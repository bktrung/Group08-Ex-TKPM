# 🚀 Deployment Guide

This comprehensive guide covers deploying the Moodle Academic Management System to production environments.

---

## 🎯 Deployment Philosophy

Our deployment approach emphasizes:

- **🔒 Security-First**: Secure configurations and practices
- **⚡ Performance**: Optimized builds and caching strategies
- **📊 Monitoring**: Comprehensive observability and alerting
- **🛡️ Reliability**: High availability and disaster recovery
- **🔧 Maintainability**: Easy updates and rollback procedures

---

## 🏗️ Deployment Architecture

### **1. Infrastructure Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Load      │  │   Frontend  │  │   Backend   │         │
│  │  Balancer   │  │   (Vue.js)  │  │    API      │         │
│  │   (Nginx)   │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    CDN      │  │   Static    │  │  Database   │         │
│  │ (CloudFlare)│  │   Assets    │  │ (PostgreSQL)│         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### **2. Deployment Environments**

#### **Development Environment**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VUE_APP_API_URL=http://localhost:8080/api

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/dev.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
```

#### **Production Environment**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - VUE_APP_API_URL=${API_URL}
      - VUE_APP_CDN_URL=${CDN_URL}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/ssl/certs
    restart: unless-stopped
    depends_on:
      - frontend

  redis:
    image: redis:alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
```

---

## 🐳 Docker Configuration

### **1. Production Dockerfile**

```dockerfile
# Dockerfile.prod
# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production image
FROM nginx:alpine as production-stage

# Copy built assets from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/prod.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates (if using HTTPS)
COPY ssl/ /etc/ssl/certs/

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### **2. Nginx Configuration**

```nginx
# nginx/prod.conf
upstream backend {
    server backend:8080;
    keepalive 32;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:";
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options nosniff;
        }
        
        # Cache HTML files for shorter period
        location ~* \.(html)$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Login endpoint with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|config|sql|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

## 🚀 CI/CD Pipeline

### **1. GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'yarn'
    
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    
    - name: Run linter
      run: yarn lint
    
    - name: Run type check
      run: yarn type-check
    
    - name: Run unit tests
      run: yarn test:unit --coverage
    
    - name: Run E2E tests
      run: yarn test:e2e
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: frontend
        name: frontend-coverage

  security:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Run security audit
      run: yarn audit --level moderate
    
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

  build:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/')
    
    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha
    
    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.prod
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        platforms: linux/amd64,linux/arm64
    
    - name: Output image
      id: image
      run: |
        echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}" >> $GITHUB_OUTPUT

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: Deploy to staging
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_KEY }}
        script: |
          cd /opt/moodle-system
          echo "Pulling new image..."
          docker pull ${{ needs.build.outputs.image }}
          echo "Updating docker-compose..."
          sed -i "s|image:.*|image: ${{ needs.build.outputs.image }}|" docker-compose.staging.yml
          echo "Deploying to staging..."
          docker-compose -f docker-compose.staging.yml up -d
          echo "Waiting for health check..."
          sleep 30
          curl -f http://localhost/health || exit 1
          echo "Staging deployment successful!"

  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    if: startsWith(github.ref, 'refs/tags/')
    environment: production
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_KEY }}
        script: |
          cd /opt/moodle-system
          
          # Backup current deployment
          echo "Creating backup..."
          docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
          
          # Pull new image
          echo "Pulling new image..."
          docker pull ${{ needs.build.outputs.image }}
          
          # Update docker-compose
          echo "Updating docker-compose..."
          sed -i "s|image:.*|image: ${{ needs.build.outputs.image }}|" docker-compose.prod.yml
          
          # Rolling update
          echo "Performing rolling update..."
          docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
          
          # Health check
          echo "Waiting for health check..."
          sleep 30
          curl -f https://your-domain.com/health || exit 1
          
          # Clean up old images
          echo "Cleaning up old images..."
          docker image prune -f
          
          echo "Production deployment successful!"

  notify:
    runs-on: ubuntu-latest
    needs: [deploy-production]
    if: always()
    
    steps:
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        fields: repo,message,commit,author,action,eventName,ref,workflow
      if: always()
```

### **2. Environment Configuration**

```bash
# .env.production
NODE_ENV=production

# API Configuration
VUE_APP_API_URL=https://api.your-domain.com
VUE_APP_WS_URL=wss://api.your-domain.com/ws

# CDN Configuration
VUE_APP_CDN_URL=https://cdn.your-domain.com

# Analytics
VUE_APP_ANALYTICS_ID=GA-XXXXXXXXX
VUE_APP_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
VUE_APP_ENABLE_ANALYTICS=true
VUE_APP_ENABLE_ERROR_REPORTING=true
VUE_APP_ENABLE_PERFORMANCE_MONITORING=true

# Cache Settings
VUE_APP_CACHE_VERSION=1.0.0

# Security
VUE_APP_CSP_NONCE=${CSP_NONCE}
```

```bash
# .env.staging
NODE_ENV=staging

# API Configuration
VUE_APP_API_URL=https://api.staging.your-domain.com
VUE_APP_WS_URL=wss://api.staging.your-domain.com/ws

# Debug Settings
VUE_APP_DEBUG=true
VUE_APP_ENABLE_DEVTOOLS=true

# Testing
VUE_APP_ENABLE_MOCK_DATA=false
```

---

## 📊 Monitoring & Observability

### **1. Application Monitoring**

```javascript
// src/plugins/monitoring.js
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

export function setupMonitoring(app, router) {
  // Error monitoring
  Sentry.init({
    app,
    dsn: process.env.VUE_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracePropagationTargets: [
          process.env.VUE_APP_API_URL,
          /^\//
        ]
      })
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out sensitive information
      if (event.request?.data) {
        delete event.request.data.password
        delete event.request.data.token
      }
      return event
    }
  })

  // Performance monitoring
  if (process.env.VUE_APP_ENABLE_PERFORMANCE_MONITORING === 'true') {
    // Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics)
      getFID(sendToAnalytics)
      getFCP(sendToAnalytics)
      getLCP(sendToAnalytics)
      getTTFB(sendToAnalytics)
    })
  }
}

function sendToAnalytics(metric) {
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true
    })
  }
}
```

### **2. Health Check Implementation**

```javascript
// src/utils/healthCheck.js
export class HealthChecker {
  constructor() {
    this.checks = new Map()
    this.status = 'unknown'
  }

  addCheck(name, checkFunction) {
    this.checks.set(name, checkFunction)
  }

  async runChecks() {
    const results = {}
    let overallStatus = 'healthy'

    for (const [name, checkFn] of this.checks) {
      try {
        const result = await Promise.race([
          checkFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ])
        
        results[name] = {
          status: 'healthy',
          ...result
        }
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message
        }
        overallStatus = 'unhealthy'
      }
    }

    this.status = overallStatus
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results
    }
  }
}

// Setup health checks
const healthChecker = new HealthChecker()

// API connectivity check
healthChecker.addCheck('api', async () => {
  const response = await fetch(`${process.env.VUE_APP_API_URL}/health`)
  if (!response.ok) throw new Error(`API returned ${response.status}`)
  return { latency: response.headers.get('X-Response-Time') }
})

// LocalStorage check
healthChecker.addCheck('localStorage', () => {
  const testKey = '__test__'
  localStorage.setItem(testKey, 'test')
  const value = localStorage.getItem(testKey)
  localStorage.removeItem(testKey)
  if (value !== 'test') throw new Error('LocalStorage not working')
  return { available: true }
})

// Memory usage check
healthChecker.addCheck('memory', () => {
  const memory = (performance as any).memory
  if (memory) {
    const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    if (usedPercent > 90) throw new Error('High memory usage')
    return {
      usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      usedPercent: Math.round(usedPercent)
    }
  }
  return { available: false }
})

export { healthChecker }
```

### **3. Performance Metrics**

```javascript
// src/utils/performance.js
export class PerformanceTracker {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
    this.setupObservers()
  }

  setupObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackNavigation(entry)
        }
      })
      observer.observe({ entryTypes: ['navigation'] })
      this.observers.set('navigation', observer)
    }

    // Resource timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackResource(entry)
        }
      })
      observer.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', observer)
    }

    // User timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackUserTiming(entry)
        }
      })
      observer.observe({ entryTypes: ['measure', 'mark'] })
      this.observers.set('userTiming', observer)
    }
  }

  trackNavigation(entry) {
    const metrics = {
      // Page load times
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      load: entry.loadEventEnd - entry.loadEventStart,
      
      // Network times
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      
      // Response times
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      
      // Total times
      total: entry.loadEventEnd - entry.navigationStart
    }

    this.sendMetrics('navigation', metrics)
  }

  trackResource(entry) {
    if (entry.duration > 1000) { // Track slow resources
      this.sendMetrics('slowResource', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        type: entry.initiatorType
      })
    }
  }

  trackUserTiming(entry) {
    this.sendMetrics('userTiming', {
      name: entry.name,
      duration: entry.duration,
      type: entry.entryType
    })
  }

  // Custom timing marks
  mark(name) {
    performance.mark(name)
  }

  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark)
  }

  // Route transition timing
  startRouteTransition(to, from) {
    this.mark(`route-start-${to.name}`)
    this.routeStart = performance.now()
  }

  endRouteTransition(to) {
    this.mark(`route-end-${to.name}`)
    const duration = performance.now() - this.routeStart
    
    this.sendMetrics('routeTransition', {
      route: to.name,
      duration
    })
  }

  sendMetrics(type, data) {
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance', {
        event_category: type,
        custom_map: data
      })
    }

    // Send to custom endpoint
    if (process.env.VUE_APP_METRICS_ENDPOINT) {
      fetch(process.env.VUE_APP_METRICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {}) // Silent fail
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  destroy() {
    for (const observer of this.observers.values()) {
      observer.disconnect()
    }
    this.observers.clear()
  }
}

export const performanceTracker = new PerformanceTracker()
```

---

## 🔒 Security Configuration

### **1. Content Security Policy**

```javascript
// src/utils/csp.js
export function generateCSPNonce() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode.apply(null, array))
}

export function buildCSPHeader(nonce) {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Vue
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'connect-src': [
      "'self'",
      process.env.VUE_APP_API_URL,
      'https://www.google-analytics.com'
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}
```

### **2. Security Headers Setup**

```javascript
// src/plugins/security.js
export function setupSecurityHeaders() {
  // Prevent clickjacking
  if (window.self !== window.top) {
    window.top.location = window.self.location
  }

  // Prevent console access in production
  if (process.env.NODE_ENV === 'production') {
    const noop = () => {}
    const methods = ['log', 'debug', 'info', 'warn', 'error']
    
    methods.forEach(method => {
      console[method] = noop
    })
  }

  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear sensitive localStorage items
    const sensitiveKeys = ['token', 'refreshToken', 'userSession']
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key)
    })
  })

  // Prevent sensitive data in dev tools
  document.addEventListener('contextmenu', (e) => {
    if (process.env.NODE_ENV === 'production') {
      e.preventDefault()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (process.env.NODE_ENV === 'production') {
      // Disable F12, Ctrl+Shift+I, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault()
      }
    }
  })
}
```

---

## 🎯 Environment-Specific Optimizations

### **1. Production Build Optimization**

```javascript
// vite.config.prod.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'vuex', 'vue-i18n'],
          'ui': ['bootstrap'],
          'utils': ['axios', 'lodash']
        }
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    
    // Source maps for production debugging
    sourcemap: true
  },
  
  // Alias for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@store': resolve(__dirname, 'src/store'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  
  // PWA configuration
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_OPTIONS_API__: true
  }
})
```

### **2. Performance Optimizations**

```javascript
// src/utils/lazyLoading.js
export function setupLazyLoading() {
  // Intersection Observer for images
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove('lazy')
        imageObserver.unobserve(img)
      }
    })
  })

  // Observe all lazy images
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })

  // Prefetch critical resources
  const prefetchLinks = [
    '/api/user/profile',
    '/api/dashboard/stats'
  ]

  prefetchLinks.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  })
}

// Resource hints
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
    { rel: 'preconnect', href: process.env.VUE_APP_API_URL },
    { rel: 'preconnect', href: process.env.VUE_APP_CDN_URL }
  ]

  hints.forEach(hint => {
    const link = document.createElement('link')
    Object.assign(link, hint)
    document.head.appendChild(link)
  })
}
```

---

## 🔄 Rollback Strategy

### **1. Automated Rollback**

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

BACKUP_DIR="/opt/moodle-system/backups"
CURRENT_DIR="/opt/moodle-system"

echo "🔄 Starting rollback process..."

# Get the last successful deployment
LAST_BACKUP=$(ls -t $BACKUP_DIR/backup_*.tar.gz | head -n 1)

if [ -z "$LAST_BACKUP" ]; then
    echo "❌ No backup found for rollback"
    exit 1
fi

echo "📦 Rolling back to: $LAST_BACKUP"

# Stop current services
echo "⏹️ Stopping current services..."
cd $CURRENT_DIR
docker-compose -f docker-compose.prod.yml down

# Restore from backup
echo "📥 Restoring from backup..."
tar -xzf $LAST_BACKUP -C $CURRENT_DIR

# Start services
echo "▶️ Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Health check
echo "🏥 Performing health check..."
sleep 30

if curl -f https://your-domain.com/health; then
    echo "✅ Rollback successful!"
    
    # Notify team
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🔄 Rollback completed successfully"}' \
        $SLACK_WEBHOOK_URL
else
    echo "❌ Rollback failed - health check failed"
    exit 1
fi
```

### **2. Database Rollback**

```bash
#!/bin/bash
# scripts/db-rollback.sh

set -e

DB_CONTAINER="moodle-postgres"
DB_NAME="moodle_db"
DB_USER="moodle_user"
BACKUP_DIR="/opt/moodle-system/db-backups"

echo "🗄️ Starting database rollback..."

# Get the last database backup
LAST_DB_BACKUP=$(ls -t $BACKUP_DIR/db_backup_*.sql | head -n 1)

if [ -z "$LAST_DB_BACKUP" ]; then
    echo "❌ No database backup found"
    exit 1
fi

echo "📊 Rolling back database to: $LAST_DB_BACKUP"

# Create a backup of current state before rollback
echo "💾 Creating safety backup..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/pre_rollback_$(date +%Y%m%d_%H%M%S).sql

# Restore database
echo "🔄 Restoring database..."
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < $LAST_DB_BACKUP

echo "✅ Database rollback completed"
```

---

## 📈 Scaling Strategies

### **1. Horizontal Scaling**

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  frontend:
    image: moodle-frontend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
    networks:
      - frontend-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/load-balancer.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
    networks:
      - frontend-network

networks:
  frontend-network:
    driver: bridge
```

### **2. CDN Configuration**

```javascript
// src/utils/cdn.js
export class CDNManager {
  constructor() {
    this.cdnUrl = process.env.VUE_APP_CDN_URL
    this.fallbackUrl = process.env.VUE_APP_FALLBACK_CDN_URL
  }

  getAssetUrl(assetPath) {
    // Try CDN first, fallback to local
    return this.cdnUrl ? `${this.cdnUrl}${assetPath}` : assetPath
  }

  preloadCriticalAssets() {
    const criticalAssets = [
      '/css/critical.css',
      '/js/vendor.js',
      '/js/app.js'
    ]

    criticalAssets.forEach(asset => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = this.getAssetUrl(asset)
      link.as = asset.endsWith('.css') ? 'style' : 'script'
      document.head.appendChild(link)
    })
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration)
        })
        .catch(error => {
          console.log('SW registration failed:', error)
        })
    }
  }
}

export const cdnManager = new CDNManager()
```

---

## 🎯 Final Deployment Checklist

### **Pre-deployment**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Backup systems verified
- [ ] Monitoring configured
- [ ] SSL certificates valid
- [ ] Environment variables set
- [ ] CDN configured and tested

### **Deployment**
- [ ] Blue-green deployment strategy
- [ ] Health checks configured
- [ ] Load balancer updated
- [ ] DNS propagation verified
- [ ] Cache invalidation triggered
- [ ] Static assets deployed to CDN

### **Post-deployment**
- [ ] Application health verified
- [ ] Performance metrics normal
- [ ] Error rates within acceptable limits
- [ ] User acceptance testing passed
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Rollback plan verified

---

## 🎯 Next Steps

Congratulations! You've completed the comprehensive developer guide. For ongoing maintenance:

1. **Monitoring**: Set up alerts and dashboards
2. **Updates**: Regular dependency updates and security patches
3. **Performance**: Continuous optimization and monitoring
4. **Security**: Regular security audits and penetration testing

---

**🚀 Your Moodle system is now ready for production deployment! Welcome to the world of scalable academic management!** 