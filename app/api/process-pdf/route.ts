// app/api/process-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: 'No file uploaded' });

  const arrayBuffer = await file.arrayBuffer();
  const pdfData = await pdfParse(Buffer.from(arrayBuffer));

  const summary = await callGoogleGemini(pdfData.text);

  return NextResponse.json({ summary });
}

async function callGoogleGemini(text: string) {
  return `Resumen: ${text.slice(0, 200)}...`;
}
