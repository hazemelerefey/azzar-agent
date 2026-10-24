import { describe, expect, it } from 'vitest';

import { isGithubRepoUrl } from './githubRepoUrl';

describe('isGithubRepoUrl', () => {
  it('accepts a repo URL padded with whitespace', () => {
    expect(isGithubRepoUrl(' https://github.com/hazemelerefy/azzar\n')).toBe(true);
  });

  it('rejects non-GitHub URLs', () => {
    expect(isGithubRepoUrl('https://gitlab.com/azzar/azzar')).toBe(false);
  });
});
