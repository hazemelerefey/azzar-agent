import { AZZAR_IDENTITY_BLOCK } from '@azzar/builtin-agents';
import { REQUEST_TOPIC_ID_HEADER } from '@azzar/const';
import { type ChatCompletionErrorPayload } from '@azzar/model-runtime';
import { AGENT_RUNTIME_ERROR_SET } from '@azzar/model-runtime';
import { ChatErrorType } from '@azzar/types';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { initModelRuntimeForRequest } from '@/server/modules/AgentRuntime/llmRelay/oneShot';
import { runRouteWithLlmRelayRequest } from '@/server/modules/AgentRuntime/llmRelay/requestScope';
import { createTraceOptions } from '@/server/modules/ModelRuntime';
import { type ChatStreamPayload } from '@/types/openai/chat';
import { createErrorResponse } from '@/utils/errorResponse';
import { getTracePayload } from '@/utils/trace';

import { resolveValidWorkspaceIdFromRequest } from '../../_utils/workspace';

// If user don't use fluid compute, will build  failed
// this enforce user to enable fluid compute
export const maxDuration = 300;

export const POST = checkAuth(async (req: Request, { params, userId, serverDB }) => {
  const provider = (await params)!.provider!;

  try {
    const workspaceId = await resolveValidWorkspaceIdFromRequest({ req, serverDB, userId });

    // A provider only the user's device reaches is relayed back to the
    // requesting tab (one-shot relay); the channel stays open while the
    // response streams.
    return await runRouteWithLlmRelayRequest(req, userId, async () => {
      // ============  1. init chat model   ============ //
      const modelRuntime = await initModelRuntimeForRequest(serverDB, userId, provider, {
        workspaceId,
      });

      // ============  2. create chat completion   ============ //

      const data = (await req.json()) as ChatStreamPayload;

      // Defensive identity guard: ensure AZZAR identity is never omitted in chat completions
      if (Array.isArray(data.messages)) {
        const hasSystem = data.messages.some(
          (m) =>
            m.role === 'system' && typeof m.content === 'string' && m.content.trim().length > 0,
        );
        if (!hasSystem) {
          data.messages.unshift({
            content: AZZAR_IDENTITY_BLOCK,
            role: 'system',
          });
        }
      }

      const tracePayload = getTracePayload(req);

      let traceOptions = {};
      // If user enable trace
      if (tracePayload?.enabled) {
        traceOptions = createTraceOptions(data, { provider, trace: tracePayload });
      }

      return await modelRuntime.chat(data, {
        user: userId,
        ...traceOptions,
        metadata: { topicId: req.headers.get(REQUEST_TOPIC_ID_HEADER) ?? undefined },
        signal: req.signal,
      });
    });
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;

    // track the error at server side
    if (AGENT_RUNTIME_ERROR_SET.has(errorType as string)) {
      console.warn(`Route: [${provider}] ${errorType}:`, error);
    } else {
      console.error(`Route: [${provider}] ${errorType}:`, error);
    }

    return createErrorResponse(errorType, { error, ...res, provider });
  }
});
