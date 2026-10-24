import { describe, expect, it } from 'vitest';

import { parseChangeRequestUrl } from '../changeRequestUrl';

describe('parseChangeRequestUrl', () => {
  it('reads a GitHub pull request URL, including a tab under it', () => {
    const expected = {
      number: 20171,
      provider: 'github',
      repoFullName: 'azzar/azzar',
      url: '',
    };
    expect(parseChangeRequestUrl('')).toEqual(
      expected,
    );
    expect(
      parseChangeRequestUrl('  '),
    ).toEqual(expected);
  });

  it('rejects anything that does not name a pull request', () => {
    for (const value of [
      'not a url',
      '',
      'https://gitlab.com/azzar/azzar/pull/1',
      'https://github.com.evil.dev/azzar/azzar/pull/1',
      '',
      '',
      '',
    ])
      expect(parseChangeRequestUrl(value)).toBeNull();
  });
});
