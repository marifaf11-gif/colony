export type Locale = 'en-CA' | 'fr-QC' | 'es' | 'de' | 'ja';

export const locales: Locale[] = ['fr-QC', 'en-CA', 'es', 'de', 'ja'];
export const defaultLocale: Locale = 'fr-QC';

export const localeNames: Record<Locale, string> = {
  'en-CA': 'English',
  'fr-QC': 'Français',
  'es': 'Español',
  'de': 'Deutsch',
  'ja': '日本語',
};

export const localeFlags: Record<Locale, string> = {
  'en-CA': '🇨🇦',
  'fr-QC': '🇨🇦',
  'es': '🇪🇸',
  'de': '🇩🇪',
  'ja': '🇯🇵',
};

export const localeLang: Record<Locale, string> = {
  'en-CA': 'en',
  'fr-QC': 'fr',
  'es': 'es',
  'de': 'de',
  'ja': 'ja',
};

export const localeConfig = {
  locales,
  defaultLocale,
  localeNames,
  localeFlags,
  localeLang,
} as const;
