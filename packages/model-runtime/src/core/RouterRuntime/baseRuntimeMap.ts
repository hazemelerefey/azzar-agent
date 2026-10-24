import { AzzarAnthropicAI } from '../../providers/anthropic';
import { AzzarAzureAI } from '../../providers/azureai';
import { AzzarAzureOpenAI } from '../../providers/azureOpenai';
import { AzzarBedrockAI } from '../../providers/bedrock';
import { AzzarCloudflareAI } from '../../providers/cloudflare';
import { AzzarDeepSeekAI } from '../../providers/deepseek';
import { AzzarFalAI } from '../../providers/fal';
import { AzzarGoogleAI } from '../../providers/google';
import { AzzarMetaAI } from '../../providers/meta';
import { AzzarMinimaxAI } from '../../providers/minimax';
import { AzzarMoonshotAI } from '../../providers/moonshot';
import { AzzarOpenAI } from '../../providers/openai';
import { AzzarQwenAI } from '../../providers/qwen';
import { AzzarVertexAI } from '../../providers/vertexai';
import { AzzarVolcengineAI } from '../../providers/volcengine';
import { AzzarXAI } from '../../providers/xai';
import { AzzarXiaomiMiMoAI } from '../../providers/xiaomimimo';
import { AzzarZhipuAI } from '../../providers/zhipu';
import type { ApiType, RuntimeClass } from './apiTypes';

export const baseRuntimeMap = {
  anthropic: AzzarAnthropicAI,
  azure: AzzarAzureAI,
  azureopenai: AzzarAzureOpenAI,
  bedrock: AzzarBedrockAI,
  cloudflare: AzzarCloudflareAI,
  deepseek: AzzarDeepSeekAI,
  fal: AzzarFalAI,
  google: AzzarGoogleAI,
  meta: AzzarMetaAI,
  minimax: AzzarMinimaxAI,
  moonshot: AzzarMoonshotAI,
  openai: AzzarOpenAI,
  qwen: AzzarQwenAI,
  vertexai: AzzarVertexAI,
  volcengine: AzzarVolcengineAI,
  xai: AzzarXAI,
  xiaomimimo: AzzarXiaomiMiMoAI,
  zhipu: AzzarZhipuAI,
} satisfies Record<ApiType, RuntimeClass>;
