import { lambdaClient } from '@/libs/trpc/client';
import { type AzzarAgentConfig } from '@/types/agent';
import {
  type AzzarAgentSession,
  type AzzarSessionType,
  type SessionGroupItem,
  type UpdateSessionParams,
} from '@/types/session';

/**
 * @deprecated Session service is legacy. Use agentService for agent CRUD operations.
 * Retains session-shell compatibility and independent session-group operations.
 */
export class SessionService {
  /** @deprecated Use agentService.createAgent instead */
  createSession = async (
    type: AzzarSessionType,
    data: Partial<AzzarAgentSession>,
  ): Promise<string> => {
    const { config, group, meta, ...session } = data;
    return lambdaClient.session.createSession.mutate({
      config: { ...config, ...meta } as any,
      session: { ...session, groupId: group },
      type,
    });
  };

  updateSession = (id: string, data: Partial<UpdateSessionParams>) => {
    const { group, pinned, meta, updatedAt } = data;
    return lambdaClient.session.updateSession.mutate({
      id,
      value: { groupId: group === 'default' ? null : group, pinned, ...meta, updatedAt },
    });
  };

  // TODO: Need to be fixed
  getSessionConfig = async (id: string): Promise<AzzarAgentConfig> => {
    // @ts-ignore
    return lambdaClient.agent.getAgentConfig.query({ sessionId: id });
  };

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  createSessionGroup = (
    name: string,
    sort?: number,
    visibility?: 'private' | 'public',
  ): Promise<string> => {
    return lambdaClient.sessionGroup.createSessionGroup.mutate({ name, sort, visibility });
  };

  removeSessionGroup = (id: string, removeChildren?: boolean) => {
    return lambdaClient.sessionGroup.removeSessionGroup.mutate({ id, removeChildren });
  };

  /** Rename / reorder only — scope fields are rejected server-side. */
  updateSessionGroup = (id: string, value: Partial<Pick<SessionGroupItem, 'name' | 'sort'>>) => {
    return lambdaClient.sessionGroup.updateSessionGroup.mutate({ id, value });
  };

  updateSessionGroupOrder = (sortMap: { id: string; sort: number }[]) => {
    return lambdaClient.sessionGroup.updateSessionGroupOrder.mutate({ sortMap });
  };
}

export const sessionService = new SessionService();
