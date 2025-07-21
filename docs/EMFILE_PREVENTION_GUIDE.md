# EMFILE Error Prevention & Recovery Guide

## 🚨 Understanding EMFILE Errors

The **EMFILE** error (`"Error: too many open files"`) occurs when your system reaches its limit for the number of files that can be open simultaneously. In Windows development environments, this commonly affects VS Code and Node.js applications like Next.js.

### Common Error Messages

```
EMFILE: too many open files, open 'c:\Users\[user]\.vscode\extensions\github.copilot-chat-0.29.1\dist\tikTokenizerWorker.js'
Error: ENOSPC: System limit for number of file watchers reached
Too many open files in system
```

### Root Causes

1. **File Watcher Accumulation**: VS Code and development tools create many file watchers
2. **Extension Overhead**: Complex extensions (like GitHub Copilot) can consume many file handles
3. **Node.js Process Leaks**: Orphaned Node.js processes that don't release file handles
4. **Development Cache Buildup**: Temporary files and caches consuming file descriptors
5. **Insufficient System Limits**: Default Windows file handle limits being exceeded

---

## 🛠️ Immediate Solutions

### Quick Fix (Emergency)

```powershell
# Run the fix script immediately
npm run emfile:fix
```

Or manually:

```powershell
# 1. Close VS Code completely
# 2. Kill all Node.js processes
taskkill /f /im node.exe
taskkill /f /im Code.exe

# 3. Clear development caches
rmdir /s .next
rmdir /s node_modules\.cache

# 4. Restart VS Code
```

### Status Check

```powershell
# Check current file handle usage
npm run emfile:check
```

This will show:

- VS Code process handle count
- Node.js process handle count
- System total handles
- Status assessment (HEALTHY/WARNING/CRITICAL)

---

## 🔄 Automated Solutions

### 1. Monitoring Mode

Start continuous monitoring to catch issues early:

```powershell
# Basic monitoring
npm run emfile:monitor

# Verbose monitoring (shows all checks)
npm run emfile:monitor:verbose
```

**What it does:**

- Checks handle counts every 30 seconds
- Automatically clears caches after 3 consecutive warnings
- Logs all activity to `logs/emfile-monitor.log`
- Prevents issues before they become critical

### 2. Preventive Maintenance

Run regular preventive maintenance:

```powershell
# Daily preventive maintenance
npm run emfile:preventive
```

**What it does:**

- Clears development caches
- Applies Windows optimizations
- Sets high-performance power plan
- Optimizes virtual memory settings

### 3. Comprehensive Fix

When experiencing issues:

```powershell
# Full diagnostic and fix
npm run emfile:fix
```

**What it does:**

- Shows detailed handle report
- Stops leaky processes (with confirmation)
- Clears all development caches
- Applies system optimizations
- Shows before/after comparison

---

## ⚙️ Prevention Configuration

### VS Code Settings Applied

The workspace now includes optimized settings in `.vscode/settings.json`:

```jsonc
{
  // File watching exclusions (reduces handle usage)
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true,
    "**/dist/**": true,
    "**/.cache/**": true,
    "**/logs/**": true,
  },

  // Performance optimizations
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false,
  "npm.fetchOnlinePackageInfo": false,
  "telemetry.telemetryLevel": "off",

  // Memory optimization
  "terminal.integrated.env.windows": {
    "NODE_OPTIONS": "--max-old-space-size=8192",
  },
}
```

### Next.js Optimizations

The project's `next.config.ts` includes Windows-specific optimizations:

```typescript
experimental: {
  webpackBuildWorker: true,
  esmExternals: true,
  workerThreads: true,
  optimizePackageImports: [
    "@radix-ui/react-icons",
    "lucide-react",
    "framer-motion"
  ]
}
```

---

## 📊 Monitoring & Thresholds

### Handle Count Thresholds

| Status   | VS Code Handles | Node.js Handles | Action Required   |
| -------- | --------------- | --------------- | ----------------- |
| HEALTHY  | < 8,000         | < 5,000         | None              |
| WARNING  | 8,000 - 15,000  | 5,000 - 10,000  | Monitor closely   |
| CRITICAL | > 15,000        | > 10,000        | Immediate cleanup |

### Automated Actions

- **Warning Level**: Log warnings, continue monitoring
- **Critical Level**: Automatic cache clearing
- **Multiple Warnings**: Process termination recommendations

---

## 🔧 Manual Troubleshooting

### 1. Identify Handle-Heavy Processes

```powershell
# View top handle consumers
Get-Process | Sort-Object HandleCount -Descending | Select-Object -First 10 Name, HandleCount, Id
```

### 2. Check Specific Process Handles

```powershell
# Check VS Code handles
(Get-Process -Name "Code" | Measure-Object -Property HandleCount -Sum).Sum

# Check Node.js handles
(Get-Process -Name "node" | Measure-Object -Property HandleCount -Sum).Sum
```

### 3. Force Process Cleanup

```powershell
# Stop all VS Code processes
Get-Process -Name "Code" | Stop-Process -Force

# Stop orphaned Node.js processes
Get-Process -Name "node" | Where-Object { $_.HandleCount -gt 1000 } | Stop-Process -Force
```

### 4. Clear All Development Caches

```powershell
# Project caches
Remove-Item -Recurse -Force .next, node_modules\.cache -ErrorAction SilentlyContinue

# System temp caches
Remove-Item -Recurse -Force $env:TEMP\next-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:LOCALAPPDATA\npm-cache -ErrorAction SilentlyContinue
```

---

## 🚀 Performance Optimization

### 1. Windows System Optimization

```powershell
# Set high performance power plan
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Optimize virtual memory (adjust based on your RAM)
# Recommended: Initial = RAM in MB, Maximum = 2x RAM in MB
```

### 2. Development Environment

```powershell
# Optimize filesystem performance
npm run optimize-windows

# Benchmark current performance
npm run optimize-windows:benchmark
```

### 3. Node.js Memory Settings

The project automatically sets optimal Node.js memory limits:

- **Development**: 3GB (`--max-old-space-size=3072`)
- **Build**: 8GB (`--max-old-space-size=8192`)
- **Testing**: 2GB (`--max-old-space-size=2048`)

---

## 📋 Daily Workflow Integration

### Morning Startup

```powershell
# 1. Run preventive maintenance
npm run emfile:preventive

# 2. Check current status
npm run emfile:check

# 3. Start monitoring (optional)
npm run emfile:monitor
```

### During Development

- Monitor for VS Code performance degradation
- Watch for "slow filesystem" warnings in Next.js
- Run `npm run emfile:check` if you notice slowdowns

### End of Day

```powershell
# Clean up before shutdown
npm run clean
npm run emfile:preventive
```

---

## 🔍 Troubleshooting Common Scenarios

### Scenario 1: VS Code Becomes Unresponsive

```powershell
# 1. Check handle count
npm run emfile:check

# 2. If critical, force fix
npm run emfile:fix

# 3. Restart VS Code
```

### Scenario 2: Next.js Dev Server Won't Start

```powershell
# 1. Clear caches
npm run clean

# 2. Run preventive maintenance
npm run emfile:preventive

# 3. Start with clean environment
npm run dev
```

### Scenario 3: GitHub Copilot Extension Issues

```powershell
# 1. Check VS Code handles
npm run emfile:check

# 2. If high, restart VS Code processes
taskkill /f /im Code.exe

# 3. Restart VS Code and re-enable Copilot
```

### Scenario 4: Build Process Fails

```powershell
# 1. Clear all caches
npm run clean

# 2. Fix any handle issues
npm run emfile:fix

# 3. Run optimized build
npm run build:production
```

---

## 📈 Success Metrics

### Before Optimization (Typical Issues)

- Handle counts: 15,000+ (Critical)
- Build time: 5+ minutes
- VS Code responsiveness: Poor
- Development server startup: 30+ seconds

### After Optimization (Target Performance)

- Handle counts: < 8,000 (Healthy)
- Build time: < 2 minutes
- VS Code responsiveness: Excellent
- Development server startup: < 10 seconds

---

## 🆘 Emergency Recovery

If the system becomes completely unresponsive:

1. **Force restart the computer**
2. **Run emergency script**: `npm run emfile:fix`
3. **Apply all optimizations**: `npm run optimize-windows`
4. **Clear all caches**: `npm run clean`
5. **Start monitoring**: `npm run emfile:monitor`

---

## 📚 Related Documentation

- [Windows Performance Optimization Guide](./WINDOWS_PERFORMANCE_OPTIMIZATION.md)
- [Project Status & Next Steps](./PROJECT_STATUS_AND_NEXT_STEPS.md)
- [Comprehensive Instructions](./COMPREHENSIVE_INSTRUCTIONS.md)

---

## 🔄 Script Reference

| Script                      | Purpose                    | Usage                 |
| --------------------------- | -------------------------- | --------------------- |
| `npm run emfile:check`      | Show current handle status | Daily monitoring      |
| `npm run emfile:fix`        | Fix current issues         | When problems occur   |
| `npm run emfile:monitor`    | Continuous monitoring      | Background prevention |
| `npm run emfile:preventive` | Preventive maintenance     | Daily/weekly routine  |

---

**🎯 Key Takeaway**: EMFILE errors are preventable with proper monitoring, regular maintenance, and optimized development environment configuration. The automated tools provided ensure you can both prevent and quickly recover from these issues.

---

_© 2025 RankPilot, Inc. All rights reserved._
