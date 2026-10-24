import { describe, expect, it } from 'vitest';

import { normalizeRedirectUris, validateRedirectUri } from './oauthApp';

describe('validateRedirectUri', () => {
  it('accepts https urls', () => {
    expect(validateRedirectUri('https://dc.azzar.com/api/auth/callback/azzar')).toBeUndefined();
  });

  it('accepts http on loopback hosts', () => {
    expect(validateRedirectUri('http://localhost:3022/api/auth/callback')).toBeUndefined();
    expect(validateRedirectUri('http://127.0.0.1:3022/api/auth/callback')).toBeUndefined();
  });

  it('rejects plain http on a public host', () => {
    expect(validateRedirectUri('http://dc.azzar.com/callback')).toBe('insecure');
  });

  it('rejects non-http schemes', () => {
    expect(validateRedirectUri('javascript:alert(1)')).toBe('insecure');
    expect(validateRedirectUri('com.azzar.app://auth/callback')).toBe('insecure');
  });

  it('rejects wildcards so matching stays exact', () => {
    expect(validateRedirectUri('https://*.azzar.com/callback')).toBe('wildcard');
  });

  it('rejects fragments and embedded credentials', () => {
    expect(validateRedirectUri('https://dc.azzar.com/cb#token')).toBe('fragment');
    expect(validateRedirectUri('https://user:pw@dc.azzar.com/cb')).toBe('credentials');
  });

  it('rejects relative or garbage values', () => {
    expect(validateRedirectUri('/callback')).toBe('malformed');
    expect(validateRedirectUri('not a url')).toBe('malformed');
  });
});

describe('normalizeRedirectUris', () => {
  it('trims, drops blanks and de-duplicates while keeping order', () => {
    expect(
      normalizeRedirectUris([
        ' https://a.com/cb ',
        '',
        'https://b.com/cb',
        'https://a.com/cb',
        '   ',
      ]),
    ).toEqual(['https://a.com/cb', 'https://b.com/cb']);
  });
});
