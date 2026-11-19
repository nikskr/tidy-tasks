import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { appConfig } from '@/lib/config';
import { reportError } from '@/lib/monitoring';
import { MIN_TOUCH, spacing, usePalette } from '@/theme';

/** AC-12 */
export default function AboutScreen() {
  const c = usePalette();
  const version = Application.nativeApplicationVersion ?? '—';
  const build = Application.nativeBuildVersion ?? '—';
  const updateId = Updates.updateId ? Updates.updateId.slice(0, 8) : 'embedded';

  const open = (url: string) => {
    Linking.openURL(url).catch((error: unknown) => reportError(error, 'about.openUrl'));
  };

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.text }]}>Tidy Tasks</Text>
      <Text style={[styles.body, { color: c.textMuted }]}>
        A simple, private to-do list. Your tasks are stored only on this device. No account, no tracking.
      </Text>

      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Row label="Version" value={`${version} (${build})`} />
        <Row label="Update" value={updateId} />
        <Row label="Channel" value={Updates.channel ?? '—'} />
      </View>

      {appConfig.privacyPolicyUrl ? (
        <Pressable
          onPress={() => open(appConfig.privacyPolicyUrl)}
          accessibilityRole="link"
          accessibilityLabel="Open privacy policy"
          style={styles.link}
        >
          <Text style={[styles.linkText, { color: c.accent }]}>Privacy policy</Text>
        </Pressable>
      ) : null}
      {appConfig.supportEmail ? (
        <Pressable
          onPress={() => open(`mailto:${appConfig.supportEmail}`)}
          accessibilityRole="link"
          accessibilityLabel="Email support"
          style={styles.link}
        >
          <Text style={[styles.linkText, { color: c.accent }]}>Contact support</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const c = usePalette();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: c.text }]} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21 },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, gap: spacing.md },
  label: { fontSize: 15 },
  value: { fontSize: 15, flexShrink: 1, textAlign: 'right' },
  link: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  linkText: { fontSize: 16, fontWeight: '600' },
});
