const { getDefaultConfig } = require('expo/metro-config');

// Simplified Metro config for web builds
const config = getDefaultConfig(__dirname);

// Minimal configuration for web export
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Disable custom serializer to avoid source map issues
config.serializer = {
  ...config.serializer,
  customSerializer: null,
};

// Disable source maps for web builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    sourceMap: false,
  },
};

module.exports = config;