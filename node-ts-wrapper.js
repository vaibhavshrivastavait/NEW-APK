#!/usr/bin/env node

// Wrapper script to handle TypeScript files in Expo autolinking
const { execSync } = require('child_process');
const path = require('path');

// Get the original arguments
const args = process.argv.slice(2);

// If this is trying to resolve a TypeScript file, handle it specially
if (args.length > 0 && args[0] === '--print') {
  const requirePath = args[1];
  
  // Handle expo-modules-core TypeScript files
  if (requirePath && requirePath.includes('expo-modules-core') && requirePath.includes('src/index.ts')) {
    // Return the compiled JavaScript version path instead
    const basePath = requirePath.replace('/src/index.ts', '');
    console.log(basePath);
    process.exit(0);
  }
}

// For all other cases, use the normal Node.js execution
try {
  const result = execSync(`node ${args.join(' ')}`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(result.trim());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}