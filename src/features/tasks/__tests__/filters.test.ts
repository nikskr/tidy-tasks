import { activeLabel, countActive, emptyMessage, filterTasks } from '../filters';
import { normalizeTitle, type Task } from '../model';

const task = (id: string, completed: boolean): Task => ({ id, title: id, completed, createdAt: 0, updatedAt: 0 });
const tasks = [task('a', false), task('b', true), task('c', false)];

describe('filters', () => {
  it('AC-7: filters all / active / done', () => {
    expect(filterTasks(tasks, 'all').map((t) => t.id)).toEqual(['a', 'b', 'c']);
    expect(filterTasks(tasks, 'active').map((t) => t.id)).toEqual(['a', 'c']);
    expect(filterTasks(tasks, 'done').map((t) => t.id)).toEqual(['b']);
  });

  it('AC-11: counts active tasks with correct pluralisation', () => {
    expect(countActive(tasks)).toBe(2);
    expect(activeLabel(2)).toBe('2 tasks left');
    expect(activeLabel(1)).toBe('1 task left');
    expect(activeLabel(0)).toBe('0 tasks left');
  });

  it('AC-10: shows an empty message appropriate to the filter', () => {
    expect(emptyMessage('all', 0)).toMatch(/No tasks yet/);
    expect(emptyMessage('active', 3)).toMatch(/All done/);
    expect(emptyMessage('done', 3)).toMatch(/Nothing completed/);
  });
});

describe('normalizeTitle', () => {
  it('trims, caps and rejects blank input', () => {
    expect(normalizeTitle('  hi  ')).toBe('hi');
    expect(normalizeTitle(' \t ')).toBeNull();
    expect(normalizeTitle('y'.repeat(300))).toHaveLength(200);
  });
});
