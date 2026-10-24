import { createReplicaState, type ReplicaState } from '@/libs/replica';

import { type AzzarSkillServer, type AzzarSkillTool } from './types';

/**
 * AZZAR Skill Store state interface
 *
 * NOTE: connection states and tool data are a local-first copy of the Market
 * API — the replica persists them and the network only confirms.
 */
export interface AzzarSkillStoreState {
  /** Set of executing tool call IDs */
  azzarSkillExecutingToolIds: Set<string>;
  /** Set of loading Provider IDs */
  azzarSkillLoadingIds: Set<string>;
  /**
   * The connected providers of the active scope — the view of the
   * `azzarSkillServers` replica. `undefined` until the persisted row hydrates
   * or the first network response lands, so an un-loaded list never reads as an
   * empty one (and the empty default never blocks hydration).
   */
  azzarSkillServers?: AzzarSkillServer[];
  /** Replica bookkeeping of `azzarSkillServers`. */
  azzarSkillServersReplica: ReplicaState<AzzarSkillServer[]>;
  /** Replica view of the provider tool catalogs, one entry per provider id. */
  azzarSkillToolsMap: Record<string, AzzarSkillTool[]>;
  /** Replica bookkeeping of `azzarSkillToolsMap`. */
  azzarSkillToolsReplica: ReplicaState<AzzarSkillTool[]>;
}

/**
 * AZZAR Skill Store initial state
 */
export const initialAzzarSkillStoreState: AzzarSkillStoreState = {
  azzarSkillExecutingToolIds: new Set(),
  azzarSkillLoadingIds: new Set(),
  // Absent until the persisted row hydrates or the first network response lands.
  azzarSkillServers: undefined,
  azzarSkillServersReplica: createReplicaState(),
  azzarSkillToolsMap: {},
  azzarSkillToolsReplica: createReplicaState(),
};
