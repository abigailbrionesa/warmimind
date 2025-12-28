import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { detectLanguage, translate } from "@/lib/translate";
import { createSession } from "@/lib/session-store";

export const runtime = "nodejs";

const geminiModel = google("gemini-2.5-flash");

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const detectedLang = await detectLanguage(text);

    const normalizedText =
      detectedLang !== "es" ? await translate(text, "es") : text;

    const prompt = `
You are an educational AI helping young girls in Peru learn STEM.

TASKS:
1. Summarize the content clearly and simply.
2. Adapt explanations using Andean / Quechua cultural references
   (mountains, farming, weaving, community life).
3. Generate exactly 5 open-ended questions.
4. Avoid technical jargon unless explained.

Return ONLY valid JSON (no markdown, no extra text):
{
  "summary": "string",
  "questions": ["string", "string", "string", "string", "string"]
}
`;

    const result = await generateText({
      model: geminiModel,
      prompt: `${prompt}\n\nCONTENT:\n${normalizedText.slice(0, 20000)}`,
      temperature: 0.4,
      providerOptions: {
        google: {
          thinkingConfig: { thinkingBudget: 8192, includeThoughts: true },
        },
      },
    });

    let jsonText = result.text.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonText);

    if (!parsed.summary || !Array.isArray(parsed.questions) || parsed.questions.length !== 5) {
      throw new Error("Invalid AI JSON structure");
    }

    const summaryQu = await translate(parsed.summary, "qu");
    const questionsQu = await Promise.all(parsed.questions.map(q => translate(q, "qu")));

    const sessionId = crypto.randomUUID();
    createSession(sessionId, normalizedText);

    return NextResponse.json({ sessionId, summaryQu, questionsQu });
  } catch (error: any) {
    console.error("PROCESS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to process PDF", details: error.message, type: error.constructor?.name },
      { status: 500 }
    );
  }
}
