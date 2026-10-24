import { DEFAULT_MODEL_PROVIDER_LIST } from 'model-bank/modelProviders';
import AZZARProvider from 'model-bank/modelProviders/azzar';

const locales: Record<`${string}.description`, string> = {};

const providers = [AZZARProvider, ...DEFAULT_MODEL_PROVIDER_LIST];

providers.forEach((provider) => {
  if (!provider.description) return;
  locales[`${provider.id}.description`] = provider.description;
});

export default locales;
