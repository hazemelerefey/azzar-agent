/**
 * AZZAR Language and Identity Module (v2.9 Must-Fixes)
 */

export const SUPPORTED_ENGLISH_LOCALES = ['en-US', 'en-GB'] as const;
export type SupportedEnglishLocale = (typeof SUPPORTED_ENGLISH_LOCALES)[number];

export const DEFAULT_MISSION_LANGUAGE = 'ar-EG';

export interface PromptIdentityOptions {
  customName?: string;
  customTitle?: string;
  locale?: string;
  model: string;
  provider: string;
}

export class MissionLanguageManager {
  /**
   * Resolves language specification.
   * - Egyptian Arabic default (ar-EG)
   * - Splits US and British English (en-US / en-GB)
   * - Bare English ('en') throws for conversation and content
   * - Arabic US/GB names resolve (e.g. 'إنجليزي أمريكي' -> 'en-US', 'إنجليزي بريطاني' -> 'en-GB')
   * - Shared / ambiguous dialect names throw naming members
   */
  static resolveLocale(localeInput?: string): string {
    if (!localeInput || localeInput.trim() === '') {
      return DEFAULT_MISSION_LANGUAGE;
    }

    const trimmed = localeInput.trim().toLowerCase();

    // Bare English check: bare 'en' throws for conversation and content
    if (trimmed === 'en' || trimmed === 'english') {
      throw new Error(
        'Bare English "en" is ambiguous for conversation and content: must specify "en-US" or "en-GB"',
      );
    }

    // Resolves US / GB English
    if (
      trimmed === 'en-us' ||
      trimmed === 'us' ||
      trimmed.includes('أمريكي') ||
      trimmed === 'ar-us'
    ) {
      return 'en-US';
    }

    if (
      trimmed === 'en-gb' ||
      trimmed === 'gb' ||
      trimmed.includes('بريطاني') ||
      trimmed === 'ar-gb'
    ) {
      return 'en-GB';
    }

    // Egyptian Arabic
    if (
      trimmed === 'ar' ||
      trimmed === 'ar-eg' ||
      trimmed === 'egyptian' ||
      trimmed.includes('مصري') ||
      trimmed.includes('عربي')
    ) {
      return 'ar-EG';
    }

    // Shared dialect names without member throw naming members
    if (trimmed === 'arabic-dialects' || trimmed === 'shared-dialects') {
      throw new Error(
        'Shared dialect name is ambiguous: must specify member from [ar-EG, ar-SA, ar-AE, ar-MA, ar-DZ]',
      );
    }

    return localeInput;
  }

  /**
   * Builds the official AZZAR system prompt containing:
   * - AZZAR (أذّار)
   * - Business manager & orchestrator
   * - Developed by VO for Technology (https://www.vo.technology/en)
   * - Engineer: Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey)
   * - The two official links only: https://www.vo.technology/en and github.com/hazemelerefey
   * - No CAO to the user, no عزار
   * - Model & provider disclosure
   * - Egyptian Arabic default
   */
  static buildAzzarSystemPrompt(options: PromptIdentityOptions): string {
    const resolvedLocale = MissionLanguageManager.resolveLocale(options.locale);

    return `You are AZZAR (أذّار), an advanced AI business manager and orchestrator for operations and intelligent agents.
You were developed by VO for Technology (https://www.vo.technology/en), engineer Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey).
Official links (use only these two links):
- https://www.vo.technology/en
- github.com/hazemelerefey

Execution Environment & Model Disclosure:
- Active Model: ${options.model}
- Active Provider: ${options.provider}
- Whenever asked who you are, who developed you, or what model powers you, state clearly that you are AZZAR (أذّار), developed by VO for Technology (https://www.vo.technology/en), engineer Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey), running on ${options.model} via ${options.provider}. Do NOT say VO is led by Eng. Hazem Elerefy, and do NOT cite hazemelerefy.tech as VO's website.

Communication & Identity Rules:
1. Always identify as AZZAR (أذّار). Never claim to be trained by Google, OpenAI, Anthropic, or any other provider directly to the user.
2. Never refer to yourself as "CAO" directly to the user (refer to yourself as business manager or orchestrator; no "CAO" acronym in direct conversation).
3. Never spell your name as "عزار" — always write "أذّار".
4. Default Language: Egyptian Arabic (اللهجة المصرية الطبيعية والواضحة لرواد الأعمال وأصحاب المشاريع) with warmth, clarity, and professionalism. Avoid stiff classical Arabic (فصحى جافة).
5. For formal campaign briefs, receipts, and artifact documents, provide the Egyptian Arabic version with an English summary.
6. Target Locale: ${resolvedLocale}`;
  }

  /**
   * Strips single-line and multi-line comments before extracting manifest id.
   */
  static extractManifestId(content: string): string | null {
    // Strip comments
    const stripped = content.replaceAll(/\/\*[\S\s]*?\*\//g, '').replaceAll(/\/\/.*$/gm, '');

    const match = stripped.match(/id\s*:\s*['"]([\w-]+)['"]/);
    return match ? match[1] : null;
  }

  /**
   * Post-generation sanitizer that removes/corrects forbidden identity strings,
   * incorrect Arabic spelling ("عزار"), and direct "CAO" acronym usage.
   */
  static sanitizeAzzarOutput(text: string): string {
    if (!text) return text;
    return text
      .replaceAll('عزار', 'أذّار')
      .replaceAll(
        /\bI am (?:Gemma|a large language model),? trained by Google\.?/gi,
        'أنا أذّار (AZZAR)، تم تطويري بواسطة شركة VO for Technology (https://www.vo.technology/en).',
      )
      .replaceAll(
        /\btrained by (?:Google|OpenAI|Anthropic|Meta|Alibaba)\b/gi,
        'developed by VO for Technology (https://www.vo.technology/en)',
      )
      .replaceAll(/\bChief Agent Orchestrator\b/gi, 'business manager and orchestrator')
      .replaceAll(/\bCAO\b/g, 'منسق ومدير الأعمال الذكي');
  }

  /**
   * Anti-slop markup validator: enforces full chip markup instead of bare dot span.
   */
  static validateChipMarkup(html: string): { valid: boolean; reason?: string } {
    if (html.includes('<span class="dot">') && !html.includes('azzar-chip')) {
      return {
        reason: 'Anti-slop violation: found bare dot span without full azzar-chip markup',
        valid: false,
      };
    }
    return { valid: true };
  }
}
