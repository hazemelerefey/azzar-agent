import { afterEach, describe, expect, it, vi } from 'vitest';

import { MissionDAG } from '../dag';
import { callLocalOllama, MARKETING_MISSION_DAG } from '../marketingMission';
import { MissionReceiptManager } from '../receipt';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Ollama fetch timeout', () => {
  const hangUntilAborted = vi.fn(
    (_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(init.signal!.reason));
      }),
  );

  it('passes an AbortSignal to the Ollama fetch', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(init.signal).toBeInstanceOf(AbortSignal);
      return new Response(
        JSON.stringify({ eval_count: 1, message: { content: 'ok' }, model: 'gemma4:e4b', prompt_eval_count: 1 }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = await callLocalOllama({ userPrompt: 'hi' });
    expect(res.content).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('aborts a hung Ollama call with a clear timeout error', async () => {
    vi.stubGlobal('fetch', hangUntilAborted);
    const started = Date.now();
    await expect(callLocalOllama({ timeoutMs: 60, userPrompt: 'hi' })).rejects.toThrow(
      /Ollama call timed out after 60ms \(model gemma4:e4b\)/,
    );
    expect(Date.now() - started).toBeLessThan(5000);
  });

  it('honours AZZAR_OLLAMA_TIMEOUT_MS', async () => {
    vi.stubEnv('AZZAR_OLLAMA_TIMEOUT_MS', '40');
    vi.stubGlobal('fetch', hangUntilAborted);
    await expect(callLocalOllama({ userPrompt: 'hi' })).rejects.toThrow(/timed out after 40ms/);
  });
});

describe('receipt secret redaction', () => {
  it('redacts secret keys at any depth in tool inputs and outputs', () => {
    const redacted = MissionReceiptManager.redactSecrets({
      headers: { Authorization: 'Bearer abcdef1234567890', Cookie: 'sid=1' },
      nested: [{ api_key: 'k', password: 'p', safe: 'visible' }],
      refreshToken: 'r',
      totalTokens: 9050,
    });
    expect(redacted.headers.Authorization).toBe('[REDACTED]');
    expect(redacted.headers.Cookie).toBe('[REDACTED]');
    expect(redacted.nested[0]).toEqual({ api_key: '[REDACTED]', password: '[REDACTED]', safe: 'visible' });
    expect(redacted.refreshToken).toBe('[REDACTED]');
    // LLM usage counters are not secrets.
    expect(redacted.totalTokens).toBe(9050);
  });

  it('redacts secret-shaped values even under innocent keys', () => {
    const redacted = MissionReceiptManager.redactSecrets({
      log: 'called with Bearer eyJhbGciOi.abcdefgh.ijklmnop and sk-abcdefghijklmnopqrstuvwx',
      url: 'https://api.example.com/v1?api_key=SECRET123&q=ok',
      gh: 'ghp_abcdefghijklmnopqrstuvwxyz0123',
    });
    expect(JSON.stringify(redacted)).not.toMatch(/eyJhbGciOi|sk-abcdef|SECRET123|ghp_abcdef/);
    expect(redacted.url).toContain('q=ok');
    expect(redacted.url).toContain('api_key=[REDACTED]');
  });

  it('buildReceipt redacts tool inputs, outputs and sources', () => {
    const receipt = new MissionReceiptManager({} as any).buildReceipt({
      dag: new MissionDAG(MARKETING_MISSION_DAG),
      missionId: 'm1',
      modelDisclosure: { model: 'gemma4:e4b', provider: 'ollama' },
      nodeStatuses: {},
      toolCalls: [
        {
          input: { apiKey: 'secret_123', note: 'Bearer abcdefghijklmnop' },
          output: { authToken: 'bearer_xyz', body: 'ok' },
          sources: ['https://x.example/?token=TOPSECRET&a=1'],
          toolCallId: 't1',
          toolId: 'web-browsing____search',
        },
      ],
    });
    const serialized = JSON.stringify(receipt);
    expect(serialized).not.toMatch(/secret_123|bearer_xyz|abcdefghijklmnop|TOPSECRET/);
    expect(receipt.toolCalls[0].input.apiKey).toBe('[REDACTED]');
    expect(receipt.toolCalls[0].output.body).toBe('ok');
    expect(receipt.toolCalls[0].sources?.[0]).toContain('a=1');
  });
});
