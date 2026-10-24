import { getBuiltinRenderDisplayControl } from '@azzar/builtin-tools/displayControls';
import { getComposioAppByIdentifier, getAzzarSkillProviderById } from '@azzar/const';
import { type RenderDisplayControl, type ToolManifest } from '@azzar/types';

import {
  isInstalledPluginAvailableInCurrentEnv,
  isToolAvailableInCurrentEnv,
} from '@/helpers/toolAvailability';
import { type MetaData } from '@/types/meta';
import { type AzzarToolMeta } from '@/types/tool/tool';

import { type ToolStoreState } from '../initialState';
import { agentSkillsSelectors } from '../slices/agentSkills/selectors';
import { builtinToolSelectors } from '../slices/builtin/selectors';
import { ComposioServerStatus } from '../slices/composioStore';
import { azzarSkillStoreSelectors } from '../slices/azzarSkillStore';
import { AzzarSkillStatus } from '../slices/azzarSkillStore/types';
import { pluginSelectors } from '../slices/plugin/selectors';

const metaList = (s: ToolStoreState): AzzarToolMeta[] => {
  const pluginList = pluginSelectors.installedPluginMetaList(s) as AzzarToolMeta[];
  const azzarSkillList = azzarSkillStoreSelectors.metaList(s) as AzzarToolMeta[];

  return builtinToolSelectors.metaList(s).concat(pluginList).concat(azzarSkillList);
};

/**
 * All installed discoverable tools across every source (builtins, plugins, skills).
 * Excludes only tools with `discoverable: false` (pure infrastructure / internal).
 * Includes hidden and runtime-managed builtins (web-browsing, memory, cloud-sandbox, etc.)
 * that `metaList` hides from the chat toolbar.
 */
const discoverableMetaList = (s: ToolStoreState): AzzarToolMeta[] => {
  const pluginList = pluginSelectors.installedPluginMetaList(s) as AzzarToolMeta[];
  const azzarSkillList = azzarSkillStoreSelectors.metaList(s) as AzzarToolMeta[];

  return builtinToolSelectors.discoverableMetaList(s).concat(pluginList).concat(azzarSkillList);
};

const getMetaById =
  (id: string) =>
  (s: ToolStoreState): MetaData | undefined => {
    const item = metaList(s).find((m) => m.identifier === id);

    if (!item) return;

    if (item.meta) return item.meta;

    return {
      avatar: item?.avatar,
      backgroundColor: item?.backgroundColor,
      description: item?.description,
      title: item?.title,
    };
  };

const getManifestById =
  (id: string) =>
  (s: ToolStoreState): ToolManifest | undefined =>
    pluginSelectors
      .installedPluginManifestList(s)
      .concat(s.builtinTools.map((b) => b.manifest as ToolManifest))
      .find((i) => i.identifier === id);

// Get plugin manifest loading status
const getManifestLoadingStatus = (id: string) => (s: ToolStoreState) => {
  const manifest = getManifestById(id)(s);

  if (s.pluginInstallLoading[id]) return 'loading';

  if (s.pluginInstallErrors[id]) return 'error';

  if (!manifest) return 'error';

  if (!!manifest) return 'success';
};

const getPluginInstallError = (id: string) => (s: ToolStoreState) => s.pluginInstallErrors[id];

const isToolHasUI = (id: string) => (s: ToolStoreState) => {
  const manifest = getManifestById(id)(s);
  if (!manifest) return false;
  const builtinTool = s.builtinTools.find((tool) => tool.identifier === id);

  if (builtinTool && builtinTool.type === 'builtin') {
    return true;
  }

  return !!manifest.ui;
};

/**
 * Get the renderDisplayControl configuration for a specific tool API
 * Only works for builtin tools, plugins don't support this feature yet
 * @param identifier - Tool identifier
 * @param apiName - API name
 * @param pluginState - The tool_result's plugin state, for APIs whose display
 *   control depends on what the result carries (e.g. CC `Read` renders a
 *   thumbnail for an image and source text for anything else). Undefined while
 *   the call is still in flight.
 * @returns RenderDisplayControl value, defaults to 'collapsed'
 */
const getRenderDisplayControl =
  (identifier: string, apiName: string, pluginState?: unknown) =>
  (s: ToolStoreState): RenderDisplayControl => {
    const builtinTool = s.builtinTools.find((t) => t.identifier === identifier);
    const manifestControl = builtinTool?.manifest.api.find(
      (a) => a.name === apiName,
    )?.renderDisplayControl;
    if (manifestControl) return manifestControl;

    // Fallback for packages that don't ship a AzzarChat manifest (e.g. Claude Code —
    // its tools come from Anthropic tool_use blocks at runtime).
    return getBuiltinRenderDisplayControl(identifier, apiName, pluginState) ?? 'collapsed';
  };

export interface AvailableToolForDiscovery {
  description: string;
  identifier: string;
  name: string;
}

/**
 * Get all tools available for tool discovery (activateTools).
 * Built from raw state to avoid inheriting unrelated filtering logic.
 *
 * Sources:
 * 1. Builtin tools (from s.builtinTools) — exclude non-discoverable, skills, platform-unavailable
 * 2. User-installed plugins (from s.installedPlugins) — exclude Composio/AZZAR Skill/agent skill overlap
 * 3. Composio MCP servers (connected) — description from COMPOSIO_APP_TYPES
 * 4. AZZAR Skill servers (connected) — description from AZZAR_SKILL_PROVIDERS
 */
const availableToolsForDiscovery = (s: ToolStoreState): AvailableToolForDiscovery[] => {
  // Build exclusion sets for deduplication
  const builtinSkillIds = new Set((s.builtinSkills || []).map((skill) => skill.identifier));
  const agentSkillIds = new Set(
    agentSkillsSelectors.getAgentSkills(s).map((skill) => skill.identifier),
  );
  const composioIds = new Set((s.composioServers || []).map((server) => server.identifier));
  const azzarSkillIds = new Set((s.azzarSkillServers || []).map((server) => server.identifier));

  // 1. Builtin tools — directly from s.builtinTools
  const builtinItems = s.builtinTools
    .filter((tool) => tool.discoverable !== false)
    .filter((tool) => !builtinSkillIds.has(tool.identifier))
    .filter((tool) => isToolAvailableInCurrentEnv(tool.identifier))
    .map((tool) => ({
      description: tool.description || '',
      identifier: tool.identifier,
      name: tool.title || tool.identifier,
    }));

  // 2. User-installed plugins — only full records: a plugin painted from the
  //    cached display projection has no connection yet, so it cannot be activated.
  //    Exclude Composio, AZZAR Skill, and agent skill entries (they are handled in dedicated sources)
  const pluginItems = pluginSelectors
    .confirmedInstalledPlugins(s)
    .filter((p) => !composioIds.has(p.identifier))
    .filter((p) => !azzarSkillIds.has(p.identifier))
    .filter((p) => !agentSkillIds.has(p.identifier))
    .filter((p) => !p.customParams?.composio) // extra safety for Composio plugins
    .filter((plugin) => isInstalledPluginAvailableInCurrentEnv(plugin))
    .map((plugin) => {
      const meta = plugin.manifest?.meta;
      return {
        description: meta?.description || '',
        identifier: plugin.identifier,
        name: meta?.title || plugin.identifier,
      };
    });

  // 3. Composio MCP servers (connected only)
  const composioItems = (s.composioServers || [])
    .filter((server) => server.status === ComposioServerStatus.ACTIVE && server.tools?.length)
    // A connector identifier can have legacy Composio and current AZZAR
    // connections at the same time. Tool discovery is identifier-based, so the
    // canonical AZZAR connection must own the single visible entry.
    .filter(
      (server) =>
        !s.azzarSkillServers?.some(
          (item) =>
            item.identifier === server.identifier && item.status === AzzarSkillStatus.CONNECTED,
        ),
    )
    .map((server) => {
      const config = getComposioAppByIdentifier(server.identifier);
      return {
        description: config?.description || '',
        identifier: server.identifier,
        name: config?.label || server.label,
      };
    });

  // 4. AZZAR Skill servers (connected only)
  const azzarSkillItems = (s.azzarSkillServers || [])
    .filter((server) => server.status === AzzarSkillStatus.CONNECTED)
    .map((server) => {
      const config = getAzzarSkillProviderById(server.identifier);
      return {
        description: config?.description || '',
        identifier: server.identifier,
        name: config?.label || server.name,
      };
    });

  return [...builtinItems, ...pluginItems, ...composioItems, ...azzarSkillItems];
};

export const toolSelectors = {
  availableToolsForDiscovery,
  discoverableMetaList,
  getManifestById,
  getManifestLoadingStatus,
  getPluginInstallError,
  getMetaById,
  getRenderDisplayControl,
  isToolHasUI,
  metaList,
};
