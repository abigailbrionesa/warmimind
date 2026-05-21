import { NextRequest, NextResponse } from "next/server";
import { generateText, streamText } from "ai";
import type { UIMessage } from "ai";

import { geminiModel } from "@/lib/ai-model";
import { getSession, addMessageToSession } from "@/lib/session-store";
import { findRelevantChunks } from "@/lib/find-relevant-chunks";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const {
      sessionId,
      messages,
    }: { sessionId: string; messages: UIMessage[] } = await req.json();

    if (!sessionId  || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing sessionId or messages" },
        { status: 400 }
      );
    }


    const session = getSession(sessionId);
    if (!session) {
     return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 400 })
    }

    const lastMessage = messages.at(-1);
    if (!lastMessage) {
      return NextResponse.json(
        { error: "Invariant violation: no last message" },
        { status: 400 }
      );
    }

    const userText =
      lastMessage.parts
        ?.map(p => (p.type === "text" ? p.text : ""))
        .join("") ?? "";

    const trimmed = userText.trim().toLowerCase();

    const isGreeting =
      trimmed.length <= 12 &&
      /^(hello|hi|hola|rimaykullayki)$/.test(trimmed);

    if (isGreeting) {
      const greeting = "Rimaykullayki. Imaynallan kashanki?";
      addMessageToSession(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: greeting }],
      });

      return NextResponse.json({
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: greeting }],
      });
    }

    addMessageToSession(sessionId, {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: userText }],
    });


    const relevantChunks = findRelevantChunks(userText, session.chunks);
    if (relevantChunks.length === 0) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "I could not find enough support in the uploaded PDF. Try asking about a topic that appears in the source.",
          },
        ],
      });
    }

    const groundingResult = await generateText({
      model: geminiModel,
      temperature: 0.2,
      system: `
You are a STEM grounding agent.

RULES:
- Use ONLY the provided PDF context.
- Do NOT add outside knowledge.
- Do NOT add cultural examples.
- Be clear and factual.
- If the exact answer is not found, say that the PDF does not provide enough support.
`,
      prompt: `
PDF CONTEXT:
${relevantChunks.join("\n")}

QUESTION:
${userText}

Provide a grounded explanation:
`,
    });

    const groundedExplanation = groundingResult.text;

    let assistantText = "";

    const result = streamText({
      model: geminiModel,
      temperature: 0.25,

      system: `
You are a Quechua (Southern Peru) STEM tutor for young girls.

MANDATORY RULES:
- Respond ONLY in Quechua.
- Use clear, modern, instructional Quechua.
- Speak like a teacher or older sister, not a storyteller.
- Use practical Andean examples ONLY if helpful.
- Avoid myths, legends, or ceremonial tone.
- Keep response length proportional to the question.
- Do NOT add information not present in the grounded explanation.
- Output text only.
`,

      prompt: `
GROUNDED STEM EXPLANATION:
${groundedExplanation}

Rewrite this as culturally grounded spoken Quechua:
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
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
