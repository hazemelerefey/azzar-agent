import type { BuiltinManifestResolver } from '@azzar/types';

import { AzzarAgentManifest } from './manifest';
import { systemPromptWithoutSubAgent } from './systemRole';
import { AzzarAgentApiName } from './types';

/**
 * Context-aware manifest for the azzar-agent tool.
 *
 * `azzar-agent` bundles plan / todo / media-analysis APIs together with the
 * `callSubAgent` dispatch. The dispatch must be hidden in two contexts:
 *
 * - **Inside a group** (`scope` is `group` / `group_agent`): coordination already
 *   happens through real member agents via GroupManagement; an isolated ad-hoc
 *   sub-agent on top of that is redundant and confusing.
 * - **Inside a sub-agent** (`isSubAgent`): a nested sub-agent must not spawn
 *   further sub-agents.
 *
 * In both cases plan / todo / media-analysis APIs stay available, so this returns a
 * trimmed manifest (not `null`). It rewrites BOTH halves of the manifest in step:
 * the `api` list drops `callSubAgent`, and `systemRole` switches to the variant
 * without the sub-agent section — otherwise the prompt would keep instructing the
 * model to dispatch a tool that is no longer in its tool list.
 */
export const resolveAzzarAgentManifest: BuiltinManifestResolver = (context) => {
  const inGroup = context.scope === 'group' || context.scope === 'group_agent';
  const hideSubAgentDispatch = inGroup || context.isSubAgent === true;

  if (!hideSubAgentDispatch) return AzzarAgentManifest;

  return {
    ...AzzarAgentManifest,
    api: AzzarAgentManifest.api.filter((api) => api.name !== AzzarAgentApiName.callSubAgent),
    systemRole: systemPromptWithoutSubAgent,
  };
};
