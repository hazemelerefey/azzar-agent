import { describe, expect, it } from 'vitest';

import { canReadLocalFileReferences } from './useLocalPathReference';

const base = {
  isHeterogeneous: false,
  isLocalSystemEnabled: true,
  pinnedPluginIds: [] as string[],
  toolMode: 'agent' as const,
};

describe('canReadLocalFileReferences', () => {
  it('allows local references in agent mode with local system enabled', () => {
    expect(canReadLocalFileReferences(base)).toBe(true);
  });

  it('keeps uploading in chat mode, which never offers azzar-local-system', () => {
    expect(canReadLocalFileReferences({ ...base, toolMode: 'chat' })).toBe(false);
  });

  it('allows custom mode only when azzar-local-system is pinned', () => {
    expect(canReadLocalFileReferences({ ...base, toolMode: 'custom' })).toBe(false);
    expect(
      canReadLocalFileReferences({
        ...base,
        pinnedPluginIds: ['azzar-local-system'],
        toolMode: 'custom',
      }),
    ).toBe(true);
  });

  it('requires local system for builtin agents but not for heterogeneous agents', () => {
    expect(canReadLocalFileReferences({ ...base, isLocalSystemEnabled: false })).toBe(false);
    expect(
      canReadLocalFileReferences({
        ...base,
        isHeterogeneous: true,
        isLocalSystemEnabled: false,
        toolMode: 'chat',
      }),
    ).toBe(true);
  });
});
