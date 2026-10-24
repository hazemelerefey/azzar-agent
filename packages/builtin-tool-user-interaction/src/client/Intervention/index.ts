import type { BuiltinIntervention } from '@azzar/types';

import { UserInteractionApiName } from '../../types';
import AskUserQuestionIntervention from './AskUserQuestion';

export const UserInteractionInterventions: Record<string, BuiltinIntervention> = {
  [UserInteractionApiName.askUserQuestion]: AskUserQuestionIntervention as BuiltinIntervention,
};
