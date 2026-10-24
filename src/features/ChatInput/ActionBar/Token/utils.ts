import { manualModeExcludeToolIds } from '@azzar/builtin-tools';
import type { AzzarAgentChatConfig, RuntimeEnvMode } from '@azzar/types';

interface ToolContextRefreshKeyOptions {
  agentId?: string;
  enableAgentMode?: boolean;
  hasEnabledKnowledgeBases?: boolean;
  isModelBuiltinSearchInternal?: boolean;
  isModelHasBuiltinSearch?: boolean;
  isProviderHasBuiltinSearch?: boolean;
  memoryEnabled?: boolean;
  runtimeMode?: RuntimeEnvMode;
  searchMode?: AzzarAgentChatConfig['searchMode'];
  skillActivateMode?: AzzarAgentChatConfig['skillActivateMode'];
  useModelBuiltinSearch?: boolean;
}

export const getToolExcludeDefaultToolIds = (
  skillActivateMode?: AzzarAgentChatConfig['skillActivateMode'],
) => (skillActivateMode === 'manual' ? manualModeExcludeToolIds : undefined);

export const getToolContextRefreshKey = ({
  agentId,
  enableAgentMode,
  hasEnabledKnowledgeBases,
  isModelBuiltinSearchInternal,
  isModelHasBuiltinSearch,
  isProviderHasBuiltinSearch,
  memoryEnabled,
  runtimeMode,
  searchMode,
  skillActivateMode,
  useModelBuiltinSearch,
}: ToolContextRefreshKeyOptions) =>
  [
    agentId || '',
    enableAgentMode === false ? 'chat' : 'agent',
    searchMode || 'auto',
    useModelBuiltinSearch ? 'model-search' : 'app-search',
    skillActivateMode || 'auto',
    memoryEnabled ? 'memory-on' : 'memory-off',
    hasEnabledKnowledgeBases ? 'knowledge-on' : 'knowledge-off',
    runtimeMode || 'none',
    isProviderHasBuiltinSearch ? 'provider-search-on' : 'provider-search-off',
    isModelHasBuiltinSearch ? 'model-search-on' : 'model-search-off',
    isModelBuiltinSearchInternal ? 'internal-search-on' : 'internal-search-off',
  ].join('|');
