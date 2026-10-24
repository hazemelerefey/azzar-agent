import type { MetaData } from '@azzar/types';
import type { ItemType } from '@azzar/ui';

export interface AgentTransferScope {
  userId?: string | null;
  visibility?: 'private' | 'public';
}

export const useAgentTransferMenuItem = (
  _agentId?: string,
  _agentMeta?: MetaData,
  _scope?: AgentTransferScope,
): ItemType[] | null => null;
