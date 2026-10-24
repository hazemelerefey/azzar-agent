import urlJoin from 'url-join';

import { OFFICIAL_SITE } from '@/const/url';

import { type ToolStoreState } from '../../initialState';
import { type AzzarSkillServer } from './types';
import { AzzarSkillStatus } from './types';

/**
 * AZZAR Skill Store Selectors
 */
export const azzarSkillStoreSelectors = {
  /**
   * Get all AZZAR Skill server identifiers as a set
   */
  getAllServerIdentifiers: (s: ToolStoreState): Set<string> => {
    const servers = s.azzarSkillServers || [];
    return new Set(servers.map((server) => server.identifier));
  },

  /**
   * Get all available tools from all connected servers
   */
  getAllTools: (s: ToolStoreState) => {
    const connectedServers = azzarSkillStoreSelectors.getConnectedServers(s);
    return connectedServers.flatMap((server) =>
      (server.tools || []).map((tool) => ({
        ...tool,
        provider: server.identifier,
      })),
    );
  },

  /**
   * Get all connected servers
   */
  getConnectedServers: (s: ToolStoreState): AzzarSkillServer[] =>
    (s.azzarSkillServers || []).filter(
      (server) => server.status === AzzarSkillStatus.CONNECTED,
    ),

  /**
   * Get server by identifier
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  getServerByIdentifier: (identifier: string) => (s: ToolStoreState) =>
    s.azzarSkillServers?.find((server) => server.identifier === identifier),

  /**
   * Get all AZZAR Skill servers
   */
  getServers: (s: ToolStoreState): AzzarSkillServer[] => s.azzarSkillServers || [],

  /**
   * Check if the given identifier is a AZZAR Skill server
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isAzzarSkillServer:
    (identifier: string) =>
    (s: ToolStoreState): boolean => {
      const servers = s.azzarSkillServers || [];
      return servers.some((server) => server.identifier === identifier);
    },

  /**
   * Check if a server is loading
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isServerLoading: (identifier: string) => (s: ToolStoreState) =>
    s.azzarSkillLoadingIds?.has(identifier) || false,

  /**
   * Check if a tool is currently executing
   */
  isToolExecuting: (provider: string, toolName: string) => (s: ToolStoreState) => {
    const toolId = `${provider}:${toolName}`;
    return s.azzarSkillExecutingToolIds?.has(toolId) || false;
  },

  /**
   * Get all AZZAR Skill tools as AzzarTool format for agent use
   * Converts AZZAR Skill tools into the format expected by ToolNameResolver
   */
  azzarSkillAsAzzarTools: (s: ToolStoreState) => {
    const servers = s.azzarSkillServers || [];
    const tools: any[] = [];

    for (const server of servers) {
      if (!server.tools || server.status !== AzzarSkillStatus.CONNECTED) continue;

      const apis = server.tools.map((tool) => ({
        description: tool.description || '',
        name: tool.name,
        parameters: tool.inputSchema || {},
      }));

      if (apis.length > 0) {
        tools.push({
          identifier: server.identifier,
          manifest: {
            api: apis,
            author: 'AZZAR Market',
            homepage: urlJoin(OFFICIAL_SITE, 'market'),
            identifier: server.identifier,
            meta: {
              avatar: server.icon || '🔗',
              description: `AZZAR Skill: ${server.name}`,
              tags: ['azzar-skill', server.identifier],
              title: server.name,
            },
            type: 'builtin',
            version: '1.0.0',
          },
          type: 'plugin',
        });
      }
    }

    return tools;
  },

  /**
   * Get metadata list for all connected AZZAR Skill servers
   * Used by toolSelectors.metaList for unified tool metadata resolution
   */
  metaList: (s: ToolStoreState) => {
    const servers = s.azzarSkillServers || [];

    return servers
      .filter((server) => server.status === AzzarSkillStatus.CONNECTED)
      .map((server) => ({
        identifier: server.identifier,
        meta: {
          avatar: server.icon || '🔗',
          description: `AZZAR Skill: ${server.name}`,
          title: server.name,
        },
      }));
  },
};
