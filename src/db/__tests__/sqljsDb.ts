/**
 * Test-only adapter: implements the `Db` interface on sql.js (pure JS SQLite),
 * so repository + migration SQL runs against a real SQLite engine in Jest.
 */
import type { BindValue, Db } from '../types';

// asm.js build: no .wasm file to locate, works in any Jest environment.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require('sql.js/dist/sql-asm.js') as typeof import('sql.js').default;

export async function createTestDb(): Promise<Db & { close(): void }> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const all = <T>(source: string, params: BindValue[]): T[] => {
    const stmt = db.prepare(source);
    try {
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  };

  return {
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, params) {
      db.run(source, params);
    },
    async getAllAsync<T>(source: string, params: BindValue[]) {
      return all<T>(source, params);
    },
    async getFirstAsync<T>(source: string, params: BindValue[]) {
      return all<T>(source, params)[0] ?? null;
    },
    close() {
      db.close();
    },
  };
}
