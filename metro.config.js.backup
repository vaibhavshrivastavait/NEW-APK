const { getDefaultConfig } = require('expo/metro-config');

// Get the default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// FIX FOR METRO SOURCE MAP ERROR
// Resolves: TypeError: (0 , sourceMapString_1.default) is not a function
config.serializer = {
  ...config.serializer,
  customSerializer: undefined, // Disable problematic custom serializer
};

// Disable source maps for debug builds to avoid bundling errors
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    sourceMap: false, // Fix for sourceMapString error
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Enhanced resolver for better compatibility
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
  sourceExts: [...config.resolver.sourceExts, 'tsx', 'ts', 'jsx', 'js', 'json'],
};

module.exports = config;