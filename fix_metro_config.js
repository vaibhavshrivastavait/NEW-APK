const { getDefaultConfig } = require('expo/metro-config');

// Get the default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// Add additional resolver and transformer options for bundling issues
config.resolver = {
  ...config.resolver,
  // Ensure all platforms are resolved
  platforms: ['ios', 'android', 'native', 'web'],
  // Add extension resolution order
  sourceExts: [...config.resolver.sourceExts, 'tsx', 'ts', 'jsx', 'js', 'json'],
};

// Add transformer options to handle bundling
config.transformer = {
  ...config.transformer,
  // Enable minification for bundles
  minifierConfig: {
    ...config.transformer.minifierConfig,
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Add serializer options for bundle creation
config.serializer = {
  ...config.serializer,
  // Ensure proper bundle creation
  createModuleIdFactory: function () {
    return function (path) {
      // Use relative paths for module IDs
      return path.replace(__dirname, '').replace(/\\/g, '/');
    };
  },
};

module.exports = config;