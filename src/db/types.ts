/**
 * Minimal database surface used by the data layer.
 * `expo-sqlite`'s SQLiteDatabase satisfies it on device; tests provide a sql.js adapter.
 */
export type BindValue = string | number | null;

export interface Db {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: BindValue[]): Promise<unknown>;
  getAllAsync<T>(source: string, params: BindValue[]): Promise<T[]>;
  getFirstAsync<T>(source: string, params: BindValue[]): Promise<T | null>;
}
