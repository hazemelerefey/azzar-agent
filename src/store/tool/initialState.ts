import {
  type AgentDocumentSkillsState,
  initialAgentDocumentSkillsState,
} from './slices/agentDocumentSkills/initialState';
import { type AgentSkillsState, initialAgentSkillsState } from './slices/agentSkills/initialState';
import { type BuiltinToolState, initialBuiltinToolState } from './slices/builtin/initialState';
import {
  type ComposioStoreState,
  initialComposioStoreState,
} from './slices/composioStore/initialState';
import { type ConnectorState, initialConnectorState } from './slices/connector/initialState';
import {
  type CustomPluginState,
  initialCustomPluginState,
} from './slices/customPlugin/initialState';
import {
  initialAzzarSkillStoreState,
  type AzzarSkillStoreState,
} from './slices/azzarSkillStore/initialState';
import { initialMCPStoreState, type MCPStoreState } from './slices/mcpStore/initialState';
import { initialPluginState, type PluginState } from './slices/plugin/initialState';
import {
  initialProjectSkillsState,
  type ProjectSkillsState,
} from './slices/projectSkills/initialState';

export type ToolStoreState = ConnectorState &
  PluginState &
  CustomPluginState &
  BuiltinToolState &
  MCPStoreState &
  ComposioStoreState &
  AzzarSkillStoreState &
  AgentSkillsState &
  AgentDocumentSkillsState &
  ProjectSkillsState;

export const initialState: ToolStoreState = {
  ...initialConnectorState,
  ...initialPluginState,
  ...initialCustomPluginState,
  ...initialBuiltinToolState,
  ...initialMCPStoreState,
  ...initialComposioStoreState,
  ...initialAzzarSkillStoreState,
  ...initialAgentSkillsState,
  ...initialAgentDocumentSkillsState,
  ...initialProjectSkillsState,
};
