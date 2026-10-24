/**
 * @vitest-environment happy-dom
 */
import type { TaskTemplateConnectorReference } from '@azzar/const';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ConnectorConnectionMarketAuthRequiredError,
  useConnectorConnection,
} from './useConnectorConnection';

const mocks = vi.hoisted(() => ({
  marketAuth: {
    isAuthenticated: false,
    signIn: vi.fn(),
  },
  toolState: {
    checkAzzarSkillStatus: vi.fn(),
    composioServers: [],
    createComposioConnection: vi.fn(),
    getAzzarSkillAuthorizeUrl: vi.fn(),
    azzarSkillServers: [],
    refreshComposioConnectionStatus: vi.fn(),
  },
}));

vi.mock('@/layout/AuthProvider/MarketAuth', () => ({
  useMarketAuth: () => mocks.marketAuth,
}));

vi.mock('@/store/tool', () => ({
  useToolStore: <T>(selector: (state: typeof mocks.toolState) => T): T => selector(mocks.toolState),
}));

vi.mock('@/store/user', () => ({
  useUserStore: {
    getState: () => ({ user: { id: 'user-id' } }),
  },
}));

const azzarSpec: TaskTemplateConnectorReference = { identifier: 'linear', source: 'azzar' };

describe('useConnectorConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.marketAuth.isAuthenticated = false;
    mocks.marketAuth.signIn.mockResolvedValue(null);
    mocks.toolState.composioServers = [];
    mocks.toolState.azzarSkillServers = [];
    mocks.toolState.getAzzarSkillAuthorizeUrl.mockResolvedValue({
      authorizeUrl: 'https://market.example.com/oauth/authorize',
      code: 'code',
      expiresIn: 600,
    });
    vi.spyOn(window, 'open').mockReturnValue({
      close: vi.fn(),
      closed: false,
    } as unknown as Window);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks the user to sign in to Market before requesting AZZAR connector OAuth', async () => {
    const { result } = renderHook(() => useConnectorConnection([azzarSpec]));

    let error: unknown;
    await act(async () => {
      try {
        await result.current.connect();
      } catch (caughtError) {
        error = caughtError;
      }
    });

    expect(error).toBeInstanceOf(ConnectorConnectionMarketAuthRequiredError);
    expect(mocks.marketAuth.signIn).toHaveBeenCalledWith('connector');
    expect(mocks.toolState.getAzzarSkillAuthorizeUrl).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('opens provider OAuth directly when Market is authenticated', async () => {
    mocks.marketAuth.isAuthenticated = true;
    const { result, unmount } = renderHook(() => useConnectorConnection([azzarSpec]));

    await act(async () => {
      await result.current.connect();
    });

    expect(mocks.marketAuth.signIn).not.toHaveBeenCalled();
    expect(mocks.toolState.getAzzarSkillAuthorizeUrl).toHaveBeenCalledWith('linear', {
      redirectUri: expect.stringContaining('/oauth/callback/success?provider=linear'),
    });
    expect(window.open).toHaveBeenCalledWith(
      'https://market.example.com/oauth/authorize',
      '_blank',
      'width=600,height=700',
    );

    unmount();
  });

  it('turns Market 401 from the authorize URL request into a silent auth interruption', async () => {
    mocks.marketAuth.isAuthenticated = true;
    mocks.toolState.getAzzarSkillAuthorizeUrl.mockRejectedValue({
      data: { code: 'UNAUTHORIZED', httpStatus: 401 },
    });
    const { result } = renderHook(() => useConnectorConnection([azzarSpec]));

    let error: unknown;
    await act(async () => {
      try {
        await result.current.connect();
      } catch (caughtError) {
        error = caughtError;
      }
    });

    expect(error).toBeInstanceOf(ConnectorConnectionMarketAuthRequiredError);
    expect(window.open).not.toHaveBeenCalled();
  });
});
