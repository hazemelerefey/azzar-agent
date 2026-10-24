import { describe, expect, it } from 'vitest';

import { AZZARSkill } from './index';

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
});
