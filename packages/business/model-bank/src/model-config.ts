import type { AiFullModelCard, AiModelType } from 'model-bank';
import { loadModels as loadModelBankModels, ModelProvider } from 'model-bank';

interface AZZARModelConfig {
  models: AiFullModelCard[];
  planCardModels: string[];
  updatedAt?: string;
  version: number;
}

export interface AZZARModelPricingContext {
  plan: string;
  scope: 'personal';
}

export interface AZZARModelPricingOptions {
  pricingContext?: AZZARModelPricingContext;
}

const getDefaultAZZARModelConfig = (): AZZARModelConfig => ({
  models: [],
  planCardModels: [],
  version: 1,
});

const loadAZZARModelConfig = async (): Promise<AZZARModelConfig> =>
  getDefaultAZZARModelConfig();

export const loadModels = async (_options?: AZZARModelPricingOptions) =>
  loadModelBankModels({
    providerLoaders: {
      [ModelProvider.AZZAR]: loadAZZARModels,
    },
  });

const loadAZZARModels = async (): Promise<AiFullModelCard[]> =>
  (await loadAZZARModelConfig()).models;

export const loadAZZARPlanCardModels = async (): Promise<string[]> =>
  (await loadAZZARModelConfig()).planCardModels;

export const isAZZARModelAvailable = (
  _id: string,
  _expectedType: AiModelType,
  _options?: {
    getUserEmail?: () => Promise<string | null | undefined>;
    userEmail?: string | null;
  },
): boolean => false;
