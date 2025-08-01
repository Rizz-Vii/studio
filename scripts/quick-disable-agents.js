#!/usr/bin/env node
/**
 * Quick Agent Disabler - Simple approach
 * Immediately disables all AI agents
 */

const fs = require('fs');
const path = require('path');

console.log('🛑 Quick Agent Disable - Stopping all AI agents...');

// 1. Rename agents directory to disable it
const agentsDir = 'src/lib/agents';
const disabledDir = 'src/lib/agents.DISABLED';

if (fs.existsSync(agentsDir)) {
  if (fs.existsSync(disabledDir)) {
    console.log('🗑️  Removing existing disabled agents...');
    fs.rmSync(disabledDir, { recursive: true, force: true });
  }
  
  console.log('📁 Renaming agents directory to disable...');
  fs.renameSync(agentsDir, disabledDir);
  console.log('✅ Agents directory disabled');
}

// 2. Create placeholder agents directory
fs.mkdirSync(agentsDir, { recursive: true });

// 3. Create placeholder files to prevent import errors
const placeholderContent = `/**
 * AGENTS DISABLED - Placeholder file
 * Disabled on: ${new Date().toISOString()}
 * 
 * To re-enable: 
 * 1. Delete this directory: src/lib/agents
 * 2. Rename: src/lib/agents.DISABLED -> src/lib/agents
 */

export const disabled = true;
export default { disabled: true };
`;

// Create core placeholder
fs.mkdirSync(path.join(agentsDir, 'core'), { recursive: true });
fs.writeFileSync(path.join(agentsDir, 'core/AgentFramework.ts'), placeholderContent);

// Create main index
fs.writeFileSync(path.join(agentsDir, 'index.ts'), placeholderContent);

console.log('✅ Placeholder files created');

// 4. Kill any running processes
try {
  require('child_process').execSync('pkill -f "typescript-guardian" || true', { stdio: 'ignore' });
  require('child_process').execSync('pkill -f "agent" || true', { stdio: 'ignore' });
  console.log('✅ Agent processes stopped');
} catch (error) {
  console.log('ℹ️  No agent processes found');
}

console.log(`
🎉 ALL AI AGENTS SUCCESSFULLY DISABLED!

📁 Original agents moved to: ${disabledDir}
🔧 Placeholder files created to prevent errors

To re-enable agents:
1. rm -rf ${agentsDir}
2. mv ${disabledDir} ${agentsDir}

Status: 🛑 AGENTS DISABLED - Codespace is safe!
`);
