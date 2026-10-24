import type { RouterRuntimeRequestContext } from '@azzar/types';

interface RouterInstance {
  apiType: string;
  models?: string[];
  options: {
    accessKeyId?: string;
    accessKeySecret?: string;
    apiKey?: string;
    apiVersion?: string;
    baseURL?: string;
    baseURLOrAccountID?: string;
    dangerouslyAllowBrowser?: boolean;
    region?: string;
    sessionToken?: string;
  };
}

interface AzzarRouterRuntimeOptions {
  id: string;
  routers: (options: any, runtimeContext: RouterRuntimeRequestContext) => Promise<RouterInstance[]>;
}

export const azzarRouterRuntimeOptions: AzzarRouterRuntimeOptions = {
  id: 'azzar',

  routers: async (_options, { model: _model }) => {
    return [];
  },
};
