'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/language';
import { Locale } from '../i18n';


interface LanguageContextType {
  currentLanguage: Locale;
  setCurrentLanguage: (lang: Locale) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setLanguage] = useState<Locale>(DEFAULT_LANGUAGE as Locale);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const setCurrentLanguage = useCallback(
    async (lang: Locale) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const isSupported = SUPPORTED_LANGUAGES.some((l) => l.code === lang);
        if (!isSupported) {
          throw new Error(`Language ${lang} is not supported`);
        }

        setLanguage(lang);

        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedLanguage', lang);
        }

        router.push(`/${lang}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to change language';
        setError(errorMessage);
        console.error('Language change error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, isLoading, error }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}