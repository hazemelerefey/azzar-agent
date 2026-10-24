import { describe, expect, it, vi } from 'vitest';

import { ConnectorDataError } from '../errors';
import {
  createGitHubMarketConnectorClient,
  createGitHubMarketTransport,
  type GitHubMarketProxyRequest,
} from './client-market';

const createProxy = () =>
  vi.fn(async (input: GitHubMarketProxyRequest): Promise<unknown> => {
    if (input.endpoint === '/user') {
      return { data: { id: 98_765, login: 'octocat' }, status: 200 };
    }
    if (input.endpoint === '/user/orgs') {
      return {
        data: [{ description: 'Making AI accessible.', login: 'azzar' }],
        status: 200,
      };
    }
    if (input.endpoint === '/repos/azzar/azzar/contributors') {
      return { data: [{ contributions: 12, login: 'octocat' }], status: 200 };
    }
    if (input.endpoint === '/repos/azzar/azzar/branches') {
      return { data: [{ name: 'canary', protected: true }, { name: 'main' }, {}], status: 200 };
    }
    if (input.endpoint === '/graphql') {
      const body = input.body as { query?: string };
      if (body.query?.includes('ConnectorDataGitHubProfile')) {
        return {
          data: {
            data: {
              viewer: {
                bio: 'Building tools.',
                company: '@azzar',
                location: 'Shanghai',
                login: 'octocat',
                name: 'Octocat',
                pronouns: 'they/them',
                websiteUrl: 'https://hazemelerefy.tech',
              },
            },
          },
          status: 200,
        };
      }
      return { data: { data: { viewer: { login: 'octocat' } } }, status: 200 };
    }
    throw new Error(`Unexpected endpoint: ${input.endpoint}`);
  });

describe('createGitHubMarketTransport', () => {
  /**
   * @example
   * Market injects OAuth credentials while the adapter preserves the existing
   * GitHub transport response shapes.
   */
  it('maps authenticated REST and GraphQL proxy responses into the shared transport', async () => {
    const proxyOAuthRequest = createProxy();
    const transport = createGitHubMarketTransport({ market: { proxyOAuthRequest } });

    /** @example `/user` becomes the minimal authenticated-user identity. */
    await expect(transport.getAuthenticatedUser()).resolves.toEqual({
      id: 98_765,
      login: 'octocat',
    });
    /** @example `/user/orgs` retains the organization fields consumed by the loader. */
    await expect(transport.listUserOrganizations({ perPage: 20 })).resolves.toEqual([
      { description: 'Making AI accessible.', login: 'azzar' },
    ]);
    /** @example Repository path segments and pagination are proxied without credentials. */
    await expect(
      transport.listRepositoryContributors({
        owner: 'azzar',
        perPage: 5,
        repository: 'azzar',
      }),
    ).resolves.toEqual([{ contributions: 12, login: 'octocat' }]);
    /** @example GraphQL unwraps the GitHub response envelope for existing Zod schemas. */
    await expect(
      transport.request({ operation: 'Test', query: 'query { viewer { login } }', variables: {} }),
    ).resolves.toEqual({ viewer: { login: 'octocat' } });
    /** @example Every request is routed through the GitHub Market provider. */
    expect(proxyOAuthRequest.mock.calls.every(([input]) => input.provider === 'github')).toBe(true);
  });
});

describe('createGitHubMarketConnectorClient', () => {
  /**
   * @example
   * Callers receive the same `GitHubConnectorClient` profile contract as native OAuth.
   */
  it('composes the Market adapter behind the shared client interface', async () => {
    const client = createGitHubMarketConnectorClient({
      market: { proxyOAuthRequest: createProxy() },
    });

    /** @example The normalized profile contract is independent of the auth provider. */
    await expect(client.getUserProfile()).resolves.toEqual({
      bio: 'Building tools.',
      company: '@azzar',
      externalAccountId: '98765',
      location: 'Shanghai',
      login: 'octocat',
      name: 'Octocat',
      pronouns: 'they/them',
      websiteUrl: 'https://hazemelerefy.tech',
    });
  });

  it('lists a repository branches through the REST proxy', async () => {
    const proxyOAuthRequest = createProxy();
    const transport = createGitHubMarketTransport({ market: { proxyOAuthRequest } });

    await expect(
      transport.listRepositoryBranches({ owner: 'azzar', perPage: 100, repository: 'azzar' }),
    ).resolves.toEqual([{ name: 'canary' }, { name: 'main' }, { name: null }]);

    expect(proxyOAuthRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/repos/azzar/azzar/branches',
        method: 'GET',
        parameters: [{ in: 'query', name: 'per_page', value: 100 }],
      }),
    );
  });
});

describe('GitHub proxy authorization failures', () => {
  it('normalizes an expired 401 to authorization unavailable', async () => {
    const client = createGitHubMarketConnectorClient({
      market: {
        proxyOAuthRequest: async () => ({ status: 401, data: {} }),
      },
    });
    const result = client.listAccessibleRepositories();
    await expect(result).rejects.toBeInstanceOf(ConnectorDataError);
    await expect(result).rejects.toMatchObject({
      code: 'github_authorization_unavailable',
      provider: 'github',
      retryable: false,
    });
  });

  it.each([403, 500, 503])('preserves HTTP %i as a request failure', async (status) => {
    const client = createGitHubMarketConnectorClient({
      market: {
        proxyOAuthRequest: async () => ({ status, data: {} }),
      },
    });
    const result = client.listAccessibleRepositories();
    await expect(result).rejects.not.toBeInstanceOf(ConnectorDataError);
    await expect(result).rejects.toMatchObject({ status });
  });
});
