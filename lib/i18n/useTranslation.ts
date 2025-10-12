'use client';

import { useState, useEffect } from 'react';
import { getTranslation, defaultLocale, type Locale } from './config';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Load locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  const t = (key: string, params?: Record<string, string>): string => {
    return getTranslation(locale, key, params);
  };

  return { t, locale };
}
