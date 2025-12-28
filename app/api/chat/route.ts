import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { geminiModel } from "@/lib/ai-model";
import { getSession, addMessageToSession, sessions } from "@/lib/session-store";
import { findRelevantChunks } from "@/lib/find-relevant-chunks";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();

    if (!sessionId || !message) {
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

    const userText = message.parts
      ? message.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n")
      : message.content ?? "";

    if (!userText) {
      return NextResponse.json(
        { error: "Message has no text content" },
        { status: 400 }
      );
    }
    addMessageToSession(sessionId, {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: userText }],
    });

    const previousConversation = session.chatHistory
      .map((m) => {
        if (m.parts) return `${m.role === "user" ? "User" : "Assistant"}: ${m.parts.map(p => p.type === "text" ? p.text : "").join("")}`;
        if ("content" in m) return `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`;
        return "";
      })
      .join("\n");

    const relevantChunks = findRelevantChunks(userText, session.chunks);

    const systemPrompt = `
You are a Quechua STEM tutor for young girls in Peru.
Use ONLY the provided PDF context and the previous conversation.
Explain clearly and kindly.
Respond ONLY in Quechua.
`;

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
      { error: "Chat failed", message: err.message, type: err.constructor?.name },
      { status: 500 }
    );
  }
}
