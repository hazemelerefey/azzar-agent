import { describe, expect, it } from 'vitest';

import { parseAzzarLink } from './parse';

describe('parseAzzarLink', () => {
  it('parses github pull request', () => {
    expect(parseAzzarLink('')).toEqual({
      canonicalLabel: 'azzar/azzar#15557',
      kind: 'github',
    });
  });

  it('parses github issue', () => {
    expect(parseAzzarLink('')).toEqual({
      canonicalLabel: 'azzar/azzar#15554',
      kind: 'github',
    });
  });

  it('parses github commit (short sha)', () => {
    expect(parseAzzarLink('https://github.com/hazemelerefy/azzar/commit/d36aa75701abc')).toEqual({
      canonicalLabel: 'azzar/azzar@d36aa75',
      kind: 'github',
    });
  });

  it('parses github repo root', () => {
    expect(parseAzzarLink('https://github.com/hazemelerefy/azzar')).toEqual({
      canonicalLabel: 'azzar/azzar',
      kind: 'github',
    });
  });

  it('parses linear issue', () => {
    expect(parseAzzarLink('')).toEqual({
      canonicalLabel: 'TST-10001',
      kind: 'linear',
    });
  });

  it('parses github user / org pages with the github icon', () => {
    expect(parseAzzarLink('https://github.com/azzar')).toEqual({
      canonicalLabel: 'azzar',
      kind: 'github',
    });
  });

  it('uses the full URL as label for generic http links', () => {
    expect(parseAzzarLink('https://example.com/foo')).toEqual({
      canonicalLabel: 'https://example.com/foo',
      domain: 'example.com',
      kind: 'generic',
    });
    // bare github.com (no owner) → generic
    expect(parseAzzarLink('https://github.com')?.kind).toBe('generic');
  });

  it('labels npm packages by package name', () => {
    expect(parseAzzarLink('https://www.npmjs.com/package/@azzar/ui')).toEqual({
      canonicalLabel: '@azzar/ui',
      domain: 'npmjs.com',
      kind: 'generic',
    });
    expect(parseAzzarLink('https://www.npmjs.com/package/react/v/18.0.0')?.canonicalLabel).toBe(
      'react',
    );
  });

  it('labels figma links by file name', () => {
    expect(parseAzzarLink('https://www.figma.com/file/abc123/Design-File')?.canonicalLabel).toBe(
      'Design File',
    );
    expect(parseAzzarLink('https://www.figma.com/design/abc123/My-Board')?.canonicalLabel).toBe(
      'My Board',
    );
  });

  it('parses mailto links as email', () => {
    expect(parseAzzarLink('mailto:hi@example.com')).toEqual({
      canonicalLabel: 'hi@example.com',
      kind: 'email',
    });
    expect(parseAzzarLink('mailto:hi@example.com?subject=Hello')?.canonicalLabel).toBe(
      'hi@example.com',
    );
  });

  it('keeps root-relative links for the internal-link renderer', () => {
    expect(parseAzzarLink('/foo/bar')).toEqual({
      canonicalLabel: '/foo/bar',
      kind: 'generic',
    });
  });

  it('ignores citation, footnote and non-http hrefs', () => {
    expect(parseAzzarLink('citation-1')).toBeNull();
    expect(parseAzzarLink('#user-content-fn-1')).toBeNull();
    expect(parseAzzarLink(undefined)).toBeNull();
  });
});
