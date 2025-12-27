import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getSession } from "@/lib/session-store";
import { findRelevantChunks } from "@/lib/find-relevant-chunks";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Missing message or sessionId" },
        { status: 400 }
      );
    }
console.log("SESSION REQUESTED:", sessionId);

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 400 }
      );
    }

    console.log("SESSION FOUND:", !!session);


    const relevantChunks = findRelevantChunks(
      message,
      session.chunks
    );

    const systemPrompt = `
You are a Quechua STEM tutor for young girls in Peru.
Use ONLY the provided PDF context.
Explain clearly and kindly.
Respond ONLY in Quechua.
`;

    const result = await streamText({
      model,
      system: systemPrompt,
      prompt: `
PDF CONTEXT:
${relevantChunks.join("\n")}

QUESTION:
${message}
`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
