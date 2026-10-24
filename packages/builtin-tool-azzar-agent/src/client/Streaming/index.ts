import type { BuiltinStreaming } from '@azzar/types';

import { AzzarAgentApiName } from '../../types';
import { CallSubAgentStreaming } from './CallSubAgent';
import { CreatePlanStreaming } from './CreatePlan';

/**
 * Azzar Agent Streaming Components Registry
 *
 * Streaming components render tool calls while they are still
 * executing, allowing real-time feedback to users.
 */
export const AzzarAgentStreamings: Record<string, BuiltinStreaming> = {
  [AzzarAgentApiName.callSubAgent]: CallSubAgentStreaming as BuiltinStreaming,
  [AzzarAgentApiName.createPlan]: CreatePlanStreaming as BuiltinStreaming,
};

export { CallSubAgentStreaming } from './CallSubAgent';
export { CreatePlanStreaming } from './CreatePlan';
