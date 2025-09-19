const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web platform for better compatibility
config.resolver.platforms = ['ios', 'android', 'web', 'native'];

// Remove restrictive configurations that might cause issues
config.maxWorkers = 2;

module.exports = config;