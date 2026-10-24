import type { AiFullModelCard, AiModelType } from 'model-bank';
import { loadModels as loadModelBankModels, ModelProvider } from 'model-bank';

interface AzzarModelConfig {
  models: AiFullModelCard[];
  planCardModels: string[];
  updatedAt?: string;
  version: number;
}

export interface AzzarModelPricingContext {
  plan: string;
  scope: 'personal';
}

export interface AzzarModelPricingOptions {
  pricingContext?: AzzarModelPricingContext;
}

const getDefaultAzzarModelConfig = (): AzzarModelConfig => ({
  models: [],
  planCardModels: [],
  version: 1,
});

const loadAzzarModelConfig = async (): Promise<AzzarModelConfig> =>
  getDefaultAzzarModelConfig();

export const loadModels = async (_options?: AzzarModelPricingOptions) =>
  loadModelBankModels({
    providerLoaders: {
      [ModelProvider.AZZAR]: loadAZZARModels,
    },
  });

const loadAZZARModels = async (): Promise<AiFullModelCard[]> =>
  (await loadAzzarModelConfig()).models;

export const loadAZZARPlanCardModels = async (): Promise<string[]> =>
  (await loadAzzarModelConfig()).planCardModels;

export const isAZZARModelAvailable = (
  _id: string,
  _expectedType: AiModelType,
  _options?: {
    getUserEmail?: () => Promise<string | null | undefined>;
    userEmail?: string | null;
  },
): boolean => false;
