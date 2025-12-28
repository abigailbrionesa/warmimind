import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { geminiModel } from "@/lib/ai-model";
import { getSession, addMessageToSession } from "@/lib/session-store";
import { findRelevantChunks } from "@/lib/find-relevant-chunks";
import { generateText } from "ai";
import type { UIMessage } from "ai";


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages }: { sessionId: string; messages: UIMessage[] } =
      await req.json();

    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing sessionId or messages" },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 400 }
      );
    }

    const lastMessage = messages.at(-1);
    if (!lastMessage) {
      return NextResponse.json(
        { error: "No last message found" },
        { status: 400 }
      );
    }
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
          `${m.role === "user" ? "User" : "Assistant"}: ${m.parts?.map(p => (p.type === "text" ? p.text : "")).join("") ?? ""
          }`
      )
      .join("\n");

    const relevantChunks = findRelevantChunks(userText, session.chunks);


    const groundingResult = await generateText({
      model: geminiModel,
      system: `
You are a STEM content grounding agent.

RULES:
- Use ONLY the provided PDF context.
- Do NOT add outside knowledge.
- Do NOT include cultural examples.
- Write in simple, neutral language.
- If the answer is not in the PDF, say so clearly.
`,
      prompt: `
PDF CONTEXT:
${relevantChunks.join("\n")}

Question:
${userText}

Provide a grounded STEM explanation:
`,
    });

    const groundedExplanation = groundingResult.text;


    const culturalResult = await generateText({
      model: geminiModel,
      system: `
You are a cultural adaptation agent for Andean communities in Peru.

RULES:
- Adapt the explanation using Andean daily life.
- Use examples from farming, weaving, mountains, seasons, or community work.
- Teach as if speaking to a child.
- Start with a concrete lived example.
- Do NOT translate into Quechua yet.
`,
      prompt: `
Grounded STEM explanation:
${groundedExplanation}

Adapt this explanation culturally:
`,
    });

    const culturallyAdapted = culturalResult.text;


    let assistantText = "";

    const result = streamText({
      model: geminiModel,

      system: `
You are a Quechua linguistic authenticity agent.

MANDATORY RULES:
- Respond ONLY in Quechua.
- Use natural Quechua sentence structure (not Spanish).
- Use Quechua particles and suffixes where appropriate (-mi, -qa, -chu).
- Use oral teaching style.
- Avoid literal translation.
- Output TEXT ONLY.

FINAL SELF-CHECK (silent):
If this sounds translated, rewrite internally before responding.
`,

      prompt: `
Culturally adapted explanation:
${culturallyAdapted}

Rewrite this as natural spoken Quechua for a child:
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


  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat failed", message: err.message },
      { status: 500 }
    );
  }
}
