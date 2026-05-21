import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { detectLanguage, translate } from "@/lib/translate";
import { createSession, sessions } from "@/lib/session-store";

export const runtime = "nodejs";
const geminiModel = google("gemini-2.5-flash");

const CHUNK_SIZE = 18000;

function splitText(text: string) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

async function processChunk(chunk: string) {
  const prompt = `
You are an educational AI helping young girls in Peru learn STEM.

TASKS:
1. Summarize clearly and simply.
2. Use Andean / Quechua cultural references (mountains, farming, weaving, community life).
3. Generate exactly 5 open-ended questions.
4. Avoid technical jargon unless explained.

Return ONLY valid JSON (no markdown or extra text):
{
  "summary": "string",
  "questions": ["string","string","string","string","string"]
}
`;

  const result = await generateText({
    model: geminiModel,
    prompt: `${prompt}\n\nCONTENT:\n${chunk}`,
    temperature: 0.4,
    providerOptions: {
      google: { thinkingConfig: { thinkingBudget: 8192, includeThoughts: true } },
    },
  });

  const jsonText = result.text.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(jsonText);

  if (!parsed.summary || !Array.isArray(parsed.questions) || parsed.questions.length !== 5) {
    throw new Error("Invalid AI JSON structure in chunk");
  }

  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const detectedLang = await detectLanguage(text);
    console.log("Detected language:", detectedLang);

    const normalizedText = detectedLang !== "es" ? await translate(text, "es") : text;
    console.log("Normalized text length:", normalizedText.length);

    const chunks = splitText(normalizedText);
    console.log("Number of chunks:", chunks.length);

    let combinedSummary = "";
    let combinedQuestions: string[] = [];

    for (const chunk of chunks) {
      const { summary, questions } = await processChunk(chunk);
      combinedSummary += summary + "\n";
      combinedQuestions.push(...questions);
    }

    combinedQuestions = combinedQuestions.slice(0, 5);

    const summaryQu = await translate(combinedSummary, "qu");
    const questionsQu = await Promise.all(combinedQuestions.map(q => translate(q, "qu")));

    const sessionId = crypto.randomUUID();
    createSession(sessionId, normalizedText);

console.log("Created session:", sessionId, sessions.has(sessionId));

    return NextResponse.json({ sessionId, summaryQu, questionsQu });

  } catch (error) {
    console.error("PROCESS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to process PDF. Please try again with a valid document." },
      { status: 500 }
    );
  }
}
