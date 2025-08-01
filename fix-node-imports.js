#!/usr/bin/env node
// Quick fix for child_process imports in technical operations agents

const fs = require('fs');
const path = require('path');

const files = [
  'src/lib/agents/technical-operations/typescript-guardian.ts',
  'src/lib/agents/technical-operations/production-deployment.ts', 
  'src/lib/agents/technical-operations/testing-orchestrator.ts'
];

files.forEach(file => {
  console.log(`Fixing ${file}...`);
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace direct imports with conditional server-side imports
  content = content.replace(
    /import \{ exec \} from 'child_process';?\n?/g, 
    ''
  );
  
  content = content.replace(
    /import \* as fs from 'fs\/promises';?\n?/g,
    ''
  );
  
  content = content.replace(
    /import \* as path from 'path';?\n?/g,
    ''
  );
  
  content = content.replace(
    /import \{ promisify \} from 'util';?\n?/g,
    ''
  );
  
  content = content.replace(
    /const execAsync = promisify\(exec\);?\n?/g,
    ''
  );
  
  // Add server-side only imports at the top after the comments
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find where to insert (after initial comments)
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('//') && !lines[i].startsWith('/*') && !lines[i].startsWith('*') && lines[i].trim() !== '') {
      insertIndex = i;
      break;
    }
  }
  
  const serverImports = `
// Server-side only imports
let execAsync: any = null;
let fs: any = null;
let path: any = null;
if (typeof window === 'undefined') {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  execAsync = promisify(exec);
  fs = require('fs/promises');
  path = require('path');
}
`;
  
  lines.splice(insertIndex, 0, serverImports);
  content = lines.join('\n');
  
  fs.writeFileSync(file, content);
  console.log(`✅ Fixed ${file}`);
});

console.log('🚀 All technical operations files fixed!');
