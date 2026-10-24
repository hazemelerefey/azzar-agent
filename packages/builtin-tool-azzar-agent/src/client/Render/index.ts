import { AskUserQuestionRender } from '@azzar/builtin-tool-user-interaction/client';

import { AzzarAgentApiName } from '../../types';
import CallSubAgentRender from './CallSubAgent';
import CreatePlan from './CreatePlan';
import TodoListRender from './TodoList';

/**
 * Azzar Agent Tool Render Components Registry
 *
 * Sub-agent dispatch operations render a card showing the dispatched
 * task(s). Plan operations render the PlanCard UI. Todo operations
 * share a single TodoList render.
 */
export const AzzarAgentRenders = {
  [AzzarAgentApiName.askUserQuestion]: AskUserQuestionRender,
  [AzzarAgentApiName.callSubAgent]: CallSubAgentRender,

  // Plan operations render the PlanCard UI
  [AzzarAgentApiName.createPlan]: CreatePlan,
  [AzzarAgentApiName.updatePlan]: CreatePlan,

  // All todo operations render the same TodoList UI
  [AzzarAgentApiName.clearTodos]: TodoListRender,
  [AzzarAgentApiName.createTodos]: TodoListRender,
  [AzzarAgentApiName.updateTodos]: TodoListRender,
};

export { default as CallSubAgentRender } from './CallSubAgent';
export { default as CreatePlan, PlanCard } from './CreatePlan';
export type { TodoListRenderState } from './TodoList';
export { default as TodoListRender, TodoListUI } from './TodoList';
