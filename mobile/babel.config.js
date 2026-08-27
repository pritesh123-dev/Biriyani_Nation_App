module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    // Reanimated 4 moved its Babel transform into react-native-worklets.
    plugins: ['react-native-worklets/plugin'],
  };
};
