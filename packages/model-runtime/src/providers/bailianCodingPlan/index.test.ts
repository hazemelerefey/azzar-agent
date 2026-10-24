// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { AzzarBailianCodingPlanAI } from './index';

const provider = ModelProvider.BailianCodingPlan;
const defaultBaseURL = 'https://coding.dashscope.aliyuncs.com/v1';

testProvider({
  Runtime: AzzarBailianCodingPlanAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_BAILIAN_CODING_PLAN_CHAT_COMPLETION',
  chatModel: 'qwen3.5-plus',
  test: {
    skipAPICall: true,
  },
});
