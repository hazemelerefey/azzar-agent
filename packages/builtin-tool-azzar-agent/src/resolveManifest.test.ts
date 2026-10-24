import { describe, expect, it } from 'vitest';

import { AzzarAgentManifest } from './manifest';
import { resolveAzzarAgentManifest } from './resolveManifest';
import { systemPromptWithoutSubAgent } from './systemRole';
import { AzzarAgentApiName } from './types';

const apiNames = (manifest: { api: { name: string }[] }) => manifest.api.map((a) => a.name);

describe('resolveAzzarAgentManifest', () => {
  it('returns the full static manifest in a normal (main, non-sub-agent) turn', () => {
    const result = resolveAzzarAgentManifest({ scope: 'main' });

    // identical reference — no trimming, no clone
    expect(result).toBe(AzzarAgentManifest);
    expect(apiNames(result!)).toContain(AzzarAgentApiName.callSubAgent);
    // full prompt still describes sub-agent dispatch
    expect(result!.systemRole).toContain('callSubAgent');
  });

  it('returns the full manifest when no context signals are set', () => {
    expect(resolveAzzarAgentManifest({})).toBe(AzzarAgentManifest);
  });

  it.each(['group', 'group_agent'])(
    'hides callSubAgent in both api and systemRole (keeping plan/todo/visual) in scope %s',
    (scope) => {
      const result = resolveAzzarAgentManifest({ scope })!;

      const names = apiNames(result);
      expect(names).not.toContain(AzzarAgentApiName.callSubAgent);
      // the rest of azzar-agent stays available
      expect(names).toContain(AzzarAgentApiName.createPlan);
      expect(names).toContain(AzzarAgentApiName.createTodos);
      expect(names).toContain(AzzarAgentApiName.analyzeMedia);
      // exactly one API removed
      expect(names).toHaveLength(AzzarAgentManifest.api.length - 1);

      // systemRole is rewritten so the prompt no longer mentions the hidden tool
      expect(result.systemRole).toBe(systemPromptWithoutSubAgent);
      expect(result.systemRole).not.toContain('callSubAgent');
      expect(result.systemRole).not.toContain('sub_agents');
      // plan/todo guidance survives in the rewritten prompt
      expect(result.systemRole).toContain('plan_and_todos');

      // non-api fields preserved
      expect(result.identifier).toBe(AzzarAgentManifest.identifier);
    },
  );

  it('hides callSubAgent (api + systemRole) inside a sub-agent run regardless of scope', () => {
    const result = resolveAzzarAgentManifest({ isSubAgent: true, scope: 'main' })!;

    expect(apiNames(result)).not.toContain(AzzarAgentApiName.callSubAgent);
    expect(apiNames(result)).toContain(AzzarAgentApiName.createPlan);
    expect(result.systemRole).not.toContain('callSubAgent');
  });

  it('does not mutate the original static manifest', () => {
    const before = AzzarAgentManifest.api.length;
    resolveAzzarAgentManifest({ scope: 'group' });
    expect(AzzarAgentManifest.api).toHaveLength(before);
    // the full manifest's systemRole still describes sub-agent dispatch
    expect(AzzarAgentManifest.systemRole).toContain('callSubAgent');
  });
});
