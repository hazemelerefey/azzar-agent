import { azzarRouterRuntimeOptions } from '@azzar/business-model-runtime';

import { createRouterRuntime } from '../../core/RouterRuntime';
import type { CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';

export const AZZARAI = createRouterRuntime(
  azzarRouterRuntimeOptions as CreateRouterRuntimeOptions,
);
