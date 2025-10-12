import en from './locales/en.json';
import hi from './locales/hi.json';

export type Locale = 'en' | 'hi';

export const locales: Locale[] = ['en', 'hi'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  hi: '🇮🇳'
};

export const translations = {
  en,
  hi
};

export const defaultLocale: Locale = 'en';

// Helper function to get nested translation
export function getTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string>
): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters like {{name}}
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{{${paramKey}}}`, paramValue);
    });
  }

  return value;
}
