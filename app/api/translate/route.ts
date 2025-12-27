import { NextRequest, NextResponse } from 'next/server';
import { TranslationServiceClient } from '@google-cloud/translate';

export const runtime = 'nodejs';

const translateClient = new TranslationServiceClient();


async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<{ translatedText: string; detectedSourceLanguage: string }> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable not set');
  }

  const location = 'global';

  try {
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLanguage,
      targetLanguageCode: targetLanguage,
    };

    const [response] = await translateClient.translateText(request);

    const translatedText = response.translations?.[0]?.translatedText || '';
    const detectedSourceLanguage = response.translations?.[0]?.detectedLanguageCode || sourceLanguage;

    return {
      translatedText,
      detectedSourceLanguage,
    };
  } catch (error) {
    console.error('Google Cloud Translation error:', error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetLanguage, sourceLanguage = 'en' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: 'targetLanguage parameter is required and must be a string' },
        { status: 400 }
      );
    }

    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({
        translatedText: text,
        detectedSourceLanguage: sourceLanguage,
      });
    }

    const result = await translateText(text, targetLanguage, sourceLanguage);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
