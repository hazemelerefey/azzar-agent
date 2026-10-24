import type { TraceNameMap } from '@azzar/types';

export const AZZAR_CHAT_TRACE_HEADER = 'X-azzar-trace';
export const AZZAR_CHAT_TRACE_ID = 'X-azzar-chat-trace-id';
export const AZZAR_CHAT_OBSERVATION_ID = 'X-azzar-observation-id';

export interface TracePayload {
  /**
   * if user allow to trace
   */
  enabled?: boolean;
  observationId?: string;
  /**
   * chat session: agentId or groupId
   */
  sessionId?: string;
  tags?: string[];
  /**
   * chat topicId
   */
  topicId?: string;
  traceId?: string;
  traceName?: TraceNameMap;
  /**
   * user uuid
   */
  userId?: string;
}
