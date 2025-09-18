const { getDefaultConfig } = require('expo/metro-config');

// Get the default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// FIX FOR METRO SOURCE MAP ERROR
config.serializer = {
  ...config.serializer,
  customSerializer: undefined,
};

// Disable source maps for debug builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    sourceMap: false,
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Basic resolver
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
  sourceExts: [...config.resolver.sourceExts, 'tsx', 'ts', 'jsx', 'js', 'json'],
};

// Minimal configuration to reduce file system load
config.watchFolders = [];
config.maxWorkers = 1;

module.exports = config;