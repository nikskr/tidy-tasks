import { Link, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterBar } from '@/features/tasks/FilterBar';
import { activeLabel, emptyMessage } from '@/features/tasks/filters';
import { MAX_TITLE_LENGTH, type Task } from '@/features/tasks/model';
import { TaskItem } from '@/features/tasks/TaskItem';
import { useTasks } from '@/features/tasks/useTasks';
import { MIN_TOUCH, spacing, usePalette } from '@/theme';

export default function TaskListScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const t = useTasks();
  const [draft, setDraft] = useState('');

  // AC-1 / AC-2: add on submit, clear input; empty input is ignored by the repository.
  const submit = () => {
    if (!draft.trim()) return;
    void t.add(draft);
    setDraft('');
  };

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem task={item} onToggle={t.toggle} onRename={t.rename} onRemove={t.remove} />
    ),
    [t.toggle, t.rename, t.remove],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/about" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="About this app" hitSlop={10}>
                <Text style={[styles.headerLink, { color: c.accent }]}>About</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <View style={styles.content}>
        <Text style={[styles.counter, { color: c.textMuted }]} accessibilityLiveRegion="polite">
          {activeLabel(t.activeCount)}
        </Text>

        <View style={[styles.inputRow, { backgroundColor: c.surface, borderColor: c.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            submitBehavior="submit"
            placeholder="What needs doing?"
            placeholderTextColor={c.textMuted}
            maxLength={MAX_TITLE_LENGTH}
            returnKeyType="done"
            accessibilityLabel="New task title"
            style={[styles.input, { color: c.text }]}
          />
          <Pressable
            onPress={submit}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel="Add task"
            accessibilityState={{ disabled: !draft.trim() }}
            style={[styles.addButton, { backgroundColor: c.accent, opacity: draft.trim() ? 1 : 0.4 }]}
          >
            <Text style={[styles.addText, { color: c.onAccent }]}>Add</Text>
          </Pressable>
        </View>

        <FilterBar value={t.filter} onChange={t.setFilter} />

        {t.loading ? (
          <ActivityIndicator style={styles.loader} color={c.accent} />
        ) : (
          <FlatList
            data={t.visible}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: c.textMuted }]}>{emptyMessage(t.filter, t.tasks.length)}</Text>
            }
            ListFooterComponent={
              t.completedCount > 0 ? (
                <Pressable
                  onPress={() => void t.clearCompleted()}
                  accessibilityRole="button"
                  accessibilityLabel={`Clear ${t.completedCount} completed tasks`}
                  style={styles.clear}
                >
                  <Text style={[styles.clearText, { color: c.danger }]}>Clear completed ({t.completedCount})</Text>
                </Pressable>
              ) : undefined
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerLink: { fontSize: 16, fontWeight: '600' },
  counter: { fontSize: 14, marginBottom: spacing.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    marginBottom: spacing.md,
  },
  input: { flex: 1, fontSize: 16, minHeight: MIN_TOUCH + 4, paddingVertical: spacing.sm },
  addButton: {
    minHeight: MIN_TOUCH - 4,
    minWidth: MIN_TOUCH + 16,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  addText: { fontSize: 15, fontWeight: '700' },
  loader: { marginTop: spacing.xl },
  empty: { textAlign: 'center', marginTop: spacing.xl, fontSize: 15 },
  clear: { alignSelf: 'center', minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: spacing.lg },
  clearText: { fontSize: 15, fontWeight: '600' },
});
