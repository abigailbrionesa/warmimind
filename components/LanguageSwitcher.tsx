'use client';

import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../config/language';
import { Locale } from '../i18n';
import { useTranslations } from 'next-intl';


export function LanguageSwitcher() {
  const { currentLanguage, setCurrentLanguage, isLoading, error } = useLanguage();
  const t = useTranslations();

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage !== currentLanguage) {
      await setCurrentLanguage(newLanguage as Locale);
    }
  };

  const currentLanguageName =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage)?.name || currentLanguage;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        {t('languageSwitcher.label')}:
      </label>

      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        disabled={isLoading}
        className="relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={t('languageSwitcher.selectLanguage')}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      {isLoading && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export default LanguageSwitcher;
