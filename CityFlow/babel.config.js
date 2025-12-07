module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Acest plugin este OBLIGATORIU pentru ca meniul tău să meargă
      'react-native-reanimated/plugin',
    ],
  };
};