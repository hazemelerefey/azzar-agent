// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { AzzarAi21AI } from './index';

testProvider({
  Runtime: AzzarAi21AI,
  provider: ModelProvider.Ai21,
  defaultBaseURL: 'https://api.ai21.com/studio/v1',
  chatDebugEnv: 'DEBUG_AI21_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
