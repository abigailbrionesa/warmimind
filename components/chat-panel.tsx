"use client";

import { useState } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

type ChatPanelProps = {
  sessionId: string;
};

export default function ChatPanel({ sessionId }: ChatPanelProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: (payload) => ({
        sessionId,
        message: payload,
      }),
    }),
    onFinish: (payload) => {
      if (payload?.message) {
        console.log("Assistant finished:", payload.message);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: input }],
    };

    sendMessage(userMessage);
    setInput("");
  };

  return (
    <section className="border rounded-lg p-4 flex flex-col gap-4 h-full">
      <h2 className="font-semibold">💬 Rimay (Ask about this lesson)</h2>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded text-sm ${
              m.role === "user" ? "bg-blue-100 self-end" : "bg-green-100 self-start"
            }`}
          >
            {m.parts
              .filter((p) => p.type === "text")
              .map((p, i) => (
                <span key={i}>{p.text}</span>
              ))}
          </div>
        ))}

        {status === "streaming" && (
          <p className="text-sm text-gray-400">AIGenie yachachkan…</p>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapuy kay yachaymanta…"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={status === "streaming"}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          Rimay
        </button>
      </div>
    </section>
  );
}
