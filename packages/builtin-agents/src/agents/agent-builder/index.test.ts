import { AgentBuilderIdentifier } from '@azzar/builtin-tool-agent-builder';
import { describe, expect, it } from 'vitest';

import { getAgentRuntimeConfig } from '../../index';
import { BUILTIN_AGENT_SLUGS } from '../../types';

const resolvePlugins = (plugins?: string[]) =>
  getAgentRuntimeConfig(BUILTIN_AGENT_SLUGS.agentBuilder, { plugins })?.plugins ?? [];

describe('AGENT_BUILDER runtime plugins', () => {
  it('always includes the Agent Builder tool', () => {
    expect(resolvePlugins()).toEqual([AgentBuilderIdentifier]);
  });

  it('strips conflicting agent-editing / orchestration tools', () => {
    const plugins = resolvePlugins([
      'azzar-agent-management',
      'azzar-group-management',
      'azzar-group-agent-builder',
      'azzar-agent',
    ]);

    expect(plugins).toEqual([AgentBuilderIdentifier]);
  });

  it('keeps functional plugins (web browsing, Gmail/Composio, etc.)', () => {
    const plugins = resolvePlugins([
      'azzar-web-browsing',
      'azzar-image-generation',
      'gmail',
      'azzar-agent-management', // conflicting → removed
    ]);

    expect(plugins).toEqual([
      AgentBuilderIdentifier,
      'azzar-web-browsing',
      'azzar-image-generation',
      'gmail',
    ]);
  });
});
