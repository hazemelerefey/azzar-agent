import { describe, expect, it } from 'vitest';

import { agentIdentityPrompt } from './index';

describe('agentIdentityPrompt', () => {
  it('renders name and title with the name as the primary label', () => {
    const result = agentIdentityPrompt({ name: '芙莉莲', title: '魔法使' });

    expect(result).toContain('<name>芙莉莲</name>');
    expect(result).toContain('<title>魔法使</title>');
    expect(result).toContain('The user knows you as "芙莉莲"');
  });

  it('falls back to the title as label when there is no name', () => {
    const result = agentIdentityPrompt({ title: 'Health Assistant' });

    expect(result).not.toContain('<name>');
    expect(result).toContain('<title>Health Assistant</title>');
    expect(result).toContain('The user knows you as "Health Assistant"');
  });

  it('includes full AZZAR identity and origin when name or title is Azzar / Azzar AI', () => {
    const result = agentIdentityPrompt({ name: 'Azzar AI' });

    expect(result).toContain('AZZAR (أذّار)');
    expect(result).toContain('business manager');
    expect(result).toContain('VO for Technology');
    expect(result).toContain('https://www.vo.technology/en');
    expect(result).toContain('Eng. Hazem Elerefy, AI Engineer at VO for Technology');
    expect(result).toContain('github.com/hazemelerefey');
    expect(result).not.toContain('https://hazemelerefy.tech');
    expect(result).not.toContain('led by');
    expect(result).toContain('Never refer to yourself as CAO to the user');
    expect(result).toContain('never spell your Arabic name as عزار');
  });

  it('treats blank values as absent unless defaultToAzzar is enabled', () => {
    expect(agentIdentityPrompt({ name: '  ', title: '' })).toBe('');
    expect(agentIdentityPrompt({})).toBe('');

    const fallback = agentIdentityPrompt({ defaultToAzzar: true, name: '  ', title: '' });
    expect(fallback).toContain('<name>Azzar</name>');
    expect(fallback).toContain('AZZAR (أذّار)');
    expect(fallback).toContain('VO for Technology (https://www.vo.technology/en)');
  });

  it('escapes XML-sensitive characters', () => {
    const result = agentIdentityPrompt({ name: 'A <&> B' });

    expect(result).toContain('<name>A &lt;&amp;&gt; B</name>');
    expect(result).not.toContain('<name>A <&> B</name>');
  });
});
