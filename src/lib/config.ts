import Constants from 'expo-constants';

interface Extra {
  appVariant?: string;
  privacyPolicyUrl?: string;
  supportEmail?: string;
  sentryDsn?: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const appConfig = {
  appVariant: extra.appVariant ?? 'development',
  privacyPolicyUrl: extra.privacyPolicyUrl ?? '',
  supportEmail: extra.supportEmail ?? '',
  sentryDsn: extra.sentryDsn ?? '',
} as const;
