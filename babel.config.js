module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxImportSource: '@emotion/react',
        jsxRuntime: 'automatic',
      }],
    ],
    plugins: [
      // Essential for modern JS support
      ['@babel/plugin-proposal-optional-chaining', { loose: false }],
      ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
      ['@babel/plugin-proposal-logical-assignment-operators'],
      // Existing plugins
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      // NOTE: react-native-reanimated/plugin must be listed last
      'react-native-reanimated/plugin',
    ]
  };
};