import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { geminiModel } from "@/lib/ai-model";
import { getSession, addMessageToSession, sessions } from "@/lib/session-store";
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

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 400 }
      );
    }

    const previousConversation = (session.chatHistory ?? [])
      .map(m =>
        m.role === "user"
          ? `User: ${m.parts.map(p => p.type === "text" ? p.text : "").join("")}`
          : `Assistant: ${m.parts.map(p => p.type === "text" ? p.text : "").join("")}`
      )
      .join("\n");

    const relevantChunks = findRelevantChunks(message, session.chunks);

    const systemPrompt = `
You are a Quechua STEM tutor for young girls in Peru.
Use ONLY the provided PDF context and the previous conversation.
Explain clearly and kindly.
Respond ONLY in Quechua.
`;

    addMessageToSession(sessionId, {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: message }],
    });

    let assistantText = "";

    const result = streamText({
      model: geminiModel,
      system: systemPrompt,
      prompt: `
PDF CONTEXT:
${relevantChunks.join("\n")}

Previous conversation:
${previousConversation}

New question:
${message}
`,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          assistantText += chunk.text;
        }
      },
      onFinish: () => {
        addMessageToSession(sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [{ type: "text", text: assistantText }],
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Chat failed", message: error.message, stack: error.stack, type: error.constructor?.name },
      { status: 500 }
    );
  }
}
