import { describe, expect, it } from 'vitest';

import { isOfficialCloudServer } from './url';

describe('isOfficialCloudServer', () => {
  it.each([
    'https://app.hazemelerefy.tech',
    'https://hazemelerefy.tech',
    'https://hazemelerefy.tech/workspace',
    'https://staging.app.hazemelerefy.tech/',
  ])('treats %s as official', (url) => {
    expect(isOfficialCloudServer(url)).toBe(true);
  });

  it.each([
    'https://hazemelerefy.tech.evil.example',
    'https://nothazemelerefy.tech',
    'https://my-azzar.internal',
    'http://localhost:3210',
    'not a url',
    '',
    undefined,
  ])('treats %s as self-hosted', (url) => {
    expect(isOfficialCloudServer(url)).toBe(false);
  });
});
