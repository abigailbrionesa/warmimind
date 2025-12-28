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
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50 rounded">
       {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null,
          )}
        </div>
      ))}

        {(status === 'submitted' || status === 'streaming') && (
        <div>
          {status === 'submitted' &&<div>loading</div>}
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      </div>

       <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Say something..."
        />

      <button onClick={handleSend} disabled={status === "streaming"}>
          Submit
        </button>
    </section>
  );
}
