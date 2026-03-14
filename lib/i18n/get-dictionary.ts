/**
 * Dictionary loader for server components
 */

import type { Locale } from './config';

const dictionaries = {
  'en-CA': () => import('@/locales/en-CA/common.json').then((module) => module.default),
  'fr-QC': () => import('@/locales/fr-QC/common.json').then((module) => module.default),
  'es': () => import('@/locales/es/common.json').then((module) => module.default),
  'de': () => import('@/locales/de/common.json').then((module) => module.default),
  'ja': () => import('@/locales/ja/common.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
