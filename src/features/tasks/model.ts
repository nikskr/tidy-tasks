export const MAX_TITLE_LENGTH = 200;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Trims and caps a title. Returns null when nothing meaningful is left (AC-2, AC-3). */
export function normalizeTitle(input: string): string | null {
  const trimmed = input.trim().slice(0, MAX_TITLE_LENGTH).trim();
  return trimmed.length > 0 ? trimmed : null;
}
