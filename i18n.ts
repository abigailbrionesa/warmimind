import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'qu', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'qu';

export const routing = {
  locales,
  defaultLocale,
};

export default getRequestConfig(async () => {
  let locale = defaultLocale;
  
  try {
    const { getLocale } = await import('next-intl/server');
    const detected = getLocale();
    if (detected && locales.includes(detected as Locale)) {
      locale = detected as Locale;
    }
  } catch {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
