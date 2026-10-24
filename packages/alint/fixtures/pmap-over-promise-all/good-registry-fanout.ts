// Fixture: fanning out over registered adapters is bounded by code, not data.
import type { AzzarChatDatabase } from '../../type';

interface WorkTypeAdapter {
  count: (db: AzzarChatDatabase, userId: string) => Promise<number>;
  type: string;
}

const WORK_TYPE_ADAPTERS: Record<string, WorkTypeAdapter> = {};

const resolveWorkTypeAdapters = (includeFiles: boolean) =>
  Object.values(WORK_TYPE_ADAPTERS).filter((adapter) => includeFiles || adapter.type !== 'file');

export const countWorks = async (db: AzzarChatDatabase, userId: string, includeFiles: boolean) => {
  const counts = await Promise.all(
    resolveWorkTypeAdapters(includeFiles).map((adapter) => adapter.count(db, userId)),
  );
  return counts.reduce((sum, count) => sum + count, 0);
};
