/**
 * AZZAR language registry: 20 nationalities, content vs explanation language.
 *
 * Spec 2.7: Default Egyptian Arabic (ar-EG). GB is the United Kingdom (en-GB,
 * Arabic المملكة المتحدة); England is not a country entry. US is the United
 * States (en-US). Bare English as conversation/content throws naming both
 * variants; bare English as explanation gives English. Shared dialect names and
 * bare Gulf or Levantine throw naming their member countries.
 */

export type DialectGroup = 'gulf' | 'levantine';
export type NationalityReviewStatus = 'language-choice' | 'pending-native-review' | 'primary';

export interface NationalityEntry {
  /** Arabic adjectives, masculine and feminine, plus short forms. */
  aliasesAr: string[];
  aliasesEn: string[];
  code: string;
  dialectGroup?: DialectGroup;
  /** Lowercase ISO code used to pick the country flag asset (flag-icons style). */
  flagCode: string;
  flagEmoji: string;
  kind: 'arabic' | 'english';
  locale: string;
  nameAr: string;
  nameEn: string;
  reviewStatus: NationalityReviewStatus;
}

const flagEmoji = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const arabic = (
  code: string,
  nameEn: string,
  nameAr: string,
  aliasesAr: string[],
  aliasesEn: string[],
  dialectGroup?: DialectGroup,
): NationalityEntry => ({
  aliasesAr: [nameAr, ...aliasesAr],
  aliasesEn: [nameEn, ...aliasesEn],
  code,
  dialectGroup,
  flagCode: code.toLowerCase(),
  flagEmoji: flagEmoji(code),
  kind: 'arabic',
  locale: `ar-${code}`,
  nameAr,
  nameEn,
  reviewStatus: code === 'EG' ? 'primary' : 'pending-native-review',
});

export const NATIONALITIES: readonly NationalityEntry[] = [
  arabic('EG', 'Egypt', 'مصر', ['مصري', 'مصرية'], ['egyptian']),
  arabic('SA', 'Saudi Arabia', 'السعودية', ['سعودي', 'سعودية'], ['saudi'], 'gulf'),
  arabic(
    'AE',
    'United Arab Emirates',
    'الإمارات',
    ['إماراتي', 'إماراتية'],
    ['emirati', 'uae'],
    'gulf',
  ),
  arabic('QA', 'Qatar', 'قطر', ['قطري', 'قطرية'], ['qatari'], 'gulf'),
  arabic('KW', 'Kuwait', 'الكويت', ['كويتي', 'كويتية'], ['kuwaiti'], 'gulf'),
  arabic('BH', 'Bahrain', 'البحرين', ['بحريني', 'بحرينية'], ['bahraini'], 'gulf'),
  arabic('OM', 'Oman', 'عُمان', ['عماني', 'عمانية'], ['omani'], 'gulf'),
  arabic('JO', 'Jordan', 'الأردن', ['أردني', 'أردنية'], ['jordanian'], 'levantine'),
  arabic('LB', 'Lebanon', 'لبنان', ['لبناني', 'لبنانية'], ['lebanese'], 'levantine'),
  arabic('SY', 'Syria', 'سوريا', ['سوري', 'سورية'], ['syrian'], 'levantine'),
  arabic('PS', 'Palestine', 'فلسطين', ['فلسطيني', 'فلسطينية'], ['palestinian'], 'levantine'),
  arabic('IQ', 'Iraq', 'العراق', ['عراقي', 'عراقية'], ['iraqi']),
  arabic('MA', 'Morocco', 'المغرب', ['مغربي', 'مغربية'], ['moroccan']),
  arabic('DZ', 'Algeria', 'الجزائر', ['جزائري', 'جزائرية'], ['algerian']),
  arabic('TN', 'Tunisia', 'تونس', ['تونسي', 'تونسية'], ['tunisian']),
  arabic('LY', 'Libya', 'ليبيا', ['ليبي', 'ليبية'], ['libyan']),
  arabic('SD', 'Sudan', 'السودان', ['سوداني', 'سودانية'], ['sudanese']),
  arabic('YE', 'Yemen', 'اليمن', ['يمني', 'يمنية'], ['yemeni']),
  {
    aliasesAr: [
      'الولايات المتحدة',
      'الولايات المتحدة الأمريكية',
      'أمريكا',
      'أميركا',
      'أمريكي',
      'أمريكية',
      'أميركي',
      'أميركية',
    ],
    aliasesEn: ['united states', 'united states of america', 'american', 'america', 'usa', 'us'],
    code: 'US',
    flagCode: 'us',
    flagEmoji: flagEmoji('US'),
    kind: 'english',
    locale: 'en-US',
    nameAr: 'الولايات المتحدة',
    nameEn: 'United States',
    reviewStatus: 'language-choice',
  },
  {
    aliasesAr: ['المملكة المتحدة', 'بريطانيا', 'بريطاني', 'بريطانية'],
    aliasesEn: ['united kingdom', 'british', 'britain', 'great britain', 'uk', 'gb'],
    code: 'GB',
    flagCode: 'gb',
    flagEmoji: flagEmoji('GB'),
    kind: 'english',
    locale: 'en-GB',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    reviewStatus: 'language-choice',
  },
];

/** Constituent countries are not country entries: use United Kingdom (GB). */
const REJECTED_COUNTRY_ENTRIES = [
  'england',
  'scotland',
  'wales',
  'northern ireland',
  'انجلترا',
  'اسكتلندا',
  'ويلز',
  'ايرلندا الشماليه',
];

export const DIALECT_GROUP_MEMBERS: Record<DialectGroup, string[]> = {
  gulf: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
  levantine: ['JO', 'LB', 'SY', 'PS'],
};

export const DIALECT_REVIEW_NOTICE =
  'Non-Egyptian dialect greetings are starting points pending native-speaker review. ' +
  'Egyptian Arabic is primary; American English (en-US) and British English (en-GB) are ' +
  'language choices, not dialects pending review.';

export const DEFAULT_CONTENT_LOCALE = 'ar-EG';

const BARE_ENGLISH_MESSAGE =
  'Bare English "en" is ambiguous for conversation and content: must specify American English ' +
  '(en-US, United States) or British English (en-GB, United Kingdom)';

/**
 * Canonical matching form: strip diacritics/tatweel, fold alef variants,
 * ى→ي and ة→ه (so feminine and masculine adjectives are comparable), drop the
 * Arabic definite article per word, lowercase and collapse whitespace.
 */
export const normalizeLanguageToken = (input: string): string =>
  input
    .normalize('NFKC')
    .toLowerCase()
    .replaceAll(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replaceAll(/[أإآٱ]/g, 'ا')
    .replaceAll('ى', 'ي')
    .replaceAll('ة', 'ه')
    .replaceAll(/[_()[\],.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (word.startsWith('ال') && word.length > 4 ? word.slice(2) : word))
    .join(' ');

const containsPhrase = (haystack: string, phrase: string) =>
  ` ${haystack} `.includes(` ${phrase} `);

const matchesAlias = (normalized: string, aliases: string[]) =>
  aliases.some((alias) => containsPhrase(normalized, normalizeLanguageToken(alias)));

export const getNationality = (code: string): NationalityEntry => {
  const entry = NATIONALITIES.find((n) => n.code === code.toUpperCase());
  if (!entry) throw new Error(`Unknown nationality code "${code}"`);
  return entry;
};

const memberList = (group: DialectGroup) =>
  DIALECT_GROUP_MEMBERS[group].map((c) => `${c} (ar-${c})`).join(', ');

const GROUP_ALIASES: Array<{ aliases: string[]; group: DialectGroup }> = [
  { aliases: ['gulf', 'gulf arabic', 'khaleeji', 'خليجي', 'خليجيه', 'الخليج'], group: 'gulf' },
  {
    aliases: ['levantine', 'levantine arabic', 'levant', 'شامي', 'شاميه', 'الشام'],
    group: 'levantine',
  },
];

const SHARED_DIALECT_NAMES = new Set(['arabic dialects', 'arabic-dialects', 'shared dialects']);

/** Resolve a nationality from code, English/Arabic name or adjective (masculine, feminine, short). */
export function resolveNationality(input: string): NationalityEntry {
  const normalized = normalizeLanguageToken(input);
  if (!normalized) throw new Error('Nationality is empty');

  if (REJECTED_COUNTRY_ENTRIES.some((r) => containsPhrase(normalized, normalizeLanguageToken(r)))) {
    throw new Error(
      `"${input.trim()}" is not a country entry: use United Kingdom (GB, المملكة المتحدة, en-GB)`,
    );
  }

  for (const { aliases, group } of GROUP_ALIASES) {
    if (matchesAlias(normalized, aliases)) {
      throw new Error(
        `Bare ${group === 'gulf' ? 'Gulf' : 'Levantine'} is ambiguous: must specify member country from [${memberList(group)}]`,
      );
    }
  }

  const byCode = NATIONALITIES.find((n) => normalized === n.code.toLowerCase());
  if (byCode) return byCode;

  const match = NATIONALITIES.find(
    (n) => matchesAlias(normalized, n.aliasesEn) || matchesAlias(normalized, n.aliasesAr),
  );
  if (!match) throw new Error(`Unknown nationality "${input.trim()}"`);
  return match;
}

const isBareEnglish = (normalized: string) =>
  ['en', 'english', 'انجليزي', 'انجليزيه'].includes(normalized);

/**
 * Content (conversation) locale. Bare English throws, naming American and British
 * English. Bare Arabic is Egyptian. Unrecognised values pass through unchanged so
 * UI locales such as zh-CN keep working.
 */
export function resolveContentLocale(input?: string): string {
  if (!input || input.trim() === '') return DEFAULT_CONTENT_LOCALE;
  const raw = input.trim();
  const normalized = normalizeLanguageToken(raw);

  if (isBareEnglish(normalized)) throw new Error(BARE_ENGLISH_MESSAGE);

  if (SHARED_DIALECT_NAMES.has(normalized) || normalized === 'shared dialects') {
    throw new Error(
      'Shared dialect name is ambiguous: must specify member from [ar-EG, ar-SA, ar-AE, ar-MA, ar-DZ]',
    );
  }

  if (['ar', 'arabic', 'egyptian', 'عربي', 'عربيه', 'مصري', 'مصريه'].includes(normalized)) {
    return DEFAULT_CONTENT_LOCALE;
  }

  // ar-US / ar-GB historically mean the Arabic-UI name for the English variants.
  const tag = /^(ar|en)-([a-z]{2})$/.exec(normalized);
  if (tag) {
    const code = tag[2].toUpperCase();
    const entry = NATIONALITIES.find((n) => n.code === code);
    if (entry && (tag[1] === 'ar' || entry.kind === 'english')) return entry.locale;
  }

  try {
    return resolveNationality(raw).locale;
  } catch (error) {
    if (error instanceof Error && /ambiguous|not a country entry/.test(error.message)) throw error;
    return raw;
  }
}

/** Explanation locale: bare English gives English (no dialect); everything else resolves like content. */
export function resolveExplanationLocale(input?: string): string {
  if (!input || input.trim() === '') return DEFAULT_CONTENT_LOCALE;
  if (isBareEnglish(normalizeLanguageToken(input))) return 'en';
  return resolveContentLocale(input);
}

export interface LanguageTurnInput {
  /** Content language override; defaults to the agent nationality's locale. */
  contentLanguage?: string;
  /** Stored explanation language for the agent/user. */
  explanationLanguage?: string;
  /** Agent profile nationality (code, name or adjective). Defaults to EG. */
  nationality?: string;
  /** Per-turn explanation override. Affects only this turn's explanation. */
  turnExplanationOverride?: string;
}

export interface ResolvedLanguageTurn {
  contentLocale: string;
  explanationLocale: string;
  explanationSource: 'default' | 'explanation-setting' | 'turn-override';
  nationality: NationalityEntry;
}

export function resolveLanguageTurn(input: LanguageTurnInput = {}): ResolvedLanguageTurn {
  const nationality = input.nationality ? resolveNationality(input.nationality) : getNationality('EG');
  const contentLocale = input.contentLanguage
    ? resolveContentLocale(input.contentLanguage)
    : nationality.locale;

  if (input.turnExplanationOverride) {
    return {
      contentLocale,
      explanationLocale: resolveExplanationLocale(input.turnExplanationOverride),
      explanationSource: 'turn-override',
      nationality,
    };
  }
  if (input.explanationLanguage) {
    return {
      contentLocale,
      explanationLocale: resolveExplanationLocale(input.explanationLanguage),
      explanationSource: 'explanation-setting',
      nationality,
    };
  }
  return {
    contentLocale,
    explanationLocale: DEFAULT_CONTENT_LOCALE,
    explanationSource: 'default',
    nationality,
  };
}
