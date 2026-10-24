import { describe, expect, it } from 'vitest';

import {
  createAzzarSkillLocalIntent,
  type AzzarSkillLocalIntent,
  mergeAzzarSkillServers,
} from './projection';
import { type AzzarSkillServer, AzzarSkillStatus } from './types';

const tool = (name: string) => ({
  description: `${name} tool`,
  inputSchema: { type: 'object' },
  name,
});

const server = (identifier: string, tools?: AzzarSkillServer['tools']): AzzarSkillServer => ({
  identifier,
  isConnected: true,
  name: identifier,
  status: AzzarSkillStatus.CONNECTED,
  ...(tools ? { tools } : {}),
});

describe('mergeAzzarSkillServers', () => {
  it('keeps a confirmed row’s tools when the response carries none', () => {
    const confirmed = [server('linear', [tool('createIssue')])];

    const merged = mergeAzzarSkillServers(
      [server('linear')],
      createAzzarSkillLocalIntent(),
      confirmed,
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].tools).toEqual([tool('createIssue')]);
  });

  it('lets a fresh catalog replace the cached one', () => {
    const confirmed = [server('linear', [tool('createIssue')])];

    const merged = mergeAzzarSkillServers(
      [server('linear', [tool('listIssues')])],
      createAzzarSkillLocalIntent(),
      confirmed,
    );

    expect(merged[0].tools).toEqual([tool('listIssues')]);
  });

  it('does not attach cached tools to a provider the response no longer lists', () => {
    const confirmed = [server('linear', [tool('createIssue')])];

    const merged = mergeAzzarSkillServers([], createAzzarSkillLocalIntent(), confirmed);

    expect(merged).toEqual([]);
  });

  it('keeps the response reference when there is no cached catalog', () => {
    const incoming = [server('linear')];

    const merged = mergeAzzarSkillServers(incoming, createAzzarSkillLocalIntent(), []);

    expect(merged).toBe(incoming);
  });

  it('carries cached tools onto a pending add and still settles the intent', () => {
    const intent: AzzarSkillLocalIntent = createAzzarSkillLocalIntent();
    intent.added.set('github', server('github'));

    // The response does not list the just-connected provider yet, and it also
    // drops the tools of the provider it does list.
    const merged = mergeAzzarSkillServers([server('linear')], intent, [
      server('linear', [tool('createIssue')]),
      server('github', [tool('listIssues')]),
    ]);

    expect(merged.map((s) => s.identifier)).toEqual(['linear', 'github']);
    expect(merged[0].tools).toEqual([tool('createIssue')]);
    expect(merged[1].tools).toEqual([tool('listIssues')]);

    // Once the response echoes `github`, the pending add settles.
    const settled: AzzarSkillLocalIntent = createAzzarSkillLocalIntent();
    settled.added.set('github', server('github'));
    mergeAzzarSkillServers([server('linear'), server('github')], settled, []);

    expect(settled.added.size).toBe(0);
  });
});
