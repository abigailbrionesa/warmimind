import { NextRequest, NextResponse } from 'next/server';
import { TranslationServiceClient } from '@google-cloud/translate';

export const runtime = 'nodejs';

export const translateClient = new TranslationServiceClient();

export async function translateToQuechua(text: string) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  if (!projectId) throw new Error('GOOGLE_CLOUD_PROJECT_ID not set');

  const location = 'global';
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'qu',
  };

  const [response] = await translateClient.translateText(request);
  return response.translations?.[0]?.translatedText || '';
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

    const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    const truncatedText = text.slice(0, 30000);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Please summarize this document in Markdown format:\n\n${truncatedText}` }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated';

    const summaryQuechua = await translateToQuechua(summary);

    return NextResponse.json({ summary, summaryQuechua });
  } catch (err: any) {
    console.error('Error in summary + translation:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
