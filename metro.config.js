// Sentry's Expo metro config adds debug IDs to bundles so source maps match exactly.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

module.exports = config;
