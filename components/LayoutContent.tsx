'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageProvider } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const t = useTranslations();

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{t('common.appTitle')}</h1>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-gray-100 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
            <p>© 2025 {t('common.appTitle')}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </LanguageProvider>
  );
}
