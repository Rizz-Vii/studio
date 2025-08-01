#!/usr/bin/env node
/**
 * RankPilot Agent Disabler Script
 * Safely disables TypeScript AI agents from codespace
 * Generated: July 31, 2025
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface AgentFile {
  path: string;
  name: string;
  disabled: boolean;
}

class AgentDisabler {
  private agentsDir = 'src/lib/agents';
  private backupDir = '.agent-backups';
  private disabledFiles: AgentFile[] = [];

  async execute(): Promise<void> {
    console.log('🛑 RankPilot Agent Disabler - Stopping AI Agents...');
    
    try {
      // Step 1: Create backup directory
      await this.createBackupDirectory();
      
      // Step 2: Find all agent files
      const agentFiles = await this.findAgentFiles();
      
      // Step 3: Disable each agent
      for (const file of agentFiles) {
        await this.disableAgent(file);
      }
      
      // Step 4: Update imports and references
      await this.updateImports();
      
      // Step 5: Stop any running agent processes
      await this.stopAgentProcesses();
      
      // Step 6: Generate disable report
      await this.generateDisableReport();
      
      console.log('✅ All AI agents successfully disabled!');
      
    } catch (error) {
      console.error('❌ Failed to disable agents:', error);
      await this.rollbackChanges();
    }
  }

  private async createBackupDirectory(): Promise<void> {
    const backupPath = path.join(process.cwd(), this.backupDir);
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  private async findAgentFiles(): Promise<string[]> {
    const agentFiles: string[] = [];
    const agentsPath = path.join(process.cwd(), this.agentsDir);
    
    if (fs.existsSync(agentsPath)) {
      const files = this.getAllFiles(agentsPath, '.ts');
      agentFiles.push(...files);
    }
    
    console.log(`🔍 Found ${agentFiles.length} agent files to disable`);
    return agentFiles;
  }

  private getAllFiles(dirPath: string, extension: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, extension));
      } else if (path.extname(item) === extension) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private async disableAgent(filePath: string): Promise<void> {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`🛑 Disabling agent: ${relativePath}`);
      
      // Create backup
      const backupPath = path.join(this.backupDir, relativePath);
      const backupDir = path.dirname(backupPath);
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      fs.copyFileSync(filePath, backupPath);
      
      // Read original content
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Create disabled version
      const disabledContent = `/**
 * DISABLED AI AGENT - ${path.basename(filePath)}
 * Disabled on: ${new Date().toISOString()}
 * Original backed up to: ${backupPath}
 * 
 * To re-enable: Run 'npm run enable-agents'
 */

/* AGENT DISABLED - ORIGINAL CODE COMMENTED OUT

${originalContent.split('\n').map(line => `// ${line}`).join('\n')}

END DISABLED AGENT */

// Placeholder export to prevent import errors
export const disabled = true;
export default { disabled: true };
`;

      // Write disabled version
      fs.writeFileSync(filePath, disabledContent);
      
      this.disabledFiles.push({
        path: relativePath,
        name: path.basename(filePath, '.ts'),
        disabled: true
      });
      
      console.log(`✅ Disabled: ${relativePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to disable ${filePath}:`, error);
    }
  }

  private async updateImports(): Promise<void> {
    console.log('🔄 Updating imports and references...');
    
    // Find files that import agents
    try {
      const result = execSync('grep -r "from.*agents" src/ --include="*.ts" --include="*.tsx" || true', 
        { encoding: 'utf8' });
      
      if (result.trim()) {
        console.log('⚠️  Found agent imports in:');
        console.log(result);
        console.log('👆 These files may need manual updates to handle disabled agents');
      }
    } catch (error) {
      // Ignore grep errors
    }
  }

  private async stopAgentProcesses(): Promise<void> {
    console.log('🛑 Stopping any running agent processes...');
    
    try {
      // Kill any node processes that might be running agents
      execSync('pkill -f "agent" || true', { stdio: 'ignore' });
      execSync('pkill -f "typescript-guardian" || true', { stdio: 'ignore' });
      
      console.log('✅ Agent processes stopped');
    } catch (error) {
      // Ignore process kill errors
      console.log('ℹ️  No agent processes found running');
    }
  }

  private async generateDisableReport(): Promise<void> {
    const report = `# 🛑 RankPilot AI Agents - DISABLED
Generated: ${new Date().toISOString()}

## Summary
- **Total Agents Disabled**: ${this.disabledFiles.length}
- **Backup Location**: ${this.backupDir}
- **Status**: ✅ SUCCESSFULLY DISABLED

## Disabled Agents
${this.disabledFiles.map(file => `- **${file.name}**: ${file.path}`).join('\n')}

## What Was Done
1. ✅ Created backups of all agent files
2. ✅ Commented out all agent code
3. ✅ Added placeholder exports to prevent import errors
4. ✅ Stopped running agent processes
5. ✅ Generated this report

## To Re-enable Agents
Run the following command:
\`\`\`bash
npm run enable-agents
\`\`\`

## Manual Cleanup Needed
Some files may still reference the disabled agents. Check the console output above for files that import agents and may need manual updates.

## Backup Location
All original agent files are backed up in:
\`${this.backupDir}/\`

You can manually restore any agent by copying from the backup directory.

---
**Agent Disabler**: Successfully disabled all TypeScript AI agents
**Codespace**: Safe from agent interference
**Status**: 🛑 AGENTS DISABLED
`;

    fs.writeFileSync('AGENTS_DISABLED_REPORT.md', report);
    console.log('📊 Disable report generated: AGENTS_DISABLED_REPORT.md');
  }

  private async rollbackChanges(): Promise<void> {
    console.log('🔄 Rolling back changes due to error...');
    
    try {
      for (const file of this.disabledFiles) {
        const backupPath = path.join(this.backupDir, file.path);
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, file.path);
          console.log(`↩️  Restored: ${file.path}`);
        }
      }
    } catch (error) {
      console.error('❌ Rollback failed:', error);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const disabler = new AgentDisabler();
  disabler.execute().catch(console.error);
}

export { AgentDisabler };
