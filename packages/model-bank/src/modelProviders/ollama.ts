import type { ModelProviderCard } from '../types';

const Ollama: ModelProviderCard = {
  chatModels: [],
  checkModel: 'qwen2.5:7b',
  defaultShowBrowserRequest: false,
  description:
    'Ollama offers models across code generation, math, multilingual processing, and chat, supporting both enterprise and local deployments.',
  enabled: true,
  id: 'ollama',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ollama.com/library',
  name: 'Ollama',
  settings: {
    defaultShowBrowserRequest: false,
    sdkType: 'ollama',
    showApiKey: false,
    showModelFetcher: true,
  },
  showApiKey: false,
  url: 'https://ollama.com',
};

export default Ollama;
