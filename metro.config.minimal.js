const { getDefaultConfig } = require('expo/metro-config');

// Minimal configuration to reduce resource usage
const config = getDefaultConfig(__dirname);

// Disable source maps completely
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    sourceMap: false,
  },
};

// Disable custom serializer
config.serializer = {
  ...config.serializer,
  customSerializer: null,
};

// Use minimal resolver
config.resolver = {
  ...config.resolver,
  platforms: ['web', 'ios', 'android'],
  alias: {},
};

// Disable file watching for web builds
config.watchFolders = [];

module.exports = config;