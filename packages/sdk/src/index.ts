import type { Config } from './generated/client';
import { createClient, createConfig } from './generated/client';
import { AZZAR } from './generated/sdk.gen';

export const DEFAULT_BASE_URL = 'https://app.hazemelerefy.tech';

export interface AZZAROptions extends Omit<Config, 'auth' | 'baseUrl'> {
  /** AZZAR API Key (`sk-lh-...`) or an OIDC JWT */
  apiKey: string;
  /** API origin, defaults to AZZAR Cloud (`https://app.hazemelerefy.tech`) */
  baseURL?: string;
}

/**
 * Create a resource-style AZZAR API client: `azzar.agents.list()`,
 * `azzar.files.uploadBatch()`, `azzar.users.me()`, …
 *
 * Resources, methods, and schemas are generated from
 * `packages/openapi/openapi.yml` — run `bun generate` after the spec changes.
 */
export const createAZZAR = (options: AZZAROptions): AZZAR => {
  const { apiKey, baseURL = DEFAULT_BASE_URL, ...clientConfig } = options;
  const config: Config = { ...clientConfig, auth: () => apiKey, baseUrl: baseURL };

  return new AZZAR({ client: createClient(createConfig(config)) });
};

export type { Client, Config } from './generated/client';
export { AZZAR } from './generated/sdk.gen';
export type * from './generated/types.gen';
