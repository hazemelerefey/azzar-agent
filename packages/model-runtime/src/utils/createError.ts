import type {
  AgentInitErrorPayload,
  ChatCompletionErrorPayload,
  CreateImageErrorPayload,
  CreateVideoErrorPayload,
} from '../types';
import type { IAzzarAgentRuntimeErrorType } from '../types/error';

export const AgentRuntimeError = {
  chat: (error: ChatCompletionErrorPayload): ChatCompletionErrorPayload => error,
  createError: (
    errorType: IAzzarAgentRuntimeErrorType | string | number,
    error?: any,
  ): AgentInitErrorPayload => ({ error, errorType }),
  createImage: (error: CreateImageErrorPayload): CreateImageErrorPayload => error,
  createVideo: (error: CreateVideoErrorPayload): CreateVideoErrorPayload => error,
};
