import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { detectLanguage, translate } from "@/lib/translate";
import { createSession } from "@/lib/session-store";

export const runtime = "nodejs";

const model = google("gemini-2.5-flash");

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const detectedLang = await detectLanguage(text);

    const normalizedText =
      detectedLang !== "es"
        ? await translate(text, "es", detectedLang)
        : text;

    const prompt = `
You are an educational AI helping young girls in Peru learn STEM.

TASKS:
1. Summarize the content clearly and simply.
2. Adapt explanations using Andean / Quechua cultural references
   (mountains, farming, weaving, community life).
3. Generate exactly 5 open-ended questions.
4. Avoid technical jargon unless explained.

Return valid JSON ONLY (no markdown formatting):
{
  "summary": "string",
  "questions": ["string", "string", "string", "string", "string"]
}
`;

    const result = await generateText({
      model,
      prompt: `${prompt}\n\nCONTENT:\n${normalizedText}`,
      temperature: 0.4,
    });

    let jsonText = result.text.trim();
    
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```$/g, "");
    }
    
    const parsed = JSON.parse(jsonText.trim());

    const summaryQu = await translate(parsed.summary, "qu", "es");

    const questionsQu = await Promise.all(
      parsed.questions.map((q: string) =>
        translate(q, "qu", "es")
      )
    );

    const sessionId = crypto.randomUUID();
    createSession(sessionId, {
  chunks: normalizedText.match(/.{1,800}/g) || [],
});

console.log("SESSION CREATED:", sessionId);

    return NextResponse.json({
      sessionId,
      summaryQu,
      questionsQu,
    });
  } catch (error: any) {
    console.error("Process error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { 
        error: "Failed to process PDF",
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}