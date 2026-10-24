import { UserInteractionIdentifier } from '@azzar/builtin-tool-user-interaction';
import { UserInteractionExecutionRuntime } from '@azzar/builtin-tool-user-interaction/executionRuntime';

import { type ServerRuntimeRegistration } from './types';

export const userInteractionRuntime: ServerRuntimeRegistration = {
  factory: () => {
    return new UserInteractionExecutionRuntime();
  },
  identifier: UserInteractionIdentifier,
};
