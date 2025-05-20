#!/usr/bin/env bun
import { watch } from "fs";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const contractsDir = join(process.cwd(), "contracts");
const ignoredFiles = new Set([".DS_Store"]);

let debounceTimer: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function runCommand(command: string): Promise<void> {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    throw new Error(`Failed to run command: ${command}\n${error}`);
  }
}

async function handleContractChange() {
  if (isProcessing) return;
  
  try {
    isProcessing = true;
    console.log("🔄 Detected contract changes, rebuilding...");

    // 1. Compile contracts
    console.log("📝 Compiling contracts...");
    await runCommand("hardhat compile");

    // 2. Generate types
    console.log("🏗️ Generating contract types...");
    await runCommand("wagmi generate");

    // 3. Run local deployment if a node is running
    try {
      await execAsync("lsof -i :8545 -t");
      console.log("🚀 Deploying to local network...");
      await runCommand("hardhat run scripts/deploy.ts --network localhost");
    } catch {
      console.log("ℹ️ No local node running, skipping deployment");
    }

    console.log("✅ Contract changes processed successfully!");
  } catch (error) {
    console.error("❌ Error processing contract changes:", error);
  } finally {
    isProcessing = false;
  }
}

// Watch contracts directory
console.log("👀 Watching for contract changes...");
watch(contractsDir, { recursive: true }, (eventType, filename) => {
  if (!filename || ignoredFiles.has(filename)) return;
  if (!filename.endsWith(".sol")) return;

  // Debounce to prevent multiple rapid executions
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handleContractChange, 500);
});
