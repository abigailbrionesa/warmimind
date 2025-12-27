"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        sessionId,
      }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      assistantText += decoder.decode(value);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: assistantText,
        };
        return updated;
      });
    }

    setLoading(false);
  }

  return (
    <section className="border rounded-lg p-4 flex flex-col gap-4">
      <h2 className="font-semibold">💬 Rimay (Ask about this lesson)</h2>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded text-sm ${
              m.role === "user"
                ? "bg-blue-100 self-end"
                : "bg-green-100 self-start"
            }`}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <p className="text-sm text-gray-400">
            AIGenie yachachkan…
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapuy kay yachaymanta…"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Rimay
        </button>
      </div>
    </section>
  );
}
