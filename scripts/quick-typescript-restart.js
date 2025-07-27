#!/usr/bin/env node
// Quick TypeScript restart utility
const { execSync } = require('child_process');
console.log('🔄 Quick TypeScript restart...');
try {
  execSync('rm -rf tsconfig.tsbuildinfo .tsbuildinfo 2>/dev/null || true');
  console.log('✅ TypeScript cache cleared - reload VS Code window');
} catch (e) {
  console.log('ℹ️  Restart completed');
}