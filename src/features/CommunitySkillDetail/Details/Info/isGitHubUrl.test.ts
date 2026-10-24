import { describe, expect, it } from 'vitest';

import { isGitHubUrl } from './isGitHubUrl';

describe('isGitHubUrl', () => {
  it.each([
    'https://github.com/hazemelerefy/azzar',
    'https://www.github.com/hazemelerefy/azzar',
    'https://gist.github.com/example',
  ])('accepts GitHub hosts: %s', (url) => {
    expect(isGitHubUrl(url)).toBe(true);
  });

  it.each([
    'https://evilgithub.com/hazemelerefy/azzar',
    'https://github.com.evil.example/azzar/azzar',
    'https://github.com@evil.example/azzar/azzar',
  ])('rejects hosts that only contain github.com: %s', (url) => {
    expect(isGitHubUrl(url)).toBe(false);
  });

  it.each([undefined, '', 'not-a-url'])('rejects invalid URLs: %s', (url) => {
    expect(isGitHubUrl(url)).toBe(false);
  });
});
