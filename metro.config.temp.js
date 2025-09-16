const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep original configuration but disable problematic features
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Only disable source maps but keep serializer for compatibility
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    sourceMap: false,
  },
};

module.exports = config;