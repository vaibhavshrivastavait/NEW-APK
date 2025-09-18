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

// FIX FOR CONTAINER FILE WATCHER LIMITS (ENOSPC)
// Configure Metro file-map to use polling and ignore node_modules
config.fileMap = {
  ...config.fileMap,
  useWatchman: false,
  useNodeWatcher: false,
};

// Reduce the number of watched files
config.watchFolders = [];

// Override the default watcher settings
config.server = {
  ...config.server,
  useGlobalHotkey: false,
};

module.exports = config;