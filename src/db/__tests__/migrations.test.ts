import { DATABASE_VERSION, getSchemaVersion, migrate } from '../migrations';
import { createTestDb } from './sqljsDb';

describe('migrations (AC-9)', () => {
  it('migrates a fresh database from version 0 to the latest version', async () => {
    const db = await createTestDb();
    expect(await getSchemaVersion(db)).toBe(0);
    await migrate(db);
    expect(await getSchemaVersion(db)).toBe(DATABASE_VERSION);
    const table = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'",
      [],
    );
    expect(table?.name).toBe('tasks');
    db.close();
  });

  it('is idempotent and preserves data when run again (app relaunch / update)', async () => {
    const db = await createTestDb();
    await migrate(db);
    await db.runAsync(
      'INSERT INTO tasks (id, title, completed, created_at, updated_at) VALUES (?, ?, 0, 1, 1)',
      ['a', 'Keep me'],
    );
    await migrate(db);
    const rows = await db.getAllAsync<{ title: string }>('SELECT title FROM tasks', []);
    expect(rows).toEqual([{ title: 'Keep me' }]);
    db.close();
  });

  it('refuses to touch a database created by a newer app version', async () => {
    const db = await createTestDb();
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION + 1};`);
    await expect(migrate(db)).rejects.toThrow(/newer than app supports/);
    db.close();
  });

  it('enforces title constraints at the database level', async () => {
    const db = await createTestDb();
    await migrate(db);
    await expect(
      db.runAsync('INSERT INTO tasks (id, title, completed, created_at, updated_at) VALUES (?, ?, 0, 1, 1)', ['x', '']),
    ).rejects.toThrow();
    db.close();
  });
});
