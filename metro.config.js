/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/** Must use withNativeWind (not raw withCssInterop) — provides getCSSForPlatform for Tailwind CLI. */
module.exports = withNativeWind(config, { input: './global.css' });
