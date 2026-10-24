import type { AgentItem, AzzarAgentConfig } from '../agent';
import type { NewChatGroupAgent } from '../agentGroup';
import type { MetaData } from '../meta';

export const CHAT_GROUP_SESSION_ID_PREFIX = 'cg_' as const;

export const isChatGroupSessionId = (id?: string | null): id is string =>
  typeof id === 'string' && id.startsWith(CHAT_GROUP_SESSION_ID_PREFIX);

export enum AzzarSessionType {
  Agent = 'agent',
  Group = 'group',
}

/**
 * Extended group member that includes both relation data and agent details
 */
export type GroupMemberWithAgent = NewChatGroupAgent & AgentItem;

/**
 * Azzar Agent Session
 */
export interface AzzarAgentSession {
  config: AzzarAgentConfig;
  createdAt: Date;
  group?: string;
  id: string;
  /** Market agent identifier for published agents */
  marketIdentifier?: string;
  meta: MetaData;
  model: string;
  pinned?: boolean;
  tags?: string[];
  type: AzzarSessionType.Agent;
  updatedAt: Date;
}

/**
 * Group chat (not confuse with session group)
 */
export interface AzzarGroupSession {
  createdAt: Date;
  group?: string;
  id: string; // Start with CHAT_GROUP_SESSION_ID_PREFIX
  members?: GroupMemberWithAgent[];
  meta: MetaData;
  pinned?: boolean;
  tags?: string[];
  type: AzzarSessionType.Group;
  updatedAt: Date;
}

export interface AzzarAgentSettings {
  /**
   * Language model agent configuration
   */
  config: AzzarAgentConfig;
  meta: MetaData;
}

// Union type for all session types
export type AzzarSession = AzzarAgentSession | AzzarGroupSession;

export type AzzarSessions = AzzarSession[];
