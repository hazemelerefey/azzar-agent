import { type AzzarToolCustomPlugin } from '@/types/tool/plugin';

export interface CustomPluginState {
  customPluginSearchKeywords?: string;
  newCustomPlugin: Partial<AzzarToolCustomPlugin>;
}
export const defaultCustomPlugin: Partial<AzzarToolCustomPlugin> = {
  customParams: {
    apiMode: 'simple',
    enableSettings: false,
    manifestMode: 'url',
  },
  type: 'customPlugin',
};

export const initialCustomPluginState: CustomPluginState = {
  customPluginSearchKeywords: '',
  newCustomPlugin: defaultCustomPlugin,
};
