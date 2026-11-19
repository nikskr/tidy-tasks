import { MAX_TITLE_LENGTH } from '@/features/tasks/model';
import { migrate } from '../migrations';
import * as repo from '../taskRepository';
import type { Db } from '../types';
import { createTestDb } from './sqljsDb';

let db: Db & { close(): void };

beforeEach(async () => {
  db = await createTestDb();
  await migrate(db);
});
afterEach(() => db.close());

describe('taskRepository', () => {
  it('AC-1: adds a trimmed active task and lists newest first', async () => {
    await repo.addTask(db, 'a', 'First', 1000);
    await repo.addTask(db, 'b', '  Second  ', 2000);
    const tasks = await repo.listTasks(db);
    expect(tasks.map((t) => t.title)).toEqual(['Second', 'First']);
    expect(tasks[0]).toMatchObject({ id: 'b', completed: false, createdAt: 2000, updatedAt: 2000 });
  });

  it('AC-2: ignores empty and whitespace-only titles', async () => {
    expect(await repo.addTask(db, 'a', '', 1)).toBeNull();
    expect(await repo.addTask(db, 'b', '   \n ', 1)).toBeNull();
    expect(await repo.listTasks(db)).toHaveLength(0);
  });

  it('AC-3: caps titles at 200 characters', async () => {
    const task = await repo.addTask(db, 'a', 'x'.repeat(MAX_TITLE_LENGTH + 50), 1);
    expect(task?.title).toHaveLength(MAX_TITLE_LENGTH);
  });

  it('AC-4: toggles completion back and forth and bumps updatedAt', async () => {
    await repo.addTask(db, 'a', 'Task', 1);
    await repo.toggleTask(db, 'a', 5);
    let [task] = await repo.listTasks(db);
    expect(task).toMatchObject({ completed: true, updatedAt: 5 });
    await repo.toggleTask(db, 'a', 6);
    [task] = await repo.listTasks(db);
    expect(task?.completed).toBe(false);
  });

  it('AC-5: renames with a non-empty title and keeps the old one otherwise', async () => {
    await repo.addTask(db, 'a', 'Old', 1);
    expect(await repo.renameTask(db, 'a', '  New  ', 2)).toBe(true);
    expect((await repo.listTasks(db))[0]?.title).toBe('New');
    expect(await repo.renameTask(db, 'a', '   ', 3)).toBe(false);
    expect((await repo.listTasks(db))[0]).toMatchObject({ title: 'New', updatedAt: 2 });
  });

  it('AC-6: removes a task', async () => {
    await repo.addTask(db, 'a', 'A', 1);
    await repo.addTask(db, 'b', 'B', 2);
    await repo.removeTask(db, 'a');
    expect((await repo.listTasks(db)).map((t) => t.id)).toEqual(['b']);
  });

  it('AC-8: clearCompleted removes only completed tasks', async () => {
    await repo.addTask(db, 'a', 'A', 1);
    await repo.addTask(db, 'b', 'B', 2);
    await repo.addTask(db, 'c', 'C', 3);
    await repo.toggleTask(db, 'a', 4);
    await repo.toggleTask(db, 'c', 4);
    await repo.clearCompleted(db);
    expect((await repo.listTasks(db)).map((t) => t.id)).toEqual(['b']);
  });

  it('treats quotes and SQL-like input as plain text (bound parameters)', async () => {
    const title = `Robert'); DROP TABLE tasks;--`;
    await repo.addTask(db, 'a', title, 1);
    expect((await repo.listTasks(db))[0]?.title).toBe(title);
  });
});
