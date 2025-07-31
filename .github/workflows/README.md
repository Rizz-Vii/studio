# Performance Branch Testing Workflow

This GitHub Actions workflow provides automated testing and deployment for the `workshop/performance` branch.

## 🚀 **Automatic Triggers**

The workflow runs automatically when:

- You push commits to the `workshop/performance` branch  
- You can also trigger it manually via GitHub Actions UI

## 🎯 **What It Does**

### 1. **Test Build**

- Runs TypeScript type checking
- Executes ESLint for code quality
- Builds the Next.js application
- Analyzes bundle size for performance insights

### 2. **Deploy Preview**

- Creates a dedicated Firebase Hosting channel: `performance-testing`
- Deploys your branch to a unique URL (expires in 7 days)
- Optionally deploys Firebase Functions (manual trigger only)

### 3. **Performance Tests**

- Runs Playwright tests focused on performance metrics
- Tests mobile responsiveness and UX
- Generates test reports and screenshots

### 4. **Results Summary**

- Creates a comprehensive deployment summary
- Shows test results and deployment status
- Provides links to preview URLs and test artifacts

## 📱 **Preview URLs**

Your deployed branch will be available at:

```
https://rankpilot-h3jpc--performance-testing-[UNIQUE-ID].web.app
```

## 🧪 **Running Performance Tests Locally**

```bash
# Run performance-focused tests
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
