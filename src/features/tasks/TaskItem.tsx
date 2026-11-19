import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MIN_TOUCH, spacing, usePalette } from '@/theme';
import { MAX_TITLE_LENGTH, type Task } from './model';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

function TaskItemBase({ task, onToggle, onRename, onRemove }: Props) {
  const c = usePalette();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const startEditing = () => {
    setDraft(task.title);
    setEditing(true);
  };

  // AC-5: an empty submission keeps the previous title.
  const commit = () => {
    if (!editing) return; // onSubmitEditing and onBlur both fire; handle once.
    setEditing(false);
    const next = draft.trim();
    if (next && next !== task.title) onRename(task.id, next);
  };

  return (
    <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Pressable
        onPress={() => onToggle(task.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.title}
        hitSlop={8}
        style={styles.touch}
      >
        <View
          style={[
            styles.box,
            { borderColor: task.completed ? c.accent : c.textMuted },
            task.completed && { backgroundColor: c.accent },
          ]}
        >
          {task.completed ? <Text style={[styles.check, { color: c.onAccent }]}>✓</Text> : null}
        </View>
      </Pressable>

      {editing ? (
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={commit}
          onBlur={commit}
          autoFocus
          maxLength={MAX_TITLE_LENGTH}
          returnKeyType="done"
          accessibilityLabel="Edit task title"
          style={[styles.title, styles.input, { color: c.text, borderColor: c.accent }]}
        />
      ) : (
        <Pressable
          onPress={startEditing}
          style={styles.titleWrap}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${task.title}`}
        >
          <Text
            style={[
              styles.title,
              { color: task.completed ? c.textMuted : c.text },
              task.completed && styles.done,
            ]}
          >
            {task.title}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => onRemove(task.id)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${task.title}`}
        hitSlop={8}
        style={styles.touch}
      >
        <Text style={[styles.delete, { color: c.danger }]}>✕</Text>
      </Pressable>
    </View>
  );
}

export const TaskItem = memo(TaskItemBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: MIN_TOUCH + spacing.sm,
  },
  touch: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  check: { fontSize: 15, fontWeight: '700' },
  titleWrap: { flex: 1, minHeight: MIN_TOUCH, justifyContent: 'center', paddingVertical: spacing.sm },
  title: { flex: 1, fontSize: 16, lineHeight: 22 },
  input: { borderBottomWidth: 1, paddingVertical: spacing.xs },
  done: { textDecorationLine: 'line-through' },
  delete: { fontSize: 18, fontWeight: '600' },
});
