import { AzzarAi21AI } from './providers/ai21';
import { Azzar302AI } from './providers/ai302';
import { AzzarAi360AI } from './providers/ai360';
import { AzzarAiHubMixAI } from './providers/aihubmix';
import { AzzarAkashChatAI } from './providers/akashchat';
import { AzzarAntGroupAI } from './providers/antgroup';
import { AzzarAnthropicAI } from './providers/anthropic';
import { AzzarAzureAI } from './providers/azureai';
import { AzzarAzureOpenAI } from './providers/azureOpenai';
import { AzzarBaichuanAI } from './providers/baichuan';
import { AzzarBailianCodingPlanAI } from './providers/bailianCodingPlan';
import { AzzarBedrockAI } from './providers/bedrock';
import { AzzarBflAI } from './providers/bfl';
import { AzzarCerebrasAI } from './providers/cerebras';
import { AzzarChatGPTAI } from './providers/chatGPT';
import { AzzarCloudflareAI } from './providers/cloudflare';
import { AzzarCohereAI } from './providers/cohere';
import { AzzarCometAPIAI } from './providers/cometapi';
import { AzzarComfyUI } from './providers/comfyui';
import { AzzarDeepSeekAI } from './providers/deepseek';
import { AzzarFalAI } from './providers/fal';
import { AzzarFireworksAI } from './providers/fireworksai';
import { AzzarGiteeAI } from './providers/giteeai';
import { AzzarGithubAI } from './providers/github';
import { AzzarGithubCopilotAI } from './providers/githubCopilot';
import { AzzarGLMCodingPlanAI } from './providers/glmCodingPlan';
import { AzzarGoogleAI } from './providers/google';
import { AzzarGroq } from './providers/groq';
import { AzzarHigressAI } from './providers/higress';
import { AzzarHuggingFaceAI } from './providers/huggingface';
import { AzzarHunyuanAI } from './providers/hunyuan';
import { AzzarInfiniAI } from './providers/infiniai';
import { AzzarInternLMAI } from './providers/internlm';
import { AzzarJinaAI } from './providers/jina';
import { AzzarKimiCodingPlanAI } from './providers/kimiCodingPlan';
import { AzzarLMStudioAI } from './providers/lmstudio';
import { AZZARAI } from './providers/azzar';
import { AzzarLongCatAI } from './providers/longcat';
import { AzzarMetaAI } from './providers/meta';
import { AzzarMinimaxAI } from './providers/minimax';
import { AzzarMinimaxCodingPlanAI } from './providers/minimaxCodingPlan';
import { AzzarMistralAI } from './providers/mistral';
import { AzzarModelScopeAI } from './providers/modelscope';
import { AzzarMoonshotAI } from './providers/moonshot';
import { AzzarNebiusAI } from './providers/nebius';
import { AzzarNewAPIAI } from './providers/newapi';
import { AzzarNovitaAI } from './providers/novita';
import { AzzarNvidiaAI } from './providers/nvidia';
import { AzzarOllamaAI } from './providers/ollama';
import { AzzarOllamaCloudAI } from './providers/ollamacloud';
import { AzzarOpenAI } from './providers/openai';
import { AzzarOpenCodeCodingPlanAI } from './providers/opencodeCodingPlan';
import { AzzarOpenCodeZenAI } from './providers/opencodeZen';
import { AzzarOpenRouterAI } from './providers/openrouter';
import { AzzarPerplexityAI } from './providers/perplexity';
import { AzzarPPIOAI } from './providers/ppio';
import { AzzarQiniuAI } from './providers/qiniu';
import { AzzarQwenAI } from './providers/qwen';
import { AzzarReplicateAI } from './providers/replicate';
import { AzzarSambaNovaAI } from './providers/sambanova';
import { AzzarSearch1API } from './providers/search1api';
import { AzzarSenseNovaAI } from './providers/sensenova';
import { AzzarSiliconCloudAI } from './providers/siliconcloud';
import { AzzarSparkAI } from './providers/spark';
import { AzzarStepfunAI } from './providers/stepfun';
import { AzzarStraicoAI } from './providers/straico';
import { AzzarStreamLakeAI } from './providers/streamlake';
import { AzzarSuperGrokAI } from './providers/superGrok';
import { AzzarTaichuAI } from './providers/taichu';
import { AzzarTencentCloudAI } from './providers/tencentcloud';
import { AzzarTogetherAI } from './providers/togetherai';
import { AzzarUnslothAI } from './providers/unsloth';
import { AzzarUpstageAI } from './providers/upstage';
import { AzzarV0AI } from './providers/v0';
import { AzzarVercelAIGatewayAI } from './providers/vercelaigateway';
import { AzzarVLLMAI } from './providers/vllm';
import { AzzarVolcengineAI } from './providers/volcengine';
import { AzzarVolcengineCodingPlanAI } from './providers/volcengineCodingPlan';
import { AzzarWenxinAI } from './providers/wenxin';
import { AzzarXAI } from './providers/xai';
import { AzzarXiaomiMiMoAI } from './providers/xiaomimimo';
import { AzzarXinferenceAI } from './providers/xinference';
import { AzzarZenMuxAI } from './providers/zenmux';
import { AzzarZeroOneAI } from './providers/zeroone';
import { AzzarZhipuAI } from './providers/zhipu';

export const providerRuntimeMap = {
  ai21: AzzarAi21AI,
  ai302: Azzar302AI,
  ai360: AzzarAi360AI,
  aihubmix: AzzarAiHubMixAI,
  akashchat: AzzarAkashChatAI,
  antgroup: AzzarAntGroupAI,
  anthropic: AzzarAnthropicAI,
  bailiancodingplan: AzzarBailianCodingPlanAI,
  azure: AzzarAzureOpenAI,
  azureai: AzzarAzureAI,
  baichuan: AzzarBaichuanAI,
  bedrock: AzzarBedrockAI,
  bfl: AzzarBflAI,
  cerebras: AzzarCerebrasAI,
  chatgpt: AzzarChatGPTAI,
  cloudflare: AzzarCloudflareAI,
  cohere: AzzarCohereAI,
  cometapi: AzzarCometAPIAI,
  comfyui: AzzarComfyUI,
  deepseek: AzzarDeepSeekAI,
  fal: AzzarFalAI,
  fireworksai: AzzarFireworksAI,
  giteeai: AzzarGiteeAI,
  github: AzzarGithubAI,
  githubcopilot: AzzarGithubCopilotAI,
  google: AzzarGoogleAI,
  glmcodingplan: AzzarGLMCodingPlanAI,
  groq: AzzarGroq,
  higress: AzzarHigressAI,
  huggingface: AzzarHuggingFaceAI,
  hunyuan: AzzarHunyuanAI,
  infiniai: AzzarInfiniAI,
  internlm: AzzarInternLMAI,
  jina: AzzarJinaAI,
  kimicodingplan: AzzarKimiCodingPlanAI,
  lmstudio: AzzarLMStudioAI,
  azzar: AZZARAI,
  longcat: AzzarLongCatAI,
  meta: AzzarMetaAI,
  minimax: AzzarMinimaxAI,
  minimaxcodingplan: AzzarMinimaxCodingPlanAI,
  mistral: AzzarMistralAI,
  modelscope: AzzarModelScopeAI,
  moonshot: AzzarMoonshotAI,
  nebius: AzzarNebiusAI,
  newapi: AzzarNewAPIAI,
  novita: AzzarNovitaAI,
  nvidia: AzzarNvidiaAI,
  ollama: AzzarOllamaAI,
  ollamacloud: AzzarOllamaCloudAI,
  opencodecodingplan: AzzarOpenCodeCodingPlanAI,
  opencodezen: AzzarOpenCodeZenAI,
  openai: AzzarOpenAI,
  openrouter: AzzarOpenRouterAI,
  perplexity: AzzarPerplexityAI,
  ppio: AzzarPPIOAI,
  qiniu: AzzarQiniuAI,
  qwen: AzzarQwenAI,
  replicate: AzzarReplicateAI,
  router: AzzarNewAPIAI,
  sambanova: AzzarSambaNovaAI,
  search1api: AzzarSearch1API,
  sensenova: AzzarSenseNovaAI,
  siliconcloud: AzzarSiliconCloudAI,
  spark: AzzarSparkAI,
  stepfun: AzzarStepfunAI,
  straico: AzzarStraicoAI,
  streamlake: AzzarStreamLakeAI,
  supergrok: AzzarSuperGrokAI,
  taichu: AzzarTaichuAI,
  tencentcloud: AzzarTencentCloudAI,
  togetherai: AzzarTogetherAI,
  unsloth: AzzarUnslothAI,
  upstage: AzzarUpstageAI,
  v0: AzzarV0AI,
  vercelaigateway: AzzarVercelAIGatewayAI,
  vllm: AzzarVLLMAI,
  volcengine: AzzarVolcengineAI,
  volcenginecodingplan: AzzarVolcengineCodingPlanAI,
  wenxin: AzzarWenxinAI,
  xai: AzzarXAI,
  xiaomimimo: AzzarXiaomiMiMoAI,
  xinference: AzzarXinferenceAI,
  zenmux: AzzarZenMuxAI,
  zeroone: AzzarZeroOneAI,
  zhipu: AzzarZhipuAI,
};
