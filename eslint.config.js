// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'ios/*', 'android/*'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Node build/dev scripts and Claude hooks: CLI output is the point.
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
]);
