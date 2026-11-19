import { normalizeTitle, type Task } from '@/features/tasks/model';
import type { Db } from './types';

interface TaskRow {
  id: string;
  title: string;
  completed: number;
  created_at: number;
  updated_at: number;
}

const toTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  completed: row.completed === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function listTasks(db: Db): Promise<Task[]> {
  const rows = await db.getAllAsync<TaskRow>(
    'SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY created_at DESC, rowid DESC',
    [],
  );
  return rows.map(toTask);
}

/** AC-1, AC-2, AC-3. Returns the created task, or null if the title was empty. */
export async function addTask(db: Db, id: string, rawTitle: string, now: number): Promise<Task | null> {
  const title = normalizeTitle(rawTitle);
  if (title === null) return null;
  await db.runAsync(
    'INSERT INTO tasks (id, title, completed, created_at, updated_at) VALUES (?, ?, 0, ?, ?)',
    [id, title, now, now],
  );
  return { id, title, completed: false, createdAt: now, updatedAt: now };
}

/** AC-4 */
export async function toggleTask(db: Db, id: string, now: number): Promise<void> {
  await db.runAsync('UPDATE tasks SET completed = 1 - completed, updated_at = ? WHERE id = ?', [now, id]);
}

/** AC-5. Returns false (and changes nothing) when the new title is empty. */
export async function renameTask(db: Db, id: string, rawTitle: string, now: number): Promise<boolean> {
  const title = normalizeTitle(rawTitle);
  if (title === null) return false;
  await db.runAsync('UPDATE tasks SET title = ?, updated_at = ? WHERE id = ?', [title, now, id]);
  return true;
}

/** AC-6 */
export async function removeTask(db: Db, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

/** AC-8 */
export async function clearCompleted(db: Db): Promise<void> {
  await db.runAsync('DELETE FROM tasks WHERE completed = 1', []);
}
