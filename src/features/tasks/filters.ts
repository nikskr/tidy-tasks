import type { Task } from './model';

export type Filter = 'all' | 'active' | 'done';

export const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
];

/** AC-7 */
export function filterTasks(tasks: readonly Task[], filter: Filter): Task[] {
  switch (filter) {
    case 'active':
      return tasks.filter((t) => !t.completed);
    case 'done':
      return tasks.filter((t) => t.completed);
    default:
      return [...tasks];
  }
}

/** AC-11 */
export function countActive(tasks: readonly Task[]): number {
  return tasks.reduce((n, t) => (t.completed ? n : n + 1), 0);
}

export function activeLabel(count: number): string {
  return count === 1 ? '1 task left' : `${count} tasks left`;
}

/** AC-10 */
export function emptyMessage(filter: Filter, totalCount: number): string {
  if (totalCount === 0) return 'No tasks yet. Add your first one above.';
  if (filter === 'active') return 'All done. Nice work!';
  if (filter === 'done') return 'Nothing completed yet.';
  return 'No tasks.';
}
