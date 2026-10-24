import { UserInteractionExecutionRuntime } from '@azzar/builtin-tool-user-interaction/executionRuntime';
import { UserInteractionExecutor } from '@azzar/builtin-tool-user-interaction/executor';

const runtime = new UserInteractionExecutionRuntime();

export const userInteractionExecutor = new UserInteractionExecutor(runtime);
