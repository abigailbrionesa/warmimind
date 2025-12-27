'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/language';


interface PDFContent {
  originalText: string;
  summary: string;
  translatedSummary?: string;
  translatedText?: string;
}

export default function ViewerPage() {
  const { currentLanguage } = useLanguage();
  const t = useTranslations();

  const [pdfContent, setPdfContent] = useState<PDFContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  }

  
  async function translateContent(text: string, targetLanguage: string): Promise<string> {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage: DEFAULT_LANGUAGE,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Translation failed');
    }

    const data = await response.json();
    return data.translatedText;
  }

  async function generateAISummary(
    text: string,
    targetLanguage: string = DEFAULT_LANGUAGE
  ): Promise<{ summary: string; translatedSummary?: string }> {
    const response = await fetch('/api/gemini-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Summary generation failed');
    }

    return response.json();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.includes('pdf')) {
      setError(t('pdfViewer.errorMessage'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Extracting text from PDF...');
      const extractedText = await extractTextFromPDF(file);

      if (!extractedText.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }

      console.log('Generating AI summary...');
      const { summary, translatedSummary } = await generateAISummary(
        extractedText,
        currentLanguage
      );

      let translatedText: string | undefined;
      if (currentLanguage !== DEFAULT_LANGUAGE) {
        console.log(`Translating content to ${currentLanguage}...`);
        translatedText = await translateContent(extractedText, currentLanguage);
      }

      setPdfContent({
        originalText: extractedText,
        summary,
        translatedSummary: translatedSummary || undefined,
        translatedText,
      });

      console.log('PDF processing completed successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      console.error('PDF processing error:', err);
      setPdfContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async () => {
    if (!pdfContent) return;

    setIsLoading(true);
    setError(null);

    try {
      if (currentLanguage !== DEFAULT_LANGUAGE) {
        console.log(`Re-translating to ${currentLanguage}...`);
        const translatedSummary = await translateContent(pdfContent.summary, currentLanguage);
        const translatedText = await translateContent(pdfContent.originalText, currentLanguage);

        setPdfContent((prev) =>
          prev
            ? {
                ...prev,
                translatedSummary,
                translatedText,
              }
            : null
        );
      } else {
        setPdfContent((prev) =>
          prev
            ? {
                ...prev,
                translatedSummary: undefined,
                translatedText: undefined,
              }
            : null
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMsg);
      console.error('Language change translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [lastLanguage, setLastLanguage] = useState(currentLanguage);
  if (lastLanguage !== currentLanguage) {
    setLastLanguage(currentLanguage);
    handleLanguageChange();
  }


  const handleClear = () => {
    setPdfContent(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayText =
    currentLanguage !== DEFAULT_LANGUAGE && pdfContent?.translatedText
      ? pdfContent.translatedText
      : pdfContent?.originalText;

  const displaySummary =
    currentLanguage !== DEFAULT_LANGUAGE && pdfContent?.translatedSummary
      ? pdfContent.translatedSummary
      : pdfContent?.summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('pdfViewer.title')}
          </h1>
          <p className="text-gray-600">
            {t('pdfViewer.uploadPrompt')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h3 className="font-bold mb-2">{t('pdfViewer.errorTitle')}</h3>
            <p>{error}</p>
          </div>
        )}

        {!pdfContent && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="animate-spin h-5 w-5"
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
                  <span>{t('pdfViewer.processingMessage')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {pdfContent && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('pdfViewer.summaryTitle')}
              </h2>
              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                {displaySummary ? (
                  <ReactMarkdown>{displaySummary}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500">{t('pdfViewer.noSummary')}</p>
                )}
              </div>
              {isLoading && (
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <svg
                    className="animate-spin h-5 w-5"
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
                  <span>{t('pdfViewer.processingMessage')}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('pdfViewer.fullTextTitle')}
              </h2>
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                {displayText || (
                  <p className="text-gray-500">{t('pdfViewer.noText')}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {t('buttons.clear')}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {t('pdfViewer.uploadButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}