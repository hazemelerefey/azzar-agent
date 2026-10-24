import { supportLocales } from '@/locales/resources';

export const DEFAULT_LANG = 'en-US';
export const AZZAR_LOCALE_COOKIE = 'AZZAR_LOCALE';

/**
 * Check if the language is supported
 * @param locale
 */
export const isLocaleNotSupport = (locale: string) => !supportLocales.includes(locale);
