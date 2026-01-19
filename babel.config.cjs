// FILE: babel.config.cjs
// PURPOSE: Final AAA+ configuration for Expo 54 and Reanimated 4.

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // This internally includes worklets now
    ],
  };
};