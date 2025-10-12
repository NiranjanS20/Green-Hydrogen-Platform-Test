'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setCurrentLocale(savedLocale);
      document.documentElement.lang = savedLocale;
    }
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    // Trigger page refresh to apply translations
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-3 py-1.5 text-sm rounded-md border border-transparent hover:border-blue-200 bg-white/60"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden md:inline">{localeFlags[currentLocale]} {localeNames[currentLocale]}</span>
        <span className="md:hidden">{localeFlags[currentLocale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glassmorphic-strong border-2 border-white/40">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`cursor-pointer ${
              currentLocale === locale ? 'bg-blue-100 text-blue-700' : ''
            }`}
          >
            <span className="mr-2 text-lg">{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
            {currentLocale === locale && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
