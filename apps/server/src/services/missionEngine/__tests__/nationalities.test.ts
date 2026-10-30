import { describe, expect, it } from 'vitest';

import { MissionLanguageManager } from '../language';
import {
  DIALECT_REVIEW_NOTICE,
  getNationality,
  NATIONALITIES,
  resolveContentLocale,
  resolveExplanationLocale,
  resolveLanguageTurn,
  resolveNationality,
} from '../nationalities';

describe('20-nationality registry', () => {
  it('contains exactly the 20 specified nationalities in order', () => {
    expect(NATIONALITIES.map((n) => n.code)).toEqual([
      'EG', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'SY',
      'PS', 'IQ', 'MA', 'DZ', 'TN', 'LY', 'SD', 'YE', 'US', 'GB',
    ]);
    expect(new Set(NATIONALITIES.map((n) => n.flagCode)).size).toBe(20);
  });

  it('GB is United Kingdom with Union Jack flag, en-GB and Arabic المملكة المتحدة', () => {
    const gb = getNationality('GB');
    expect(gb.nameEn).toBe('United Kingdom');
    expect(gb.nameAr).toBe('المملكة المتحدة');
    expect(gb.flagCode).toBe('gb');
    expect(gb.flagEmoji).toBe('🇬🇧');
    expect(gb.locale).toBe('en-GB');
  });

  it('US is United States with American English en-US', () => {
    const us = getNationality('US');
    expect(us.nameEn).toBe('United States');
    expect(us.locale).toBe('en-US');
    expect(us.flagEmoji).toBe('🇺🇸');
  });

  it('England is not a country entry (and neither are Scotland, Wales, Northern Ireland)', () => {
    for (const name of ['England', 'england', 'Scotland', 'Wales', 'Northern Ireland', 'إنجلترا']) {
      expect(() => resolveNationality(name)).toThrow(/not a country entry.*United Kingdom \(GB/);
    }
    expect(NATIONALITIES.some((n) => /england/i.test(n.nameEn))).toBe(false);
  });

  it('Egyptian is primary; US and GB are language choices; the rest are pending native review', () => {
    expect(getNationality('EG').reviewStatus).toBe('primary');
    expect(getNationality('US').reviewStatus).toBe('language-choice');
    expect(getNationality('GB').reviewStatus).toBe('language-choice');
    for (const code of ['SA', 'AE', 'JO', 'LB', 'MA', 'YE']) {
      expect(getNationality(code).reviewStatus).toBe('pending-native-review');
    }
    expect(DIALECT_REVIEW_NOTICE).toMatch(/pending native-speaker review/);
  });

  it('Arabic US and GB names and adjectives resolve, including feminine and short forms', () => {
    const us = ['أمريكي', 'أمريكية', 'أميركي', 'أميركية', 'أمريكا', 'الأمريكية', 'الولايات المتحدة', 'US', 'USA', 'American'];
    const gb = ['بريطاني', 'بريطانية', 'البريطانية', 'بريطانيا', 'المملكة المتحدة', 'GB', 'UK', 'British'];
    for (const name of us) expect(resolveNationality(name).code, name).toBe('US');
    for (const name of gb) expect(resolveNationality(name).code, name).toBe('GB');
    expect(resolveContentLocale('إنجليزية أمريكية')).toBe('en-US');
    expect(resolveContentLocale('الإنجليزية البريطانية')).toBe('en-GB');
    expect(resolveContentLocale('إنجليزي بريطاني')).toBe('en-GB');
    expect(resolveContentLocale('British English')).toBe('en-GB');
  });

  it('Arabic nationality adjectives resolve masculine and feminine for non-English members', () => {
    expect(resolveNationality('سعودية').code).toBe('SA');
    expect(resolveNationality('سعودي').code).toBe('SA');
    expect(resolveNationality('الإماراتية').code).toBe('AE');
    expect(resolveNationality('عُمان').code).toBe('OM');
    expect(resolveNationality('Moroccan').code).toBe('MA');
    expect(resolveContentLocale('ar-SA')).toBe('ar-SA');
  });

  it('bare Gulf throws naming its member countries', () => {
    for (const name of ['gulf', 'Gulf Arabic', 'خليجي', 'خليجية']) {
      expect(() => resolveContentLocale(name), name).toThrow(
        /Bare Gulf is ambiguous.*SA \(ar-SA\), AE \(ar-AE\), QA \(ar-QA\), KW \(ar-KW\), BH \(ar-BH\), OM \(ar-OM\)/,
      );
    }
  });

  it('bare Levantine throws naming its member countries', () => {
    for (const name of ['levantine', 'Levantine Arabic', 'شامي', 'شامية']) {
      expect(() => resolveContentLocale(name), name).toThrow(
        /Bare Levantine is ambiguous.*JO \(ar-JO\), LB \(ar-LB\), SY \(ar-SY\), PS \(ar-PS\)/,
      );
    }
  });

  it('shared dialect names throw naming members', () => {
    expect(() => resolveContentLocale('arabic-dialects')).toThrow(
      /must specify member from \[ar-EG, ar-SA, ar-AE, ar-MA, ar-DZ\]/,
    );
  });

  it('bare English as content throws naming American English and British English', () => {
    for (const name of ['en', 'English', 'english', 'إنجليزي']) {
      expect(() => resolveContentLocale(name), name).toThrow(
        /American English \(en-US, United States\).*British English \(en-GB, United Kingdom\)/,
      );
    }
    expect(() => MissionLanguageManager.resolveLocale('en')).toThrow(/Bare English "en" is ambiguous/);
  });

  it('bare English as explanation gives English', () => {
    expect(resolveExplanationLocale('en')).toBe('en');
    expect(resolveExplanationLocale('English')).toBe('en');
    expect(resolveExplanationLocale('en-GB')).toBe('en-GB');
    expect(resolveExplanationLocale()).toBe('ar-EG');
  });

  it('defaults to Egyptian Arabic', () => {
    expect(resolveContentLocale()).toBe('ar-EG');
    expect(resolveContentLocale('ar')).toBe('ar-EG');
    expect(resolveLanguageTurn().contentLocale).toBe('ar-EG');
  });
});

describe('content language vs explanation language', () => {
  it('uses the agent nationality for content and keeps explanation separate', () => {
    const turn = resolveLanguageTurn({ explanationLanguage: 'en-GB', nationality: 'SA' });
    expect(turn.nationality.code).toBe('SA');
    expect(turn.contentLocale).toBe('ar-SA');
    expect(turn.explanationLocale).toBe('en-GB');
    expect(turn.explanationSource).toBe('explanation-setting');
  });

  it('a per-turn explanation override changes only that turn explanation, never the nationality', () => {
    const base = resolveLanguageTurn({ explanationLanguage: 'ar-EG', nationality: 'GB' });
    const overridden = resolveLanguageTurn({
      explanationLanguage: 'ar-EG',
      nationality: 'GB',
      turnExplanationOverride: 'en',
    });
    expect(overridden.explanationLocale).toBe('en');
    expect(overridden.explanationSource).toBe('turn-override');
    expect(overridden.nationality.code).toBe('GB');
    expect(overridden.contentLocale).toBe(base.contentLocale);
    expect(base.explanationLocale).toBe('ar-EG');
  });

  it('bare English content language throws even when explanation is English', () => {
    expect(() => resolveLanguageTurn({ contentLanguage: 'en', explanationLanguage: 'en' })).toThrow(
      /American English/,
    );
  });
});
