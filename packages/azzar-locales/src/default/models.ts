import { AZZAR_DEFAULT_MODEL_LIST } from 'model-bank';

import { azzarHubOnlineModelDescriptions } from '../azzarOnlineModelDescriptions';
import { modelDescriptionOverrides } from '../modelDescriptionOverrides';

const locales: Record<`${string}.description`, string> = {};

AZZAR_DEFAULT_MODEL_LIST.forEach((model) => {
  if (!model.description) return;

  locales[`${model.id}.description`] = model.description;
});

Object.assign(locales, modelDescriptionOverrides);
Object.assign(locales, azzarHubOnlineModelDescriptions);

export default locales;
