import { describe, expect, it } from 'vitest';

import { getCodexProcessEnv, pickCodexRunProvenance, withCodexThreadEnv } from './environment';

describe('Codex thread environment', () => {
  it('picks only run provenance from a launch environment', () => {
    expect(
      pickCodexRunProvenance({
        CODEX_HOME: '/codex',
        AZZAR_JWT: 'test-token',
        AZZAR_OPERATION_ID: 'op',
        AZZAR_TOPIC_ID: 'topic',
      }),
    ).toEqual({
      AZZAR_AGENT_ID: undefined,
      AZZAR_OPERATION_ID: 'op',
      AZZAR_TOPIC_ID: 'topic',
      AZZAR_WORKSPACE_ID: undefined,
    });
  });

  it('keeps the workspace out of the shared app-server process env', () => {
    // Runs from two workspaces must reuse one app-server; a workspace in the process env made
    // the reuse check reject the second run as a different environment.
    const launch = (workspace: string) =>
      getCodexProcessEnv({ CODEX_HOME: '/codex', AZZAR_WORKSPACE_ID: workspace });
    expect(launch('ws-a')).toEqual(launch('ws-b'));
    expect(launch('ws-a')).toEqual({ CODEX_HOME: '/codex' });
  });

  it('folds every shell policy override into one table carrying the run provenance', () => {
    const params = {
      config: {
        'model_reasoning_effort': 'low',
        'shell_environment_policy': {
          inherit: 'all',
          set: { EXTRA: 'kept', AZZAR_OPERATION_ID: 'old' },
        },
        'shell_environment_policy.set': { ANOTHER: 'kept', AZZAR_TOPIC_ID: 'old' },
        'shell_environment_policy.set.AZZAR_OPERATION_ID': 'old',
        'shell_environment_policy.exclude': ['SECRET_*'],
      },
      cwd: '/workspace',
    };

    const result = withCodexThreadEnv(params, { AZZAR_OPERATION_ID: 'current' });

    // One key per subtree: Codex applies overrides in hash order, so a sibling spelling could
    // otherwise replace the run's IDs.
    expect(result.config).toEqual({
      model_reasoning_effort: 'low',
      shell_environment_policy: {
        exclude: ['SECRET_*'],
        inherit: 'all',
        set: {
          ANOTHER: 'kept',
          AZZAR_AGENT_ID: '',
          AZZAR_OPERATION_ID: 'current',
          AZZAR_TOPIC_ID: '',
          AZZAR_WORKSPACE_ID: '',
        },
      },
    });
    expect(params.config.shell_environment_policy.set.AZZAR_OPERATION_ID).toBe('old');
  });
});
