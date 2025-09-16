const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: env.mode || 'development',
    https: false,
  }, argv);
  
  // Simplify for emergent preview
  config.entry = './index.js';
  
  // Basic crypto polyfill
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('expo-crypto'),
    buffer: require.resolve('buffer'),
  };
  
  // Provide Buffer global
  config.plugins = [
    ...config.plugins,
    new (require('webpack')).ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ];
  
  return config;
};