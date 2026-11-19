import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Single source of app configuration. Variant is selected by the EAS build profile
 * (env APP_VARIANT in eas.json) — never by editing code. Secrets are NOT read here;
 * only public values (DSN, URLs). See docs/playbook/01 §1.3.
 *
 * Linked to EAS project nikskr/tidy-tasks-mobile-app.
 *
 * App IDs are PERMANENT once registered (Android: first Play upload; iOS: App Store Connect record).
 * Android package names allow "_" but not "-"; iOS bundle IDs allow "-" but not "_",
 * so the two platforms use slightly different IDs.
 */
const ANDROID_PACKAGE_BASE = process.env.ANDROID_PACKAGE_BASE ?? 'com.mik_dev.tidytaskmobile';
const IOS_BUNDLE_ID_BASE = process.env.IOS_BUNDLE_ID_BASE ?? 'com.mik-dev.tidytaskmobile';
// Public pages (GitHub Pages, see site/ and .github/workflows/pages.yml).
const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://nikskr.github.io/tidy-tasks';
// EAS project id is public (it is embedded in every build); safe to commit.
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID ?? '47a5e783-41f6-4bcc-a518-2146ee346cdd';
const OWNER = process.env.EXPO_OWNER ?? 'nikskr';

type Variant = 'development' | 'preview' | 'production';
const variant = (process.env.APP_VARIANT ?? 'development') as Variant;

const suffix: Record<Variant, string> = { development: '.dev', preview: '.preview', production: '' };
const nameSuffix: Record<Variant, string> = { development: ' (Dev)', preview: ' (Preview)', production: '' };

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `Tidy Tasks${nameSuffix[variant]}`,
  slug: 'tidy-tasks-mobile-app',
  owner: OWNER,
  version: '1.0.0', // marketing version (SemVer). Build numbers are managed remotely by EAS.
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'tidytasks',
  userInterfaceStyle: 'automatic',
  runtimeVersion: { policy: 'appVersion' },
  ...(EAS_PROJECT_ID
    ? { updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}`, checkAutomatically: 'ON_LOAD', fallbackToCacheTimeout: 0 } }
    : {}),
  ios: {
    bundleIdentifier: `${IOS_BUNDLE_ID_BASE}${suffix[variant]}`,
    supportsTablet: false,
    config: { usesNonExemptEncryption: false },
    privacyManifests: {
      // Required-reason APIs used by React Native / Expo modules. Re-check after adding native deps.
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
      ],
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeCrashData',
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePerformanceData',
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
      ],
    },
  },
  android: {
    package: `${ANDROID_PACKAGE_BASE}${suffix[variant]}`,
    adaptiveIcon: {
      backgroundColor: '#4562EE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // No dangerous permissions are needed. Block ones libraries might add implicitly.
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.SYSTEM_ALERT_WINDOW'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#F6F7F9',
        dark: { image: './assets/splash-icon.png', backgroundColor: '#0E1116' },
      },
    ],
    [
      '@sentry/react-native',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        // Source maps are uploaded during EAS Build when SENTRY_AUTH_TOKEN (secret) is set.
        disableAutoUpload: !process.env.SENTRY_AUTH_TOKEN,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    appVariant: variant,
    privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL ?? `${SITE_URL}/privacy/`,
    supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'mgpmessage@gmail.com',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {}),
  },
});
