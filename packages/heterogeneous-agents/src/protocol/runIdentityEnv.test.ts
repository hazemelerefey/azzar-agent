import { describe, expect, it } from 'vitest';

import { stripInheritedRunIdentity } from './runIdentityEnv';

describe('stripInheritedRunIdentity', () => {
  it('drops the ancestor run identity and JWT file, keeping everything else', () => {
    const env = {
      HOME: '/home/u',
      AZZAR_AGENT_ID: 'agt',
      AZZAR_ASSISTANT_MESSAGE_ID: 'msg',
      AZZAR_JWT: 'launcher-token',
      AZZAR_JWT_FILE: '/tmp/ancestor/jwt',
      AZZAR_TASK_ID: 'task',
      AZZAR_WORKSPACE_ID: 'ws',
    };

    // The launcher overwrites AZZAR_JWT itself; only the file pointer could outrank it.
    expect(stripInheritedRunIdentity(env)).toEqual({
      HOME: '/home/u',
      AZZAR_JWT: 'launcher-token',
    });
    expect(env.AZZAR_JWT_FILE).toBe('/tmp/ancestor/jwt');
  });
});
