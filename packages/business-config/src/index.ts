import { ModelProvider } from 'model-bank';

import type { UserModelProviderConfig } from '@azzar/types';

/**
 * Default LLM provider configuration. Every provider starts disabled;
 * users opt into the providers they need.
 */
export const DEFAULT_LLM_CONFIG = Object.fromEntries(
  Object.values(ModelProvider).map((provider) => [provider, { enabled: false }]),
) as UserModelProviderConfig;
