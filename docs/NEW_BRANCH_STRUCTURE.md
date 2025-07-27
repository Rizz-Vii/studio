# 🚀 RankPilot Refactored Branch Structure
*Updated: July 27, 2025*

## 🎯 **NEW CLEAN BRANCH STRUCTURE**

### **🔬 workshop/** - Development & Testing
- **workshop/performance** (was: feature/performance-optimization-mobile-enhancement)
- **workshop/deployment-ready** (was: infrastructure/deployment-ready)
- **workshop/any-other-feature** (for future development)

### **🔒 staging** - Pre-Production
- **preDeploy** → **staging** (rename for clarity)

### **🏭 production** - Live Site
- **master** → **master** (stays same, but PR-only)

---

## 📋 **BRANCH PURPOSE & WORKFLOW**

| Branch | Purpose | Deployment | Testing Level | Access |
|--------|---------|------------|---------------|--------|
| **workshop/performance** | Performance optimization & mobile enhancement | `workshop-perf-{hash}.rankpilot.com` | Hyperloop + Basic Tests | Push directly |
| **workshop/deployment-ready** | Infrastructure & deployment system testing | `workshop-deploy-{hash}.rankpilot.com` | Hyperloop + Comprehensive Tests | Push directly |
| **workshop/feature-name** | Any other development work | `workshop-{name}-{hash}.rankpilot.com` | Hyperloop + Lean Tests | Push directly |
| **staging** | Pre-production validation | `staging.rankpilot.com` | Production-level Tests | Push directly |
| **master** | Live production site | `rankpilot.com` | Full Production Tests | **PR ONLY** |

---

## ⚡ **WORKFLOW FLOW**

```mermaid
flowchart TD
    DEV[👩‍💻 Developer] --> WORKSHOP{Choose Workshop}
    
    WORKSHOP --> WP[🚀 workshop/performance]
    WORKSHOP --> WD[🏗️ workshop/deployment-ready]
    WORKSHOP --> WF[🔧 workshop/feature-name]
    
    WP --> WPT[⚡ Hyperloop + Basic Tests<br/>workshop-perf-{hash}.rankpilot.com]
    WD --> WDT[⚡ Hyperloop + Comprehensive Tests<br/>workshop-deploy-{hash}.rankpilot.com]
    WF --> WFT[⚡ Hyperloop + Lean Tests<br/>workshop-{name}-{hash}.rankpilot.com]
    
    WPT --> READY{Ready?}
    WDT --> READY
    WFT --> READY
    
    READY --> STAGING[🔒 staging]
    STAGING --> ST[🧪 Production-level Tests<br/>staging.rankpilot.com]
    
    ST --> PR[📋 Create PR to master]
    PR --> MASTER[🏭 master]
    MASTER --> PROD[🌐 rankpilot.com]
```

---

## 🎯 **DEPLOYMENT TARGETS**

### **🔬 Workshop Environment (Development)**
```bash
# Performance work
workshop-perf-{hash}.rankpilot.com       # workshop/performance

# Infrastructure work  
workshop-deploy-{hash}.rankpilot.com     # workshop/deployment-ready

# Feature work
workshop-{feature}-{hash}.rankpilot.com  # workshop/feature-name
```

### **🔒 Staging Environment (Pre-Production)**
```bash
staging.rankpilot.com                    # staging branch
```

### **🏭 Production Environment (Live)**
```bash
rankpilot.com                            # master branch (PR only)
```

---

## 📋 **WORKFLOW TRIGGERS**

### **🔬 Workshop Branches (Direct Push)**
```bash
# Performance optimization
git push origin workshop/performance
# Triggers: hyperloop + basic performance tests

# Infrastructure testing
git push origin workshop/deployment-ready  
# Triggers: hyperloop + comprehensive infrastructure tests

# Feature development
git push origin workshop/new-feature
# Triggers: hyperloop + lean tests
```

### **🔒 Staging (Direct Push)**
```bash
git push origin staging
# Triggers: production-level testing suite
```

### **🏭 Master (PR Only)**
```bash
# Create PR from staging to master
gh pr create --base master --head staging --title "Release: Production deployment"
# Triggers: full production deployment after PR approval
```

---

## ⚡ **SIMPLIFIED COMMANDS**

### **🔬 Workshop Development**
```bash
# Start performance work
git checkout -b workshop/performance
git push origin workshop/performance
# → workshop-perf-{hash}.rankpilot.com

# Start infrastructure work
git checkout -b workshop/deployment-ready  
git push origin workshop/deployment-ready
# → workshop-deploy-{hash}.rankpilot.com

# Start any feature
git checkout -b workshop/seo-optimization
git push origin workshop/seo-optimization
# → workshop-seo-{hash}.rankpilot.com
```

### **🔒 Staging Promotion**
```bash
# Promote from workshop to staging
git checkout staging
git merge workshop/performance  # or any workshop branch
git push origin staging
# → staging.rankpilot.com
```

### **🏭 Production Deployment**
```bash
# Create production release PR
gh pr create --base master --head staging \
  --title "Production Release: $(date +%Y-%m-%d)" \
  --body "Ready for production deployment"
# → Requires PR approval → rankpilot.com
```

---

## 🛡️ **BRANCH PROTECTION**

### **🔬 Workshop Branches**
- ✅ Direct push allowed
- ✅ Hyperloop deployment on push
- ✅ Automated testing
- ❌ No branch protection (rapid development)

### **🔒 Staging Branch**
- ✅ Direct push allowed  
- ✅ Production-level testing
- ✅ Merge from workshop branches
- ⚠️ Optional: Require status checks

### **🏭 Master Branch**
- ❌ Direct push **BLOCKED**
- ✅ PR required from staging only
- ✅ Required status checks
- ✅ Required reviews
- ✅ Full production testing

---

## 📊 **TESTING MATRIX**

| Branch Type | Test Suite | Duration | Coverage |
|-------------|------------|----------|----------|
| **workshop/performance** | Hyperloop + Basic + Performance | ~10-15 min | Performance, Mobile, Core |
| **workshop/deployment-ready** | Hyperloop + Comprehensive | ~20-30 min | Infrastructure, Security, Full |
| **workshop/feature-name** | Hyperloop + Lean | ~5-10 min | Critical path, Smoke tests |
| **staging** | Production-level | ~45-60 min | Full test suite, Security, Performance |
| **master** | Production + Health checks | ~15-20 min | Deployment validation, Smoke tests |

---

## 🎯 **ADVANTAGES OF NEW STRUCTURE**

### **🔬 Clear Development Space**
- All development work in `workshop/**`
- Easy to understand: "workshop = development"
- Flexible for any type of feature work

### **🔒 Clear Staging Process**
- `staging` branch = pre-production testing
- Production-like environment
- Final validation before live

### **🏭 Protected Production**
- `master` = live site (PR only)
- No accidental direct pushes
- Proper review process

### **⚡ Simplified Deployment**
- Workshop → rapid iteration
- Staging → final validation  
- Master → controlled release

This structure gives you rapid development in workshop branches, proper staging validation, and protected production deployment! 🚀
