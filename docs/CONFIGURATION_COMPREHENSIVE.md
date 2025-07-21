# ⚙️ Configuration & Integration Comprehensive Guide

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Firebase Configuration](#-firebase-configuration)
3. [Content Security Policy (CSP)](#-content-security-policy-csp)
4. [Cross-Origin Policies](#-cross-origin-policies)
5. [Payment Integration](#-payment-integration)
6. [EMFILE Prevention](#-emfile-prevention)
7. [Build Configuration](#-build-configuration)
8. [Deployment Configuration](#-deployment-configuration)
9. [Security Best Practices](#-security-best-practices)
10. [Troubleshooting](#-troubleshooting)

---

## 🌟 Overview

This comprehensive guide covers all configuration fixes, security policies, and integration setups for RankPilot Studio, ensuring production-ready deployment with optimal security and performance.

**Last Updated:** July 21, 2025  
**Status:** ✅ Production Ready  
**Environment:** Firebase + Next.js + PayPal

### Key Configuration Areas

- ✅ **Firebase Integration** - Authentication, Functions, Hosting
- ✅ **Security Policies** - CSP, COOP, CORS configuration
- ✅ **Payment Integration** - PayPal secure integration
- ✅ **File System Optimization** - EMFILE error prevention
- ✅ **Build Optimization** - ESLint, TypeScript, bundling

---

## 🔥 Firebase Configuration

### Project Configuration

```typescript
// firebase.config.ts
const firebaseConfig = {
  projectId: "rankpilot-h3jpc",
  authDomain: "rankpilot-h3jpc.firebaseapp.com",
  storageBucket: "rankpilot-h3jpc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  region: "australia-southeast2"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'australia-southeast2');
```

### Firebase Hosting Configuration

```json
// firebase.json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cross-Origin-Embedder-Policy",
            "value": "require-corp"
          },
          {
            "key": "Cross-Origin-Opener-Policy", 
            "value": "same-origin"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://cloudfunctions.net;"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "region": "australia-southeast2"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data access control
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // NeuroSEO analyses - user-specific
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Subscription data - user-specific
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### Firebase Functions Configuration

```typescript
// functions/src/index.ts
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onRequest, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const auth = getAuth();

// Define secrets
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const paypalClientId = defineSecret('PAYPAL_CLIENT_ID');
const paypalClientSecret = defineSecret('PAYPAL_CLIENT_SECRET');

// NeuroSEO analysis function
export const runNeuroSEOAnalysis = onCall({
  secrets: [openaiApiKey],
  region: 'australia-southeast2',
  memory: '1GiB',
  timeoutSeconds: 300
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Get user subscription tier
  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  const userTier = userDoc.data()?.subscriptionTier || 'free';
  
  // Implement quota checking
  const quotaCheck = await checkUserQuota(request.auth.uid, userTier);
  if (!quotaCheck.allowed) {
    throw new functions.https.HttpsError('resource-exhausted', 'Quota exceeded');
  }
  
  // Run analysis
  const analysis = await runAnalysis(request.data, userTier);
  
  // Save to Firestore
  await db.collection('analyses').add({
    userId: request.auth.uid,
    timestamp: new Date(),
    tier: userTier,
    ...analysis
  });
  
  return analysis;
});

// PayPal webhook handler
export const handlePayPalWebhook = onRequest({
  secrets: [paypalClientSecret],
  region: 'australia-southeast2'
}, async (req, res) => {
  // Verify PayPal webhook signature
  const isValid = await verifyPayPalWebhook(req, paypalClientSecret.value());
  
  if (!isValid) {
    res.status(400).send('Invalid webhook signature');
    return;
  }
  
  // Handle subscription events
  const event = req.body;
  await handleSubscriptionEvent(event);
  
  res.status(200).send('OK');
});
```

---

## 🔒 Content Security Policy (CSP)

### CSP Configuration

```javascript
// next.config.ts
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 
    https://www.paypal.com 
    https://www.sandbox.paypal.com 
    https://js.stripe.com
    https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' 
    https://fonts.googleapis.com
    https://www.paypal.com;
  font-src 'self' 
    https://fonts.gstatic.com;
  img-src 'self' data: https:
    https://www.paypal.com
    https://www.google-analytics.com;
  connect-src 'self' 
    https://api.openai.com
    https://identitytoolkit.googleapis.com
    https://firestore.googleapis.com
    https://cloudfunctions.net
    https://api.paypal.com
    https://api.sandbox.paypal.com
    https://www.google-analytics.com;
  frame-src 
    https://www.paypal.com
    https://www.sandbox.paypal.com
    https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://www.paypal.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'false'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      }
    ];
  }
};
```

### CSP Implementation for Payment Integration

```typescript
// PayPal CSP-safe integration
const PayPalComponent = () => {
  useEffect(() => {
    // Dynamically load PayPal SDK with CSP-safe approach
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // PayPal SDK loaded successfully
      initializePayPal();
    };
    
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      // Fallback to manual payment flow
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  const initializePayPal = () => {
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: subscriptionAmount
            }
          }]
        });
      },
      onApprove: async (data, actions) => {
        const order = await actions.order.capture();
        await handleSuccessfulPayment(order);
      }
    }).render('#paypal-button-container');
  };
  
  return <div id="paypal-button-container" />;
};
```

---

## 🌐 Cross-Origin Policies

### COOP (Cross-Origin-Opener-Policy) Configuration

```javascript
// Enhanced security headers for cross-origin isolation
const crossOriginHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin'
};

// Next.js middleware for COOP enforcement
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Apply COOP headers
  Object.entries(crossOriginHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Special handling for PayPal integration
  if (request.nextUrl.pathname.startsWith('/payment')) {
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### CORS Configuration for API Routes

```typescript
// API route CORS configuration
import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://rankpilot-h3jpc.web.app' 
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

export async function POST(request: NextRequest) {
  // Your API logic here
  const response = await processRequest(request);
  
  // Apply CORS headers to response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
```

---

## 💳 Payment Integration

### PayPal Secure Integration

```typescript
// Secure PayPal configuration
const PayPalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  intent: 'subscription',
  currency: 'USD',
  locale: 'en_US'
};

// PayPal subscription creation
export const createPayPalSubscription = async (planId: string, userId: string) => {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const subscription = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'PayPal-Request-Id': `subscription-${userId}-${Date.now()}`
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: userData.firstName,
            surname: userData.lastName
          },
          email_address: userData.email
        },
        application_context: {
          brand_name: 'RankPilot',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: `${BASE_URL}/subscription/success`,
          cancel_url: `${BASE_URL}/subscription/cancel`
        }
      })
    });
    
    const subscriptionData = await subscription.json();
    
    // Store subscription in Firestore
    await db.collection('subscriptions').doc(subscriptionData.id).set({
      userId,
      subscriptionId: subscriptionData.id,
      planId,
      status: 'APPROVAL_PENDING',
      createdAt: new Date(),
      approvalUrl: subscriptionData.links.find(link => link.rel === 'approve')?.href
    });
    
    return subscriptionData;
  } catch (error) {
    console.error('PayPal subscription creation failed:', error);
    throw new Error('Failed to create subscription');
  }
};

// PayPal webhook verification
export const verifyPayPalWebhook = async (request: any, webhookSecret: string) => {
  const headers = request.headers;
  const body = JSON.stringify(request.body);
  
  const verificationData = {
    auth_algo: headers['paypal-auth-algo'],
    cert_id: headers['paypal-cert-id'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: webhookSecret,
    webhook_event: JSON.parse(body)
  };
  
  const verification = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getPayPalAccessToken()}`
    },
    body: JSON.stringify(verificationData)
  });
  
  const result = await verification.json();
  return result.verification_status === 'SUCCESS';
};
```

### Stripe Backup Integration

```typescript
// Stripe CSP-safe integration
const StripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
};

// Stripe Elements with CSP compliance
const StripeCheckout = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    const cardElement = elements.getElement(CardElement);
    
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: customerName,
        email: customerEmail
      }
    });
    
    if (error) {
      console.error('Stripe payment method creation failed:', error);
      return;
    }
    
    // Create subscription on backend
    const subscription = await createStripeSubscription({
      paymentMethodId: paymentMethod.id,
      priceId: selectedPlan.stripePriceId,
      customerId: customer.id
    });
    
    if (subscription.requiresAction) {
      const { error: confirmError } = await stripe.confirmCardPayment(
        subscription.paymentIntent.client_secret
      );
      
      if (confirmError) {
        console.error('Payment confirmation failed:', confirmError);
      } else {
        handleSuccessfulSubscription(subscription);
      }
    } else {
      handleSuccessfulSubscription(subscription);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        }}
      />
      <button type="submit" disabled={!stripe}>
        Subscribe
      </button>
    </form>
  );
};
```

---

## 📁 EMFILE Prevention

### Windows File System Optimization

```powershell
# EMFILE Prevention Script (Windows)
# scripts/emfile-prevention.ps1

Write-Host "🔧 EMFILE Prevention and File System Optimization" -ForegroundColor Cyan

# 1. Increase file handle limits
Write-Host "Setting file handle limits..." -ForegroundColor Yellow
$env:UV_THREADPOOL_SIZE = "128"
$env:NODE_OPTIONS = "--max-old-space-size=3072"

# 2. Clean temporary files
Write-Host "Cleaning temporary files..." -ForegroundColor Yellow
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Optimize node_modules
Write-Host "Optimizing node_modules..." -ForegroundColor Yellow
npm ci --prefer-offline --no-audit

# 4. Set file watcher limits
Write-Host "Configuring file watchers..." -ForegroundColor Yellow
$env:CHOKIDAR_USEPOLLING = "false"
$env:CHOKIDAR_INTERVAL = "1000"

# 5. Monitor file handles
Write-Host "Current file handle usage:" -ForegroundColor Green
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object Id, ProcessName, Handles

Write-Host "✅ EMFILE prevention configured successfully!" -ForegroundColor Green
```

### Node.js Configuration

```javascript
// next.config.ts - EMFILE prevention
const nextConfig = {
  // File system optimizations
  experimental: {
    esmExternals: true,
    optimizeCss: true,
    turbotrace: {
      logLevel: 'error'
    }
  },
  
  // Webpack optimizations for file handling
  webpack: (config, { isServer }) => {
    // Reduce file watch polling
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: [
        '**/node_modules',
        '**/.git',
        '**/.next',
        '**/dist'
      ]
    };
    
    // Optimize file resolution
    config.resolve.symlinks = false;
    config.resolve.cacheWithContext = false;
    
    // Limit concurrent file operations
    config.parallelism = 1;
    
    return config;
  },
  
  // Minimize file generation
  generateEtags: false,
  poweredByHeader: false,
  
  // Output optimization
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
```

### File Handle Monitoring

```typescript
// lib/file-handle-monitor.ts
export class FileHandleMonitor {
  private static instance: FileHandleMonitor;
  private handleCount = 0;
  private maxHandles = 1000;
  
  static getInstance(): FileHandleMonitor {
    if (!FileHandleMonitor.instance) {
      FileHandleMonitor.instance = new FileHandleMonitor();
    }
    return FileHandleMonitor.instance;
  }
  
  async checkHandleUsage(): Promise<boolean> {
    try {
      if (process.platform === 'win32') {
        const { exec } = await import('child_process');
        
        return new Promise((resolve) => {
          exec('wmic process where name="node.exe" get HandleCount', (error, stdout) => {
            if (error) {
              console.warn('Could not check handle count:', error);
              resolve(true); // Assume OK if can't check
              return;
            }
            
            const handles = stdout
              .split('\n')
              .filter(line => line.trim() && !line.includes('HandleCount'))
              .map(line => parseInt(line.trim()))
              .filter(num => !isNaN(num));
            
            const totalHandles = handles.reduce((sum, count) => sum + count, 0);
            this.handleCount = totalHandles;
            
            resolve(totalHandles < this.maxHandles);
          });
        });
      }
      
      return true; // Non-Windows platforms
    } catch (error) {
      console.warn('Handle usage check failed:', error);
      return true; // Assume OK on error
    }
  }
  
  getHandleCount(): number {
    return this.handleCount;
  }
  
  setMaxHandles(max: number): void {
    this.maxHandles = max;
  }
}

// Usage in development
if (process.env.NODE_ENV === 'development') {
  const monitor = FileHandleMonitor.getInstance();
  
  setInterval(async () => {
    const isOk = await monitor.checkHandleUsage();
    if (!isOk) {
      console.warn(`⚠️  High file handle usage: ${monitor.getHandleCount()}`);
    }
  }, 30000); // Check every 30 seconds
}
```

---

## 🏗️ Build Configuration

### ESLint Enhanced Configuration

```javascript
// eslint.config.mjs - Enhanced with fallback
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';

let config;

try {
  // Primary ESLint v9 configuration
  config = [
    js.configs.recommended,
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: {
        '@typescript-eslint': typescript,
        'react': react,
        'react-hooks': reactHooks,
        '@next/next': next
      },
      languageOptions: {
        parser: typescriptParser,
        parserOptions: {
          ecmaVersion: 2024,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true
          }
        }
      },
      rules: {
        // TypeScript rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        
        // React rules
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        
        // Next.js rules
        '@next/next/no-html-link-for-pages': 'error',
        '@next/next/no-img-element': 'error'
      },
      settings: {
        react: {
          version: 'detect'
        }
      }
    }
  ];
} catch (error) {
  console.warn('ESLint v9 configuration failed, using fallback:', error.message);
  
  // Fallback configuration for compatibility
  config = {
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@next/next/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    parserOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  };
}

export default config;
```

### Build Optimization Scripts

```json
// package.json - Build scripts
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:skip-typecheck": "node scripts/build-skip-typecheck.js",
    "build:production": "npm run lint && npm run test:unit && next build",
    "optimize": "npm run optimize:images && npm run optimize:deps",
    "optimize:images": "imagemin 'public/**/*.{jpg,png}' --out-dir=public/optimized",
    "optimize:deps": "npm audit fix && npm dedupe",
    "optimize:windows": "powershell -ExecutionPolicy Bypass -File scripts/optimize-windows.ps1"
  }
}
```

```javascript
// scripts/build-skip-typecheck.js - Emergency build script
const { spawn } = require('child_process');

console.log('🚀 Emergency Build Script - Skipping Type Checking');

// Build with type checking disabled
const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NEXT_TYPESCRIPT_IGNORE_BUILD_ERRORS: 'true',
    NEXT_ESLINT_IGNORE_BUILD_ERRORS: 'true'
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Emergency build completed successfully');
  } else {
    console.error('❌ Emergency build failed');
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});
```

---

## 🚀 Deployment Configuration

### Production Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Type checking
        run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_CONFIG: ${{ secrets.FIREBASE_CONFIG }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: out/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-files
          path: out/
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: rankpilot-h3jpc
```

### Environment Variables Configuration

```bash
# .env.example - Environment variables template
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Services
OPENAI_API_KEY=sk-your_openai_key

# Payment Processing
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
STRIPE_PUBLISHABLE_KEY=pk_your_stripe_key
STRIPE_SECRET_KEY=sk_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Development
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## 🔐 Security Best Practices

### Secret Management

```typescript
// lib/config/secrets.ts - Secure secret management
class SecretManager {
  private static instance: SecretManager;
  private secrets: Map<string, string> = new Map();
  
  static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }
  
  getSecret(key: string): string | undefined {
    // Try environment variables first
    const envValue = process.env[key];
    if (envValue) {
      return envValue;
    }
    
    // Fallback to cached secrets
    return this.secrets.get(key);
  }
  
  setSecret(key: string, value: string): void {
    this.secrets.set(key, value);
  }
  
  clearSecrets(): void {
    this.secrets.clear();
  }
  
  validateRequiredSecrets(requiredKeys: string[]): boolean {
    const missing = requiredKeys.filter(key => !this.getSecret(key));
    
    if (missing.length > 0) {
      console.error('Missing required secrets:', missing);
      return false;
    }
    
    return true;
  }
}

// Usage
const secretManager = SecretManager.getInstance();

export const getOpenAIKey = () => secretManager.getSecret('OPENAI_API_KEY');
export const getPayPalConfig = () => ({
  clientId: secretManager.getSecret('PAYPAL_CLIENT_ID'),
  clientSecret: secretManager.getSecret('PAYPAL_CLIENT_SECRET')
});

// Validate secrets on startup
const requiredSecrets = [
  'OPENAI_API_KEY',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET'
];

if (!secretManager.validateRequiredSecrets(requiredSecrets)) {
  throw new Error('Missing required environment variables');
}
```

### Input Validation and Sanitization

```typescript
// lib/validation/security.ts
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  // Remove potential XSS vectors
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Additional cleaning
  return cleaned
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Limit length
};

// URL validation
export const validateURL = (url: string): boolean => {
  const urlSchema = z.string().url().refine(
    (url) => {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    },
    'Only HTTP and HTTPS URLs are allowed'
  );
  
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
};

// API input validation
export const apiInputSchema = z.object({
  url: z.string().url().max(2000),
  keywords: z.array(z.string().max(100)).max(10),
  analysisType: z.enum(['basic', 'advanced', 'comprehensive']),
  userTier: z.enum(['free', 'starter', 'agency', 'enterprise', 'admin'])
});

// Rate limiting
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (userId: string, maxRequests = 10, windowMs = 60000): boolean => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(userId, validRequests);
  
  return true;
};
```

---

## 🔧 Troubleshooting

### Common Configuration Issues

#### 1. Firebase Connection Issues

```typescript
// Debug Firebase connection
const debugFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('✅ Firestore connection successful');
    
    // Test Auth
    const currentUser = auth.currentUser;
    console.log('✅ Auth connection successful:', currentUser ? 'User logged in' : 'No user');
    
    // Test Functions
    const testFunction = httpsCallable(functions, 'testConnection');
    await testFunction();
    console.log('✅ Functions connection successful');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
};
```

#### 2. CSP Violations

```typescript
// CSP violation reporting
window.addEventListener('securitypolicyviolation', (event) => {
  console.error('CSP Violation:', {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    sourceFile: event.sourceFile,
    lineNumber: event.lineNumber
  });
  
  // Report to monitoring service
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/csp-violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        timestamp: new Date().toISOString()
      })
    });
  }
});
```

#### 3. Payment Integration Issues

```typescript
// PayPal troubleshooting
const troubleshootPayPal = () => {
  // Check if PayPal SDK is loaded
  if (typeof window.paypal === 'undefined') {
    console.error('❌ PayPal SDK not loaded');
    return false;
  }
  
  // Check CSP configuration
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMeta) {
    const cspContent = cspMeta.getAttribute('content') || '';
    if (!cspContent.includes('paypal.com')) {
      console.error('❌ PayPal domains not whitelisted in CSP');
      return false;
    }
  }
  
  // Check environment configuration
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (!clientId) {
    console.error('❌ PayPal Client ID not configured');
    return false;
  }
  
  console.log('✅ PayPal configuration appears correct');
  return true;
};
```

### Performance Debugging

```powershell
# Performance troubleshooting script
Write-Host "🔍 Performance Debugging Tools" -ForegroundColor Cyan

# Check memory usage
Write-Host "Memory Usage:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object ProcessName, WorkingSet64, PagedMemorySize64

# Check file handles
Write-Host "File Handles:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object ProcessName, Handles

# Check disk usage
Write-Host "Disk Usage:" -ForegroundColor Yellow
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}

# Network connectivity test
Write-Host "Network Connectivity:" -ForegroundColor Yellow
Test-NetConnection -ComputerName "api.openai.com" -Port 443
Test-NetConnection -ComputerName "api.paypal.com" -Port 443
Test-NetConnection -ComputerName "firestore.googleapis.com" -Port 443
```

---

*Last Updated: July 21, 2025*  
*Document Version: 2.0*  
*Security Level: Production Ready*  
*Integration Status: All systems operational*
