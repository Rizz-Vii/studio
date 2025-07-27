# 🎯 RankPilot Branch → URL Mapping (Crystal Clear)
*Updated: July 27, 2025*

## 🚀 **SIMPLE BRANCH TO URL MAPPING**

| Branch | What It Does | Where It Goes | URL | Purpose |
|--------|--------------|---------------|-----|---------|
| **master** | 🏭 **MAIN LIVE SITE** | Production | `rankpilot.com` | **Real users, real money** |
| **preDeploy** | 🔒 **Pre-production testing** | Staging | `staging.rankpilot.com` | **Final check before live** |
| **infrastructure/deployment-ready** | 🏗️ **Infrastructure testing** | Preview | `infra-{hash}.rankpilot.com` | **Test deployment system** |
| **feature/performance-*** | 🚀 **Performance testing** | Preview | `perf-{hash}.rankpilot.com` | **Test speed improvements** |
| **feature/hyperloop-*** | ⚡ **Hyperloop testing** | Preview | `feature-{hash}.rankpilot.com` | **Test instant deployment** |
| **feature/anything-else** | 🔧 **Regular features** | Preview | `feature-{hash}.rankpilot.com` | **Test new features** |

---

## 🎯 **THE ONLY URLS THAT MATTER**

### **🏭 Production (THE REAL SITE)**
```
rankpilot.com                    ← master branch (LIVE USERS)
```

### **🔒 Staging (Final Testing)**
```
staging.rankpilot.com           ← preDeploy branch (PRE-PRODUCTION)
```

### **🧪 Preview/Testing (Everything Else)**
```
{branch-type}-{hash}.rankpilot.com    ← ALL other branches (TESTING)
```

---

## 📋 **WHAT EACH BRANCH ACTUALLY DOES**

### **master → rankpilot.com**
- **THE LIVE SITE** that real users see
- Real database, real payments, real everything
- Only push here when you're 100% sure it works

### **preDeploy → staging.rankpilot.com**
- **Final testing** before going live
- Production-like setup but with test data
- Last chance to catch bugs before real users see them

### **infrastructure/deployment-ready → infra-{hash}.rankpilot.com**
- **Testing the deployment system itself**
- Making sure the CI/CD pipelines work
- Testing infrastructure changes

### **feature/performance-* → perf-{hash}.rankpilot.com**
- **Testing performance improvements**
- Core Web Vitals optimization
- Speed and mobile enhancements

### **feature/hyperloop-* → feature-{hash}.rankpilot.com**
- **Testing the hyperloop instant deployment**
- Just regular feature testing with fast deployment

### **feature/anything-else → feature-{hash}.rankpilot.com**
- **Testing new features**
- Bug fixes, UI changes, new functionality

---

## ⚡ **SIMPLE DEPLOYMENT COMMANDS**

### **🧪 Testing Changes (Preview)**
```bash
# Test any feature/bug fix/performance change
git push origin feature/your-branch-name
# → Goes to: feature-{hash}.rankpilot.com or perf-{hash}.rankpilot.com

# Test infrastructure changes
git push origin infrastructure/deployment-ready  
# → Goes to: infra-{hash}.rankpilot.com
```

### **🔒 Pre-Production Testing (Staging)**
```bash
# Final testing before live
git push origin preDeploy
# → Goes to: staging.rankpilot.com
```

### **🏭 Go Live (Production)**
```bash
# Push to real users
git push origin master
# → Goes to: rankpilot.com (THE REAL SITE)
```

---

## 🎯 **FORGET THE COMPLEXITY - HERE'S THE REALITY**

### **3 Simple Destinations:**
1. **Testing Stuff** → Various preview URLs (who cares about the exact URL?)
2. **Final Check** → staging.rankpilot.com  
3. **Real Site** → rankpilot.com

### **The Preview URLs Don't Matter Much:**
- They're just temporary testing links
- The exact URL format isn't important
- What matters is: "Is my change working?"

### **What Actually Matters:**
- ✅ Your changes work in preview
- ✅ Final staging test passes
- ✅ Push to master goes live

---

## 🚨 **EMERGENCY: "OH SHIT" PROCEDURE**

```bash
# Something broke on the live site!
git checkout -b hotfix/fix-the-disaster master
# Make your fix
git push origin hotfix/fix-the-disaster
# → Test at: hotfix-{hash}.rankpilot.com

# If it works, push to live immediately:
git checkout master
git merge hotfix/fix-the-disaster
git push origin master
# → Live fix at: rankpilot.com
```

---

## ✅ **BOTTOM LINE**

**Stop overthinking the URLs!**

- **master = rankpilot.com = THE REAL SITE**
- **preDeploy = staging.rankpilot.com = FINAL TEST**
- **Everything else = some-preview-url = TESTING**

The preview URL format doesn't matter - what matters is your code works before going live! 🎯
