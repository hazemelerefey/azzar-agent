import { describe, expect, it } from 'vitest';

import { DEFAULT_MISSION_LANGUAGE, MissionLanguageManager } from '../language';

describe('MissionLanguageManager & v2.9 Identity/Language Contracts', () => {
  it('defaults to Egyptian Arabic (ar-EG)', () => {
    expect(MissionLanguageManager.resolveLocale()).toBe(DEFAULT_MISSION_LANGUAGE);
    expect(MissionLanguageManager.resolveLocale('')).toBe('ar-EG');
    expect(MissionLanguageManager.resolveLocale('ar')).toBe('ar-EG');
    expect(MissionLanguageManager.resolveLocale('مصري')).toBe('ar-EG');
  });

  it('splits US and UK English and throws on bare English', () => {
    expect(MissionLanguageManager.resolveLocale('en-US')).toBe('en-US');
    expect(MissionLanguageManager.resolveLocale('en-GB')).toBe('en-GB');

    expect(() => MissionLanguageManager.resolveLocale('en')).toThrow(
      /Bare English "en" is ambiguous/,
    );
    expect(() => MissionLanguageManager.resolveLocale('english')).toThrow(
      /Bare English "en" is ambiguous/,
    );
  });

  it('resolves Arabic US/GB names', () => {
    expect(MissionLanguageManager.resolveLocale('إنجليزي أمريكي')).toBe('en-US');
    expect(MissionLanguageManager.resolveLocale('إنجليزي بريطاني')).toBe('en-GB');
    expect(MissionLanguageManager.resolveLocale('ar-US')).toBe('en-US');
    expect(MissionLanguageManager.resolveLocale('ar-GB')).toBe('en-GB');
  });

  it('throws on shared dialect names while naming members', () => {
    expect(() => MissionLanguageManager.resolveLocale('arabic-dialects')).toThrow(
      /must specify member from \[ar-EG, ar-SA, ar-AE, ar-MA, ar-DZ\]/,
    );
  });

  it('builds AZZAR system prompt with identity, links, model disclosure, and rules', () => {
    const prompt = MissionLanguageManager.buildAzzarSystemPrompt({
      model: 'gemma4:e4b',
      provider: 'ollama',
    });

    expect(prompt).toContain('AZZAR (أذّار)');
    expect(prompt).toContain('business manager');
    expect(prompt).toContain('VO for Technology');
    expect(prompt).toContain('Eng. Hazem Elerefy');
    expect(prompt).toContain('https://hazemelerefy.tech');
    expect(prompt).toContain('https://app.hazemelerefy.tech');
    expect(prompt).toContain('gemma4:e4b');
    expect(prompt).toContain('ollama');
    expect(prompt).toContain('Egyptian Arabic');
    expect(prompt).toContain('Never spell your name as "عزار"');
    expect(prompt).toContain('Never refer to yourself as "CAO" directly to the user');
  });

  it('strips comments before extracting manifest id', () => {
    const manifestSource = `
      // id: 'commented-out-id'
      /*
       * id: 'block-comment-id'
       */
      export const manifest = {
        id: 'real-marketing-tool',
        name: 'Marketing Tool'
      };
    `;
    expect(MissionLanguageManager.extractManifestId(manifestSource)).toBe('real-marketing-tool');
  });

  it('enforces full chip markup over bare dot span (anti-slop)', () => {
    const bareDot = '<span class="dot"></span> Active';
    const fullChip = '<span class="azzar-chip"><span class="dot"></span> Active</span>';

    expect(MissionLanguageManager.validateChipMarkup(bareDot).valid).toBe(false);
    expect(MissionLanguageManager.validateChipMarkup(fullChip).valid).toBe(true);
  });
});
