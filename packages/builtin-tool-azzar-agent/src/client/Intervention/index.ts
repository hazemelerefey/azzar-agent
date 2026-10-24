import { AskUserQuestionIntervention } from '@azzar/builtin-tool-user-interaction/client';
import type { BuiltinIntervention } from '@azzar/types';

import { AzzarAgentApiName } from '../../types';
import AddTodoIntervention from './AddTodo';
import ClearTodosIntervention from './ClearTodos';
import CreatePlanIntervention from './CreatePlan';

/**
 * Azzar Agent Intervention Components Registry
 *
 * Intervention components allow users to review and modify tool parameters
 * before the tool is executed.
 *
 * `askUserQuestion` reuses the standalone user-interaction card: it renders as
 * an inline custom form (not the default approve/reject) — see
 * `isCustomInteractionIdentifier` in customInteractionHandlers.
 */
export const AzzarAgentInterventions: Record<string, BuiltinIntervention> = {
  [AzzarAgentApiName.askUserQuestion]: AskUserQuestionIntervention as BuiltinIntervention,
  [AzzarAgentApiName.clearTodos]: ClearTodosIntervention as BuiltinIntervention,
  [AzzarAgentApiName.createPlan]: CreatePlanIntervention as BuiltinIntervention,
  [AzzarAgentApiName.createTodos]: AddTodoIntervention as BuiltinIntervention,
};

export { default as AddTodoIntervention } from './AddTodo';
export { default as ClearTodosIntervention } from './ClearTodos';
export { default as CreatePlanIntervention } from './CreatePlan';
