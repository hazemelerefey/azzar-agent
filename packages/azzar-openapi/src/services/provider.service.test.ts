// @vitest-environment node
import type * as BusinessConst from '@azzar/business-const';
import { OFFICIAL_PROVIDER_DISABLE_ERROR } from '@azzar/business-const';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AzzarChatDatabase } from '@/database/type';

import { ProviderService } from './provider.service';

vi.mock('@/const/rbac', () => ({
  ALL_SCOPE: 'all',
}));

vi.mock('@azzar/database', () => ({
  buildWorkspacePayload: vi.fn(),
  buildWorkspaceWhere: vi.fn(),
}));

vi.mock('@/database/models/rbac', () => ({
  RbacModel: class {},
}));

vi.mock('@/database/schemas', () => ({
  agents: {},
  aiModels: {},
  aiProviders: {},
  files: {},
  knowledgeBases: {},
  messages: {},
  sessions: {},
  topics: {},
}));

vi.mock('@/server/modules/KeyVaultsEncrypt', () => ({
  KeyVaultsGateKeeper: {
    initWithEnvKey: vi.fn(),
  },
}));

vi.mock('@/utils/rbac', () => ({
  getScopePermissions: vi.fn(() => []),
}));

vi.mock('@azzar/business-const', async () => {
  const actual = await vi.importActual<typeof BusinessConst>('@azzar/business-const');

  return {
    ...actual,
    BRANDING_PROVIDER: 'azzar',
    ENABLE_BUSINESS_FEATURES: true,
    isOfficialProvider: (id: string) => id === 'azzar',
  };
});

describe('ProviderService', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createService = () => new ProviderService({} as AzzarChatDatabase, 'test-user-id');

  describe('official provider guard', () => {
    it('should reject creating the official provider as disabled', async () => {
      const service = createService();

      await expect(
        service.createProvider({
          enabled: false,
          id: 'azzar',
        }),
      ).rejects.toMatchObject({
        message: OFFICIAL_PROVIDER_DISABLE_ERROR,
        name: 'BusinessError',
      });
    });

    it('should reject updating the official provider as disabled', async () => {
      const service = createService();

      await expect(
        service.updateProvider({
          enabled: false,
          id: 'azzar',
        }),
      ).rejects.toMatchObject({
        message: OFFICIAL_PROVIDER_DISABLE_ERROR,
        name: 'BusinessError',
      });
    });
  });
});
