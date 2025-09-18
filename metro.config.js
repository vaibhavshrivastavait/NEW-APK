const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Minimal config to avoid file watcher issues
config.resolver.blacklistRE = /(node_modules\/.*\/node_modules\/.*|__tests__\/.*|.*\/__tests__\/.*)/;
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Disable unnecessary features
config.serializer.customSerializer = undefined;
config.transformer.minifierConfig = { sourceMap: false };

// Limit watched folders
config.watchFolders = [
  path.resolve(__dirname, 'screens'),
  path.resolve(__dirname, 'components'),
  path.resolve(__dirname, 'utils'),
  path.resolve(__dirname, 'store'),
];
config.maxWorkers = 1;

module.exports = config;