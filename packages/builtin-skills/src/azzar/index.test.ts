import { describe, expect, it } from 'vitest';

import { AZZARSkill } from './index';
import { AZZARManifest } from './manifest';

const referencedPaths = (text: string) =>
  [...new Set(text.match(/references\/[\w/-]+/g) ?? [])].map((path) => path.replace(/\/$/, ''));

describe('AZZARSkill', () => {
  it('registers every reference the guide points to', () => {
    const resources = Object.keys(AZZARSkill.resources ?? {});
    const contents = [
      AZZARSkill.content,
      ...Object.values(AZZARSkill.resources ?? {}).map((r) => r.content),
    ];

    for (const path of contents.flatMap((text) => referencedPaths(text ?? ''))) {
      expect(resources, `${path} is referenced but not registered`).toContain(path);
    }
  });

  it('documents workspace scope in the guide', () => {
    expect(AZZARSkill.content).toContain('`lh workspace`');
    expect(AZZARSkill.content).toContain('references/workspace');
  });

  it('uses authentic AZZAR circular SVG avatar in manifest', () => {
    expect(AZZARManifest.avatar).toBeDefined();
    expect(AZZARManifest.avatar).toMatch(/^data:image\/svg\+xml;base64,/);
    // Must not contain legacy Lobe ico base64
    expect(AZZARManifest.avatar).not.toContain('AAABAAEAMDA');
    const decoded = Buffer.from(
      AZZARManifest.avatar.replace('data:image/svg+xml;base64,', ''),
      'base64',
    ).toString('utf8');
    expect(decoded).toContain('<svg');
    expect(decoded).toContain('id="azzar-mark"');
    expect(decoded).toContain('fill="#00F0A0"');
  });
});
