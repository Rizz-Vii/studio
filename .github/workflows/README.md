# 🚀 RankPilot GitHub Actions Workflows

## 📋 **Active Workflow Overview**

### **🎯 Feature/Performance Development Pipeline**
**File:** `feature-performance-ci-cd.yml`
**Purpose:** Comprehensive CI/CD for performance optimization features

**Triggers:**
- Push to `feature/performance-optimization-mobile-enhancement`
- Push to any `feature/performance-*` branches
- Pull requests to `master` or `preDeploy`

**Execution:** 7-stage validation with Core Web Vitals testing

---

### **🔄 Performance Auto-Deployment**
**File:** `performance-auto-deploy.yml`
**Purpose:** Automatic deployment to preDeploy after successful validation

**Triggers:**
- Successful completion of Feature/Performance CI/CD Pipeline

**Execution:** Fast-forward merge with deployment tagging

---

### **🛡️ Pre-Deployment Security & Quality Pipeline**
**File:** `pre-deployment-pipeline.yml`
**Purpose:** Enterprise-grade quality validation before production

**Triggers:**
- Push to `preDeploy` branch
- Pull requests to `preDeploy`

**Execution:** 8-stage comprehensive validation (security, performance, accessibility)

---

### **🏭 Production Deployment**
**File:** `production-deploy.yml`
**Purpose:** Production deployment to rankpilot-h3jpc.web.app

**Triggers:**
- Push to `master` branch
- Manual workflow dispatch

**Execution:** Firebase deployment with health checks

## 🔄 **Complete Development Flow**

```
1. Feature Development (feature/performance-*)
   ↓ (30-47 minutes)
2. Auto-Deploy to preDeploy
   ↓ (5-6 minutes)  
3. Pre-Deployment Validation
   ↓ (48-70 minutes)
4. Production Deployment
   ↓ (18-30 minutes)
```

**Total Time:** ~1.7-2.5 hours from feature to production

## 📊 **Quality Standards**

- **Performance:** 90% Lighthouse score minimum
- **Accessibility:** WCAG 2.1 AA compliance
- **Security:** Zero critical vulnerabilities
- **Core Web Vitals:** LCP ≤2.5s, CLS ≤0.1
- **Mobile:** 48px touch targets, responsive design

## 🚀 **Getting Started**

### **Performance Feature Development:**
```bash
# Work on performance branch
git checkout feature/performance-optimization-mobile-enhancement
git push origin feature/performance-optimization-mobile-enhancement
# → Triggers comprehensive CI/CD validation
```

### **Manual Production Deployment:**
```bash
# Trigger via GitHub Actions UI
# or push to master after preDeploy validation
git checkout master
git merge preDeploy
git push origin master
```

## 📈 **Monitoring & Reports**

All workflows generate comprehensive reports including:
- Performance metrics and Core Web Vitals
- Security audit results
- Test coverage and accessibility compliance
- Deployment status and health checks

View reports in GitHub Actions → Workflow runs → Artifacts
npm run test:performance

# Run mobile-specific tests
npm run test -- --grep="mobile"

# Run with UI for debugging
npm run test:ui
```

## 🔧 **Manual Deployment with Functions**

To deploy Firebase Functions along with the hosting:

1. Go to **Actions** tab in GitHub
2. Click **Deploy Performance Branch for Testing**
3. Click **Run workflow**
4. Check **Deploy Firebase Functions as well**
5. Click **Run workflow**

## 📊 **Monitoring Your Deployment**

### Performance Dashboard

- Navigate to `/performance-dashboard` in your deployed app
- Monitor real-time metrics and cache performance
- Check error rates and response times

### Test Results

- Check the **Actions** tab for test results
- Download test artifacts for detailed analysis
- Review mobile test screenshots

## 🎯 **Key Features Being Tested**

### Performance Optimizations

- ✅ Advanced timeout management (`src/lib/timeout.ts`)
- ✅ Performance monitoring (`src/lib/performance-monitor.ts`)
- ✅ AI response optimization (`src/lib/ai-optimizer.ts`)
- ✅ Smart caching system with 60%+ hit rate target

### Mobile Enhancements

- ✅ Mobile tool layouts (`src/components/mobile-tool-layout.tsx`)
- ✅ Enhanced loading states (`src/components/loading-state.tsx`)
- ✅ Touch-optimized interface (48px minimum touch targets)
- ✅ Responsive breadcrumb navigation

### User Experience

- ✅ Performance feedback system
- ✅ Educational loading tips
- ✅ Real-time progress tracking
- ✅ WCAG 2.1 AA compliance

## 🚨 **Performance Targets**

Your deployment will be tested against these targets:

- **Response time:** < 10 seconds for keyword suggestions
- **Cache hit rate:** > 60% for repeated queries
- **User satisfaction:** > 4.0/5.0 stars
- **Success rate:** > 95% for all operations
- **Mobile accessibility:** 100% WCAG 2.1 AA compliance

## 🔄 **Development Workflow**

1. **Make changes** to your performance optimization branch
2. **Push commits** → Workflow automatically triggers
3. **Monitor build** in GitHub Actions
4. **Test preview** using the generated URL
5. **Review results** in the GitHub Actions summary
6. **Iterate** based on performance metrics and test results

## 📝 **Next Steps**

After successful testing on this branch:

1. Merge to master for production deployment
2. Monitor production performance metrics
3. Apply learnings to other tool pages
4. Continue iterating based on user feedback

---

This workflow ensures your performance optimizations are thoroughly tested before reaching production! 🚀
