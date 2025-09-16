/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { getDefaultConfig: getExpoDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

// Get the default Expo config
const expoConfig = getExpoDefaultConfig(__dirname);

// Get the default React Native config
const rnConfig = getDefaultConfig(__dirname);

// Merge the configs
const config = mergeConfig(expoConfig, rnConfig);

// Add router root for Expo Router
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
};

module.exports = config;