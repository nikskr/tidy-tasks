import { randomUUID } from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';

import * as repo from '@/db/taskRepository';
import type { Db } from '@/db/types';
import { reportError } from '@/lib/monitoring';
import { countActive, filterTasks, type Filter } from './filters';
import type { Task } from './model';

export function useTasks() {
  const db: Db = useSQLiteContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setTasks(await repo.listTasks(db));
    } catch (error) {
      reportError(error, 'tasks.reload');
    }
  }, [db]);

  // Initial load. State is set in the promise callback; results after unmount are ignored.
  useEffect(() => {
    let cancelled = false;
    repo
      .listTasks(db)
      .then((rows) => {
        if (!cancelled) setTasks(rows);
      })
      .catch((error: unknown) => reportError(error, 'tasks.load'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [db]);

  /** Runs a write, then re-reads so UI always mirrors the database (AC-9). */
  const mutate = useCallback(
    async (context: string, write: () => Promise<unknown>) => {
      try {
        await write();
      } catch (error) {
        reportError(error, context);
      }
      await reload();
    },
    [reload],
  );

  const add = useCallback(
    (title: string) => mutate('tasks.add', () => repo.addTask(db, randomUUID(), title, Date.now())),
    [db, mutate],
  );
  const toggle = useCallback(
    (id: string) => mutate('tasks.toggle', () => repo.toggleTask(db, id, Date.now())),
    [db, mutate],
  );
  const rename = useCallback(
    (id: string, title: string) => mutate('tasks.rename', () => repo.renameTask(db, id, title, Date.now())),
    [db, mutate],
  );
  const remove = useCallback((id: string) => mutate('tasks.remove', () => repo.removeTask(db, id)), [db, mutate]);
  const clearCompleted = useCallback(() => mutate('tasks.clearCompleted', () => repo.clearCompleted(db)), [db, mutate]);

  const visible = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const activeCount = useMemo(() => countActive(tasks), [tasks]);
  const completedCount = tasks.length - activeCount;

  return {
    loading,
    tasks,
    visible,
    filter,
    setFilter,
    activeCount,
    completedCount,
    add,
    toggle,
    rename,
    remove,
    clearCompleted,
  };
}
