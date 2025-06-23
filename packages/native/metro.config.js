// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

// Find the workspace root
const workspaceRoot = path.resolve(__dirname, "../..")
const projectRoot = __dirname

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
	// [Web-only]: Enables CSS support in Metro.
	// isCSSEnabled: true,
})

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot]

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(workspaceRoot, "node_modules"),
]

// 3. Force Metro to resolve (sub)dependencies only from the root node_modules
config.resolver.disableHierarchicalLookup = true

// Expo 49 issue: default metro config needs to include "mjs"
// https://github.com/expo/expo/issues/23180
config.resolver.sourceExts.push("mjs")

module.exports = config
