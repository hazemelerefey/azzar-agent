import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeContext, runCheck } from '../testUtils';
import { endpointChecks } from './endpoints';

const settings = vi.hoisted(() => ({ value: null as any }));

const authKind = vi.hoisted(() => ({ value: 'stored' }));

vi.mock('../../auth/source', () => ({ pickAuthSource: () => ({ kind: authKind.value }) }));

vi.mock('../../settings', () => ({
  // Saved per server; only `settings.deviceGatewayUrls` of the probed server counts.
  loadDeviceGatewayUrl: (serverUrl: string) => settings.value?.deviceGatewayUrls?.[serverUrl],
  loadSettings: () => settings.value,
  normalizeUrl: (url?: string) => (url ? url.replace(/\/$/, '') : undefined),
  resolveAgentGatewayUrl: () => process.env.AGENT_GATEWAY_URL || 'wss://agent-gateway.hazemelerefy.tech',
  resolveServerUrl: () => process.env.AZZAR_SERVER || 'https://app.hazemelerefy.tech',
}));

vi.mock('../../constants/urls', () => ({
  OFFICIAL_AGENT_GATEWAY_URL: 'wss://agent-gateway.hazemelerefy.tech',
  OFFICIAL_GATEWAY_URL: 'wss://gateway.hazemelerefy.tech',
  OFFICIAL_SERVER_URL: 'https://app.hazemelerefy.tech',
}));

describe('endpoints.resolution', () => {
  beforeEach(() => {
    settings.value = null;
    authKind.value = 'stored';
    delete process.env.AZZAR_SERVER;
    delete process.env.AGENT_GATEWAY_URL;
  });

  it('reports each URL with the source it came from', async () => {
    const outcome = await runCheck(endpointChecks, 'endpoints.resolution');

    expect(outcome.status).toBe('ok');
    expect(outcome.evidence).toMatchObject({
      serverSource: 'built-in default',
      serverUrl: 'https://app.hazemelerefy.tech',
    });
    expect(outcome.detail).toContain('device gateway asked of the server');
  });

  it("names the gateway saved for this server, and only this server's", async () => {
    process.env.AZZAR_SERVER = 'https://azzar.internal';
    process.env.AGENT_GATEWAY_URL = 'wss://agents.internal';
    authKind.value = 'env-jwt';
    settings.value = {
      deviceGatewayUrls: {
        'https://azzar.internal': 'https://gw.azzar.internal',
        'https://other.internal': 'https://gw.other.internal',
      },
    };

    const outcome = await runCheck(endpointChecks, 'endpoints.resolution');

    expect(outcome.status).toBe('ok');
    expect(outcome.evidence).toMatchObject({ savedDeviceGatewayUrl: 'https://gw.azzar.internal' });
    expect(outcome.detail).toContain('https://gw.azzar.internal (saved for this server)');
  });

  it('warns when AZZAR_SERVER sends the stored login to another server', async () => {
    process.env.AZZAR_SERVER = 'https://other.internal';
    settings.value = { serverUrl: 'https://azzar.internal' };

    const outcome = await runCheck(endpointChecks, 'endpoints.resolution');

    expect(outcome.status).toBe('warn');
    expect(outcome.detail).toContain('the saved login is for https://azzar.internal');
  });

  it('warns when the saved gateway is on localhost but the server is not', async () => {
    settings.value = { deviceGatewayUrls: { 'https://app.hazemelerefy.tech': 'http://127.0.0.1:8788' } };

    const outcome = await runCheck(endpointChecks, 'endpoints.resolution');

    expect(outcome.status).toBe('warn');
    expect(outcome.detail).toContain('not on the same side of localhost');
  });

  it('warns when a self-hosted server still streams agents from the official gateway', async () => {
    process.env.AZZAR_SERVER = 'https://azzar.internal';
    authKind.value = 'env-jwt';

    const outcome = await runCheck(endpointChecks, 'endpoints.resolution');

    expect(outcome.status).toBe('warn');
    expect(outcome.detail).toContain('agent streaming');
  });
});

describe('endpoints.tls', () => {
  beforeEach(() => {
    delete process.env.NODE_EXTRA_CA_CERTS;
    delete process.env.HTTPS_PROXY;
  });

  it('fails when NODE_EXTRA_CA_CERTS points at a missing file', async () => {
    process.env.NODE_EXTRA_CA_CERTS = '/nope/missing-ca.pem';

    const outcome = await runCheck(endpointChecks, 'endpoints.tls');

    expect(outcome.status).toBe('fail');
    expect(outcome.detail).toContain('does not exist');
  });

  it('reports a proxy without treating it as a problem', async () => {
    process.env.HTTPS_PROXY = 'http://proxy.internal:3128';

    const outcome = await runCheck(endpointChecks, 'endpoints.tls');

    expect(outcome.status).toBe('ok');
    expect(outcome.detail).toContain('proxy via HTTPS_PROXY');
  });

  it('strips the credentials out of an authenticated proxy URL', async () => {
    process.env.HTTPS_PROXY = 'http://alice:hunter2@proxy.internal:3128';

    const outcome = await runCheck(endpointChecks, 'endpoints.tls');
    const serialized = JSON.stringify(outcome.evidence);

    expect(serialized).not.toContain('hunter2');
    expect(serialized).not.toContain('alice');
    expect(serialized).toContain('proxy.internal:3128');
  });
});

describe('endpoints.reachable', () => {
  it('turns a DNS failure into a DNS-specific next step', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('getaddrinfo ENOTFOUND azzar.internal'));

    const outcome = await runCheck(endpointChecks, 'endpoints.reachable', makeContext());

    expect(outcome.status).toBe('fail');
    expect(outcome.fix).toContain('DNS');
    fetchSpy.mockRestore();
  });

  it('flags a 5xx as a server problem rather than a CLI one', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      headers: new Headers(),
      json: async () => ({}),
      status: 503,
    } as unknown as Response);

    const outcome = await runCheck(endpointChecks, 'endpoints.reachable', makeContext());

    expect(outcome.status).toBe('fail');
    expect(outcome.detail).toContain('503');
    fetchSpy.mockRestore();
  });
});
