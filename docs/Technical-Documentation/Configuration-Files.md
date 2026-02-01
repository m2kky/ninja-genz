---
title: "Configuration Files & Templates"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "Development Standards Document"
  - "DevOps & Infrastructure Document"
  - "Operations Documentation"
priority: "P2"
estimated_implementation_time: "2 days (setup)"
---

# Configuration Files & Templates — Ninja Gen Z Platform

## TL;DR

This document provides production-ready configuration files for the Ninja Gen Z platform. Includes **environment variable templates** (`.env.example` with Supabase, Vercel, and API keys), **GitHub Actions workflows** (PR checks, staging/production deployment), **Vercel configuration** (`vercel.json` with redirects, headers, and build settings), **Supabase config** (`config.toml` for local development), **ESLint/Prettier** configs, and **pre-commit hooks** (Husky). All sensitive values use placeholders; actual secrets stored in GitHub Secrets, Vercel Environment Variables, and Supabase Vault.

---

## Table of Contents

- [1. Environment Variables](#1-environment-variables)
- [2. GitHub Actions Workflows](#2-github-actions-workflows)
- [3. Vercel Configuration](#3-vercel-configuration)
- [4. Supabase Configuration](#4-supabase-configuration)
- [5. Code Quality Tools](#5-code-quality-tools)
- [6. Git Hooks](#6-git-hooks)
- [7. Package.json Scripts](#7-packagejson-scripts)
- [8. Next Steps](#8-next-steps)
- [9. References](#9-references)
- [10. Changelog](#10-changelog)

---

## 1. Environment Variables

### 1.1 Environment Template (.env.example)

**File:** `.env.example` (committed to Git)

```bash
# ========================================
# Ninja Gen Z — Environment Variables
# ========================================
# Copy this file to .env.local and fill in actual values
# NEVER commit .env.local to Git

# ----------------------------------------
# Supabase Configuration
# ----------------------------------------
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ----------------------------------------
# Environment
# ----------------------------------------
# Options: development | staging | production
VITE_ENV=development

# ----------------------------------------
# Feature Flags
# ----------------------------------------
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_ADS_MONITORING=false
VITE_ENABLE_PRAYER_REMINDERS=true
VITE_ENABLE_MOCKUP_PREVIEWS=false

# ----------------------------------------
# External APIs (Optional — Backend Managed)
# ----------------------------------------
# These are stored in Supabase Vault, not frontend env vars
# META_APP_SECRET=your_meta_app_secret
# GOOGLE_ADS_CLIENT_SECRET=your_google_ads_secret
# OPENAI_API_KEY=your_openai_key
# CLOUDINARY_API_KEY=your_cloudinary_key

# ----------------------------------------
# Monitoring & Analytics
# ----------------------------------------
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/123456
VITE_VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# ----------------------------------------
# Development Tools
# ----------------------------------------
# Enable React Developer Tools
VITE_REACT_DEVTOOLS=true

# Enable debug logs
VITE_DEBUG=false
```

---

### 1.2 Environment-Specific Files

**Local Development (`.env.local`):**
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci...local_key
VITE_ENV=development
VITE_ENABLE_AI_ASSISTANT=true
VITE_DEBUG=true
```

**Staging (Vercel Environment Variables):**
```bash
VITE_SUPABASE_URL=https://staging-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...staging_anon_key
VITE_ENV=staging
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_ADS_MONITORING=true
```

**Production (Vercel Environment Variables):**
```bash
VITE_SUPABASE_URL=https://prod-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...prod_anon_key
VITE_ENV=production
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_ADS_MONITORING=true
VITE_ENABLE_PRAYER_REMINDERS=true
VITE_ENABLE_MOCKUP_PREVIEWS=true
```

---

## 2. GitHub Actions Workflows

### 2.1 PR Checks Workflow

**File:** `.github/workflows/pr-checks.yml`

```yaml
name: PR Checks

on:
  pull_request:
    branches: [main, staging, develop]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier check
        run: npm run format:check
      
      - name: TypeScript type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
          VITE_ENV: staging
      
      - name: Check bundle size
        run: |
          SIZE=$(du -sk dist | cut -f1)
          echo "Bundle size: ${SIZE}KB"
          if [ $SIZE -gt 500 ]; then
            echo "❌ Bundle too large: ${SIZE}KB (max 500KB)"
            exit 1
          fi
          echo "✅ Bundle size OK: ${SIZE}KB"

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

### 2.2 Deploy to Staging Workflow

**File:** `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
          VITE_ENV: staging
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: staging.ninjagenzy.com
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://staging.ninjagenzy.com
      
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Staging deployed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment*\n:rocket: <https://staging.ninjagenzy.com|staging.ninjagenzy.com>\nCommit: ${{ github.sha }}\nAuthor: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

### 2.3 Deploy to Production Workflow

**File:** `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires approval (optional)
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.PROD_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.PROD_SUPABASE_ANON_KEY }}
          VITE_ENV: production
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
      
      - name: Upload source maps to Sentry
        run: npx @sentry/cli releases files ${{ github.sha }} upload-sourcemaps ./dist --url-prefix '~/'
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ninjagenzy
          SENTRY_PROJECT: ninjagenzy-frontend
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: app.ninjagenzy.com
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://app.ninjagenzy.com
      
      - name: Monitor error rate
        run: |
          sleep 60
          # TODO: Check Sentry API for error spike
          # If error rate > 2%, trigger rollback
      
      - name: Notify Slack (Success)
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚀 Production deployed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment*\n:white_check_mark: <https://app.ninjagenzy.com|app.ninjagenzy.com>\nVersion: ${{ github.ref_name }}\nAuthor: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 3. Vercel Configuration

**File:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.aladhan.com https://graph.facebook.com https://googleads.googleapis.com;"
        }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/home",
      "destination": "/dashboard",
      "permanent": true
    }
  ],
  
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-project-ref.supabase.co/rest/v1/:path*"
    }
  ],
  
  "env": {
    "VITE_ENV": "production"
  },
  
  "regions": ["iad1"]
}
```

---

## 4. Supabase Configuration

**File:** `supabase/config.toml`

```toml
# Supabase local development configuration

project_id = "your-project-ref"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323
api_url = "http://localhost"

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://localhost:5173"
additional_redirect_urls = ["https://localhost:5173"]
jwt_expiry = 604800  # 7 days
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[auth.external.google]
enabled = false
client_id = ""
secret = ""

[realtime]
enabled = true
```

---

## 5. Code Quality Tools

### 5.1 ESLint Configuration

**File:** `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['react-refresh', '@typescript-eslint', 'import'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error'
  },
  settings: {
    react: { version: 'detect' }
  }
};
```

---

### 5.2 Prettier Configuration

**File:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 6. Git Hooks

### 6.1 Husky Pre-Commit Hook

**Setup:**
```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**File:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

---

### 6.2 Lint-Staged Configuration

**File:** `.lintstagedrc.json`

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

---

## 7. Package.json Scripts

**File:** `package.json` (partial)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",
    
    "type-check": "tsc --noEmit",
    
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:smoke": "playwright test",
    
    "prepare": "husky install"
  }
}
```

---

## 8. Next Steps

- [ ] Copy `.env.example` to `.env.local` and fill in values
- [ ] Set up GitHub Secrets (Vercel tokens, Supabase keys)
- [ ] Configure Vercel project settings
- [ ] Set up Slack webhook for deployment notifications
- [ ] Install Husky and configure pre-commit hooks
- [ ] Test CI/CD pipeline with feature branch
- [ ] Document secret rotation schedule (90 days)

---

## 9. References

- [Vercel Configuration](https://vercel.com/docs/project-configuration)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Development Standards Document](file:///e:/docs/docs/Technical%20Documentation/Development-Standards-Document.md)

---

## 10. Changelog

- **v1.0** (2026-01-24): Initial configuration files
  - Environment variable template with all required keys
  - GitHub Actions workflows (PR checks, staging/production deployment)
  - Vercel configuration with security headers
  - Supabase local development config
  - ESLint and Prettier configurations
  - Husky pre-commit hooks setup
  - Package.json scripts for development workflow
