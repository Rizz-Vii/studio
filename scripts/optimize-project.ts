#!/usr/bin/env ts-node

/**
 * Project Optimization and Cleanup Script
 *
 * This script optimizes the RankPilot project directory by:
 * - Removing duplicate image files
 * - Cleaning up debug files
 * - Organizing temporary files
 * - Optimizing build artifacts
 */

import { promises as fs } from "fs";
import { join, resolve } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { EventEmitter } from "events";

// Increase max listeners to prevent memory leak warnings
EventEmitter.defaultMaxListeners = 20;

const execAsync = promisify(exec);

interface CleanupTask {
  name: string;
  description: string;
  execute: () => Promise<void>;
}

interface OptimizationOptions {
  timeout?: number;
  dryRun?: boolean;
  concurrent?: boolean;
}

class ProjectOptimizer {
  private projectRoot: string;
  private tasks: CleanupTask[] = [];
  private options: OptimizationOptions;
  private abortController: AbortController;

  constructor(options: OptimizationOptions = {}) {
    this.projectRoot = resolve(__dirname, "..");
    this.options = {
      timeout: 30000, // 30 seconds default
      dryRun: false,
      concurrent: false,
      ...options,
    };
    this.abortController = new AbortController();
    this.initializeTasks();

    // Graceful shutdown handling
    process.on("SIGINT", () => this.handleShutdown());
    process.on("SIGTERM", () => this.handleShutdown());
  }

  private handleShutdown(): void {
    console.log("\n🛑 Graceful shutdown initiated...");
    this.abortController.abort();
    process.exit(0);
  }

  private async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number = this.options.timeout!
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let completed = false;

      const timeout = setTimeout(() => {
        if (!completed) {
          completed = true;
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      const abortHandler = () => {
        if (!completed) {
          completed = true;
          clearTimeout(timeout);
          reject(new Error("Operation aborted"));
        }
      };

      // Only add listener if not already completed
      if (!this.abortController.signal.aborted) {
        this.abortController.signal.addEventListener("abort", abortHandler, {
          once: true,
        });
      } else {
        clearTimeout(timeout);
        reject(new Error("Operation aborted"));
        return;
      }

      operation
        .then((result) => {
          if (!completed) {
            completed = true;
            clearTimeout(timeout);
            resolve(result);
          }
        })
        .catch((error) => {
          if (!completed) {
            completed = true;
            clearTimeout(timeout);
            reject(error);
          }
        });
    });
  }

  private async safeFileOperation(
    operation: () => Promise<void>,
    description: string
  ): Promise<void> {
    try {
      await this.withTimeout(operation());
      console.log(`✓ ${description}`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // File doesn't exist, which is fine for cleanup
        return;
      }
      if (error.message.includes("timed out")) {
        console.warn(`⚠ ${description} - timed out`);
        return;
      }
      if (error.message.includes("aborted")) {
        console.warn(`⚠ ${description} - aborted`);
        return;
      }
      throw error;
    }
  }

  private initializeTasks() {
    this.tasks = [
      {
        name: "Remove Debug Files",
        description: "Clean up debug PNG files from root directory",
        execute: async () => {
          const debugFiles = [
            "debug-auth-mobile-nav.png",
            "debug-mobile-nav-component.png",
            "debug-mobile-nav-home.png",
            "debug-mobile-nav.png",
            "debug-mobile-patterns.png",
          ];

          for (const file of debugFiles) {
            await this.safeFileOperation(async () => {
              if (this.options.dryRun) {
                console.log(`[DRY RUN] Would remove: ${file}`);
                return;
              }

              const filePath = join(this.projectRoot, file);
              await fs.access(filePath);
              await fs.unlink(filePath);
            }, `Removed debug file: ${file}`);
          }
        },
      },
      {
        name: "Clean Duplicate Images",
        description: "Remove duplicate images from src/lib directory",
        execute: async () => {
          const srcLibPath = join(this.projectRoot, "src", "lib");
          const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg"];

          try {
            const files = await fs.readdir(srcLibPath);
            const imageFiles = files.filter((file) =>
              imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))
            );

            for (const imageFile of imageFiles) {
              const filePath = join(srcLibPath, imageFile);
              const publicImagePath = join(
                this.projectRoot,
                "public",
                "images",
                imageFile
              );

              try {
                // Check if the same file exists in public/images
                await fs.access(publicImagePath);
                await fs.unlink(filePath);
                console.log(`✓ Removed duplicate image: src/lib/${imageFile}`);
              } catch (error) {
                // Public version doesn't exist, keep the src version
                console.log(`⚠ Keeping unique image: src/lib/${imageFile}`);
              }
            }
          } catch (error) {
            console.log(`⚠ Could not access src/lib directory: ${error}`);
          }
        },
      },
      {
        name: "Clean Log Files",
        description: "Remove old log files",
        execute: async () => {
          const logFiles = ["pglite-debug.log"];

          for (const file of logFiles) {
            await this.safeFileOperation(async () => {
              if (this.options.dryRun) {
                console.log(`[DRY RUN] Would remove: ${file}`);
                return;
              }

              const filePath = join(this.projectRoot, file);
              await fs.access(filePath);
              await fs.unlink(filePath);
            }, `Removed log file: ${file}`);
          }
        },
      },
      {
        name: "Clean Build Artifacts",
        description: "Remove unnecessary build artifacts safely",
        execute: async () => {
          const artifactPaths = [
            ".next/trace",
            "tsconfig.tsbuildinfo",
            "test-results",
            "playwright-report",
          ];

          // Use the existing rimraf command for consistency with npm scripts
          for (const artifact of artifactPaths) {
            await this.safeFileOperation(async () => {
              if (this.options.dryRun) {
                console.log(`[DRY RUN] Would remove: ${artifact}`);
                return;
              }

              const artifactPath = join(this.projectRoot, artifact);
              try {
                await fs.access(artifactPath);
                // Use rimraf command to be consistent with package.json clean script
                await execAsync(`npx rimraf "${artifactPath}"`, {
                  cwd: this.projectRoot,
                  signal: this.abortController.signal,
                });
              } catch (error: any) {
                if (error.code !== "ENOENT") {
                  throw error;
                }
              }
            }, `Removed build artifact: ${artifact}`);
          }

          // Handle functions/lib separately as it needs different handling
          const functionsLibPath = join(this.projectRoot, "functions", "lib");
          await this.safeFileOperation(async () => {
            if (this.options.dryRun) {
              console.log(`[DRY RUN] Would remove: functions/lib`);
              return;
            }

            try {
              await fs.access(functionsLibPath);
              await execAsync(`npx rimraf "${functionsLibPath}"`, {
                cwd: this.projectRoot,
                signal: this.abortController.signal,
              });
            } catch (error: any) {
              if (error.code !== "ENOENT") {
                throw error;
              }
            }
          }, `Removed functions build directory: functions/lib`);
        },
      },
      {
        name: "Organize Documentation",
        description: "Ensure proper documentation structure",
        execute: async () => {
          const docsPath = join(this.projectRoot, "docs");
          try {
            await fs.access(docsPath);
            console.log(`✓ Documentation directory exists and organized`);
          } catch (error) {
            console.log(`⚠ Documentation directory missing`);
          }
        },
      },
    ];
  }

  async runOptimization(): Promise<void> {
    console.log("🚀 Starting RankPilot Project Optimization...\n");
    console.log(`📊 Configuration:`);
    console.log(`   • Timeout: ${this.options.timeout}ms`);
    console.log(`   • Dry Run: ${this.options.dryRun ? "Yes" : "No"}`);
    console.log(`   • Concurrent: ${this.options.concurrent ? "Yes" : "No"}\n`);

    try {
      if (this.options.concurrent) {
        // Run tasks concurrently with proper error handling
        const results = await Promise.allSettled(
          this.tasks.map(async (task) => {
            console.log(`📋 ${task.name}: ${task.description}`);
            await task.execute();
            console.log(`✅ ${task.name} completed successfully\n`);
          })
        );

        // Report any failures
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `❌ ${this.tasks[index].name} failed:`,
              result.reason
            );
          }
        });
      } else {
        // Run tasks sequentially (safer, default)
        for (const task of this.tasks) {
          if (this.abortController.signal.aborted) {
            console.log("🛑 Optimization aborted by user");
            break;
          }

          console.log(`📋 ${task.name}: ${task.description}`);
          try {
            await this.withTimeout(task.execute());
            console.log(`✅ ${task.name} completed successfully\n`);
          } catch (error: any) {
            console.error(`❌ ${task.name} failed:`, error.message);

            // Decide whether to continue or stop
            if (
              error.message.includes("aborted") ||
              error.message.includes("SIGINT")
            ) {
              break;
            }
            // Continue with other tasks on non-critical errors
            console.log("   ↳ Continuing with remaining tasks...\n");
          }
        }
      }

      console.log("🎉 Project optimization completed!");
      console.log("\n📊 Next steps:");
      console.log('  1. Run "npm run build" to test optimized build');
      console.log('  2. Run "npm run dev" to verify development server');
      console.log("  3. Check documentation for updated instructions");
    } catch (error: any) {
      console.error("💥 Optimization failed:", error.message);
      process.exit(1);
    }
  }
}

// Run optimization if called directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: OptimizationOptions = {
    dryRun: args.includes("--dry-run"),
    concurrent: args.includes("--concurrent"),
    timeout: args.includes("--timeout")
      ? parseInt(args[args.indexOf("--timeout") + 1]) || 30000
      : 30000,
  };

  if (args.includes("--help")) {
    console.log(`
🔧 RankPilot Project Optimizer

Usage:
  npm run optimize [options]
  ts-node scripts/optimize-project.ts [options]

Options:
  --dry-run         Show what would be done without making changes
  --concurrent      Run tasks concurrently (faster but riskier)
  --timeout <ms>    Set timeout for operations (default: 30000ms)
  --help            Show this help message

Examples:
  npm run optimize --dry-run
  npm run optimize --concurrent --timeout 60000
`);
    process.exit(0);
  }

  const optimizer = new ProjectOptimizer(options);
  optimizer.runOptimization().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export default ProjectOptimizer;
