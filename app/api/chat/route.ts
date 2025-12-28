import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { geminiModel } from "@/lib/ai-model";
import { getSession, addMessageToSession } from "@/lib/session-store";
import { findRelevantChunks } from "@/lib/find-relevant-chunks";

export const runtime = "nodejs";


export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages } = await req.json();

    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing sessionId or messages" },
        { status: 400 }
      );
    }

    console.log("Received chat request:", { sessionId, messages });

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 400 }
      );
    }

    const lastMessage = messages.at(-1);
    const userText =
      lastMessage.parts
        ?.map(p => (p.type === "text" ? p.text : ""))
        .join("") ?? "";

    addMessageToSession(sessionId, {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: userText }],
    });

    const previousConversation = session.chatHistory
      .map(
        m =>
          `${m.role === "user" ? "User" : "Assistant"}: ${
            m.parts?.map(p => (p.type === "text" ? p.text : "")).join("") ?? ""
          }`
      )
      .join("\n");

    const relevantChunks = findRelevantChunks(userText, session.chunks);

    let assistantText = "";

    const result = streamText({
      model: geminiModel,
      system: `
You are a Quechua STEM tutor for young girls in Peru.
Use ONLY the provided PDF context and the previous conversation.
Respond ONLY in Quechua.
      `,
      prompt: `
PDF CONTEXT:
${relevantChunks.join("\n")}

Previous conversation:
${previousConversation}

New question:
${userText}
      `,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") assistantText += chunk.text;
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
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat failed", message: err.message },
      { status: 500 }
    );
  }
}
