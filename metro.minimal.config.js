const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Minimal configuration to reduce file watchers
config.watchFolders = [__dirname]; // Only watch the root directory
config.maxWorkers = 1;

// Exclude as many directories as possible
config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/node_modules\/.*\/node_modules\/.*/,
  /.*\/scripts\/.*/,
  /.*\/utils\/__tests__\/.*/,
  /.*\/\.git\/.*/,
  /.*\/\.expo\/.*/,
];

// Disable some watchers
config.resetCache = true;

module.exports = config;