import { AskUserQuestionInspector } from '@azzar/builtin-tool-user-interaction/client';
import type { BuiltinInspector } from '@azzar/types';

import { AzzarAgentApiName } from '../../types';
import { AnalyzeMediaInspector } from './AnalyzeMedia';
import { CallSubAgentInspector } from './CallSubAgent';
import { ClearTodosInspector } from './ClearTodos';
import { CreatePlanInspector } from './CreatePlan';
import { CreateTodosInspector } from './CreateTodos';
import { UpdatePlanInspector } from './UpdatePlan';
import { UpdateTodosInspector } from './UpdateTodos';
import { VentInspector } from './Vent';

/**
 * Azzar Agent Inspector Components Registry
 *
 * Inspector components customize the title/header area
 * of tool calls in the conversation UI.
 */
export const AzzarAgentInspectors: Record<string, BuiltinInspector> = {
  [AzzarAgentApiName.analyzeMedia]: AnalyzeMediaInspector as BuiltinInspector,
  [AzzarAgentApiName.askUserQuestion]: AskUserQuestionInspector as BuiltinInspector,
  [AzzarAgentApiName.callSubAgent]: CallSubAgentInspector as BuiltinInspector,
  [AzzarAgentApiName.clearTodos]: ClearTodosInspector as BuiltinInspector,
  [AzzarAgentApiName.createPlan]: CreatePlanInspector as BuiltinInspector,
  [AzzarAgentApiName.createTodos]: CreateTodosInspector as BuiltinInspector,
  [AzzarAgentApiName.updatePlan]: UpdatePlanInspector as BuiltinInspector,
  [AzzarAgentApiName.updateTodos]: UpdateTodosInspector as BuiltinInspector,
  [AzzarAgentApiName.vent]: VentInspector as BuiltinInspector,
};
