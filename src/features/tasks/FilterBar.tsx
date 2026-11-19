import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, spacing, usePalette } from '@/theme';
import { FILTERS, type Filter } from './filters';

interface Props {
  value: Filter;
  onChange: (value: Filter) => void;
}

/** AC-7: segmented control; selected state is exposed to screen readers. */
export function FilterBar({ value, onChange }: Props) {
  const c = usePalette();
  return (
    <View accessibilityRole="tablist" style={[styles.bar, { backgroundColor: c.surface, borderColor: c.border }]}>
      {FILTERS.map((f) => {
        const selected = f.value === value;
        return (
          <Pressable
            key={f.value}
            onPress={() => onChange(f.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`Show ${f.label.toLowerCase()} tasks`}
            style={[styles.segment, selected && { backgroundColor: c.accent }]}
          >
            <Text style={[styles.label, { color: selected ? c.onAccent : c.text }]}>{f.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  segment: { flex: 1, minHeight: MIN_TOUCH - 4, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, fontWeight: '600' },
});
