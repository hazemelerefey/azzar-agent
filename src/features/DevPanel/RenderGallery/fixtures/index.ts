'use client';

import { builtinTools } from '@azzar/builtin-tools';
import { DEFAULT_INBOX_AVATAR } from '@azzar/const';
import type { BuiltinToolManifest, AzzarChatPluginApi } from '@azzar/types';

import type { ToolRenderFixture } from '../lifecycleMode';
import { buildSchemaSample, humanize, single, type ToolsetFixtureModule } from './_helpers';
import claudeCode from './claude-code';
import codex from './codex';
import devin from './devin';
import github from './github';
import kimiCode from './kimi-code';
import linear from './linear';
import azzarActivator from './azzar-activator';
import azzarAgent from './azzar-agent';
import azzarAgentBuilder from './azzar-agent-builder';
import azzarAgentDocuments from './azzar-agent-documents';
import azzarAgentManagement from './azzar-agent-management';
import azzarBrowser from './azzar-browser';
import azzarCloudSandbox from './azzar-cloud-sandbox';
import azzarGroupAgentBuilder from './azzar-group-agent-builder';
import azzarGroupManagement from './azzar-group-management';
import azzarImageGeneration from './azzar-image-generation';
import azzarKnowledgeBase from './azzar-knowledge-base';
import azzarLocalSystem from './azzar-local-system';
import azzarNotebook from './azzar-notebook';
import azzarPageAgent from './azzar-page-agent';
import azzarSkillStore from './azzar-skill-store';
import azzarSkills from './azzar-skills';
import azzarTask from './azzar-task';
import azzarUserInteraction from './azzar-user-interaction';
import azzarUserMemory from './azzar-user-memory';
import azzarWebBrowsing from './azzar-web-browsing';
import azzarWebOnboarding from './azzar-web-onboarding';
import { azzarAuv } from './azzarAuv';

export type { ToolRenderFixture, ToolRenderFixtureVariant } from '../lifecycleMode';

export interface ToolRenderMeta {
  api?: AzzarChatPluginApi;
  apiName: string;
  description?: string;
  identifier: string;
  toolsetDescription?: string;
  toolsetName: string;
}

export const DEVTOOLS_GROUP_ID = 'devtools-preview-group';

/**
 * Identity for the seeded Aggregate-preview conversation. The fixture messages
 * resolve their avatar/name through this agentId, so seeding `agentMap` with
 * this meta makes the preview turn read as "Azzar AI" instead of the
 * unresolved-agent fallback ("Unnamed Assistant").
 */
export const DEVTOOLS_AGENT_ID = 'devtools-render-gallery';

export const DEVTOOLS_AGENT_META = {
  avatar: DEFAULT_INBOX_AVATAR,
  title: 'Azzar AI',
};

export const DEVTOOLS_GROUP_DETAIL = {
  agents: [
    {
      avatar: '🧭',
      backgroundColor: '#E8F3FF',
      id: 'researcher-agent',
      title: 'Researcher',
    },
    {
      avatar: '🛠',
      backgroundColor: '#FFF3E8',
      id: 'builder-agent',
      title: 'Builder',
    },
  ],
  avatar: '👥',
  backgroundColor: '#EEF2FF',
  description: 'Fixture group used by /devtools to preview grouped task renders.',
  id: DEVTOOLS_GROUP_ID,
  title: 'Devtools Preview Group',
};

const toolsetModules: ToolsetFixtureModule[] = [
  claudeCode,
  codex,
  devin,
  github,
  kimiCode,
  linear,
  azzarActivator,
  azzarAgent,
  azzarAgentBuilder,
  azzarAgentDocuments,
  azzarAgentManagement,
  azzarAuv,
  azzarBrowser,
  azzarCloudSandbox,
  azzarGroupAgentBuilder,
  azzarGroupManagement,
  azzarImageGeneration,
  azzarKnowledgeBase,
  azzarLocalSystem,
  azzarNotebook,
  azzarPageAgent,
  azzarSkillStore,
  azzarSkills,
  azzarTask,
  azzarUserInteraction,
  azzarUserMemory,
  azzarWebBrowsing,
  azzarWebOnboarding,
];

const fixtureRegistry = new Map<string, ToolRenderFixture>();
const customToolsets = new Map<string, ToolsetFixtureModule>();

for (const toolset of toolsetModules) {
  customToolsets.set(toolset.identifier, toolset);
  for (const [apiName, fixture] of Object.entries(toolset.fixtures)) {
    fixtureRegistry.set(`${toolset.identifier}:${apiName}`, fixture);
  }
}

const manifestByIdentifier = new Map<string, BuiltinToolManifest>(
  builtinTools.map((tool) => [tool.identifier, tool.manifest]),
);

export const getToolRenderFixture = (
  identifier: string,
  apiName: string,
  api?: AzzarChatPluginApi,
): ToolRenderFixture => {
  const fixture = fixtureRegistry.get(`${identifier}:${apiName}`);
  if (fixture) return fixture;

  return single({
    args: buildSchemaSample(api?.parameters, apiName) || {},
  });
};

export const getToolRenderMeta = (identifier: string, apiName: string): ToolRenderMeta => {
  const manifest = manifestByIdentifier.get(identifier);
  const api = manifest?.api.find((item) => item.name === apiName);
  const customToolset = customToolsets.get(identifier);
  const customApi = customToolset?.apiList?.find((item) => item.name === apiName);

  return {
    api,
    apiName,
    description: api?.description || customApi?.description,
    identifier,
    toolsetDescription: manifest?.meta.description || customToolset?.meta?.description,
    toolsetName: manifest?.meta.title || customToolset?.meta?.title || humanize(identifier),
  };
};
