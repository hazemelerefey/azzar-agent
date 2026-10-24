import { describe, expect, it } from 'vitest';

import { buildAZZARSessionEnv } from './sessionEnv';

describe('buildAZZARSessionEnv', () => {
  it('echoes the conversation ids the child process can attribute its output to', () => {
    expect(
      buildAZZARSessionEnv({ agentId: 'agt_1', operationId: 'op_1', topicId: 'tpc_1' }),
    ).toEqual({
      AZZAR_AGENT_ID: 'agt_1',
      AZZAR_OPERATION_ID: 'op_1',
      AZZAR_TOPIC_ID: 'tpc_1',
    });
  });

  it('omits an id that did not resolve rather than exporting an empty var', () => {
    // A var set to '' or 'undefined' reads as present to every consumer down the
    // chain — `lh` would stamp a report with a topic id that resolves to nothing.
    expect(
      buildAZZARSessionEnv({ agentId: 'agt_1', operationId: null, topicId: undefined }),
    ).toEqual({ AZZAR_AGENT_ID: 'agt_1' });
  });

  it('scopes the child to the workspace the topic lives in', () => {
    // Without it `lh` falls back to personal scope and a workspace goal reads
    // as "Goal not found".
    expect(
      buildAZZARSessionEnv({ operationId: 'op_1', topicId: 'tpc_1', workspaceId: 'ws_1' }),
    ).toEqual({
      AZZAR_OPERATION_ID: 'op_1',
      AZZAR_TOPIC_ID: 'tpc_1',
      AZZAR_WORKSPACE_ID: 'ws_1',
    });
  });

  it('is empty when the run carries no conversation at all', () => {
    expect(buildAZZARSessionEnv({})).toEqual({});
  });
});
