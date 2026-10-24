import type { UpdateInfo } from '@azzar/electron-client-ipc';

export const selectUpdateInfo = (current: UpdateInfo | null, incoming: UpdateInfo): UpdateInfo =>
  current?.kind === 'app' && incoming.kind !== 'app' ? current : incoming;
