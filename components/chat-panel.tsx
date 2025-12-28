"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

type ChatPanelProps = {
  sessionId: string;
  summaryQu: string | null;
  questionsQu: string[];
};

export default function ChatPanel({ sessionId }: ChatPanelProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { sessionId }
    }),
  });

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });
    setInput("");
  };

  return (
    <section className="border rounded p-4 flex flex-col gap-3">
      <div className="flex-1 overflow-y-auto">
        {messages.map((m) => (
          <p key={m.id}>
            <b>{m.role}:</b>{" "}
            {m.parts
              .map((part) => (part.type === "text" ? part.text : ""))
              .join("")}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button onClick={handleSend} disabled={status === "streaming"}>
        Send
      </button>
    </section>
  );
}
