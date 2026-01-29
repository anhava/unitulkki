const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for uc.micro and markdown-it CommonJS modules
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs"];

module.exports = withNativeWind(config, { input: "./global.css" });
