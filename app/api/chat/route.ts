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

    console.log("Looking for session:", sessionId, sessions.has(sessionId));

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 400 }
      );
    }

    const previousConversation = (session.chatHistory ?? [])
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const relevantChunks = findRelevantChunks(message, session.chunks);

    const systemPrompt = `
You are a Quechua STEM tutor for young girls in Peru.
Use ONLY the provided PDF context and the previous conversation.
Explain clearly and kindly.
Respond ONLY in Quechua.
`;

    addMessageToSession(sessionId, { role: "user", content: message });

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
        addMessageToSession(sessionId, { role: "assistant", content: assistantText });
      },
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Chat failed",
        message: error.message,
        stack: error.stack,
        type: error.constructor?.name
      },
      { status: 500 }
    );
  }
}
