#!/usr/bin/env bun
/**
 * This script helps to create a new changeset for the monorepo
 * It prompts for which packages are being changed and the type of change
 * Usage: bun scripts/create-changeset.ts
 */

import { execSync } from "child_process";
import { input, select, confirm } from "@inquirer/prompts";

const packages = [
  "@fun-pump/smart-contract",
  "@fun-pump/web"
];

const changeTypes = [
  { name: "major - Breaking changes", value: "major" },
  { name: "minor - New features, no breaking changes", value: "minor" },
  { name: "patch - Bug fixes, no breaking changes", value: "patch" }
];

async function main() {
  console.log("🦋 Create a new changeset\n");
  
  // Select packages
  const selectedPackages = [];
  
  for (const pkg of packages) {
    const shouldInclude = await confirm({
      message: `Include ${pkg}?`,
      default: false
    });
    
    if (shouldInclude) {
      selectedPackages.push(pkg);
    }
  }
  
  if (selectedPackages.length === 0) {
    console.log("❌ No packages selected. Exiting.");
    process.exit(0);
  }
  
  // Get change type for each selected package
  const packageChanges: Record<string, string> = {};
  
  for (const pkg of selectedPackages) {
    const changeType = await select({
      message: `Change type for ${pkg}:`,
      choices: changeTypes
    });
    
    packageChanges[pkg] = changeType;
  }
  
  // Get summary and description
  const summary = await input({
    message: "Summary of changes (appears in changelog):",
  });
  
  console.log("\nEnter detailed description (optional, press Enter twice to finish):");
  
  const description = await new Promise((resolve) => {
    let result = "";
    
    process.stdin.on("data", (data) => {
      const input = data.toString();
      
      if (input === "\n" && result.endsWith("\n")) {
        process.stdin.removeAllListeners("data");
        resolve(result.trim());
      } else {
        result += input;
      }
    });
  });
  
  // Create changeset
  let changesetContents = summary + "\n\n" + description + "\n\n";
  
  for (const [pkg, type] of Object.entries(packageChanges)) {
    changesetContents += `'${pkg}': ${type}\n`;
  }
  
  // Execute changeset command
  try {
    // Write to temp file
    const tempFile = `.changeset-temp-${Date.now()}.md`;
    Bun.write(tempFile, changesetContents);
    
    execSync(`bun changeset add --empty`, { stdio: "inherit" });
    
    // Get the name of the newly created changeset file
    const changesetFiles = execSync("find .changeset -name '*.md' -not -name 'README.md'")
      .toString()
      .trim()
      .split("\n")
      .filter(file => !file.includes("CHANGELOG"));
    
    const latestChangeset = changesetFiles[changesetFiles.length - 1];
    
    if (!latestChangeset) {
      throw new Error("No changeset file was created");
    }
    
    // Replace contents with our formatted content
    Bun.write(latestChangeset, changesetContents);
    
    // Cleanup
    execSync(`rm ${tempFile}`);
    
    console.log(`\n✅ Changeset created successfully: ${latestChangeset}`);
  } catch (error) {
    console.error("❌ Error creating changeset:", error);
  }
}

main().catch(console.error);
