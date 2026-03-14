"use client";

/**
 * Language Provider for client-side components
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Locale } from './config';
import { defaultLocale } from './config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
  dictionary: Record<string, any>;
}

export function LanguageProvider({
  children,
  initialLocale = defaultLocale,
  dictionary
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dict, setDict] = useState(dictionary);

  useEffect(() => {
    // Load dictionary when locale changes
    const loadDictionary = async () => {
      const response = await fetch(`/api/dictionary/${locale}`);
      if (response.ok) {
        const data = await response.json();
        setDict(data);
      }
    };

    if (locale !== initialLocale) {
      loadDictionary();
    }
  }, [locale, initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Store preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = dict;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
