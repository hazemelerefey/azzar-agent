import { describe, expect, it } from 'vitest';

import { validateE2EEnvironment } from './e2eEnvironment';

const selectedEnvironment = {
  AZZAR_CLI_HOME: '.azzar-e2e',
  AZZAR_E2E_ALLOW_WRITES: '1',
  AZZAR_SERVER: 'http://localhost:3010',
};

describe('live E2E environment', () => {
  it('requires explicit write authorization', () => {
    expect(() =>
      validateE2EEnvironment({ ...selectedEnvironment, AZZAR_E2E_ALLOW_WRITES: undefined }),
    ).toThrow('ALLOW_WRITES');
  });

  it.each([undefined, '', '.azzar', '/tmp/../home/.azzar/'])(
    'rejects an absent or default home: %s',
    (home) => {
      expect(() =>
        validateE2EEnvironment({ ...selectedEnvironment, AZZAR_CLI_HOME: home }),
      ).toThrow('dedicated');
    },
  );

  it.each([undefined, 'file:///tmp/server', 'https://user:secret@example.test'])(
    'rejects a missing or unsafe server: %s',
    (server) => {
      expect(() =>
        validateE2EEnvironment({ ...selectedEnvironment, AZZAR_SERVER: server }),
      ).toThrow();
    },
  );

  it('preserves the selected home and environment', () => {
    const env = Object.freeze({ ...selectedEnvironment });
    expect(() => validateE2EEnvironment(env)).not.toThrow();
    expect(env).toEqual(selectedEnvironment);
  });
});
