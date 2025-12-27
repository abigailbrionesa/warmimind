import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function chunkText(text: string, chunkSize = 30000): string[] {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured in .env.local' }, { status: 500 });
    }

    const chunks = chunkText(text, 30000);
    let finalSummary = '';

    for (const chunk of chunks) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Please provide a comprehensive summary of the following document. Include main topics, key points, and important conclusions:\n\n${chunk}`
                  }
                ]
              }
            ],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Gemini API chunk error:', data);
        finalSummary += `\n[Chunk summary unavailable: ${data.error?.message || 'unknown error'}]`;
        continue;
      }

      const chunkSummary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      finalSummary += chunkSummary + '\n';
    }

    return NextResponse.json({ summary: finalSummary.trim() });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return NextResponse.json(
      { error: 'Failed to generate summary', details: err.message || String(err) },
      { status: 500 }
    );
  }
}