import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTimeZone } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { LanguageProvider } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Warmi Mind</h1>
              <LanguageSwitcher />
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="bg-gray-100 border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
              <p>© 2025 Warmi Mind. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </LanguageProvider>
    </NextIntlClientProvider>
  );
}
