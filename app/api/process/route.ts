import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { detectLanguage, translate } from "@/lib/translate";

const model = google("gemini-2.5-flash");

const sessions = new Map();

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const sessionId = crypto.randomUUID();

  const lang = await detectLanguage(text);
  const normalized =
    lang !== "es" ? await translate(text, "es") : text;

  const prompt = `
Summarize this STEM content for students.
Generate 5 open-ended questions.
Adapt examples to Andean / Quechua culture.
`;

  const result = await model.generateText({
    prompt: `${prompt}\n\n${normalized}`,
  });

  const summaryQu = await translate(result.summary, "qu");
  const questionsQu = await Promise.all(
    result.questions.map(q => translate(q, "qu"))
  );

  sessions.set(sessionId, {
    text: normalized,
    chunks: normalized.match(/.{1,800}/g),
  });

  return Response.json({
    sessionId,
    summaryQu,
    questionsQu,
  });
}
