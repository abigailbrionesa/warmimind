"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotIcon, Flower, Copy } from "lucide-react";

type ChatPanelProps = {
  sessionId: string;
  summaryQu: string | null;
  questionsQu: string[];
};

export default function ChatPanel({ sessionId, summaryQu, questionsQu }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId },
    }),
  });

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });

    setInput("");
    setIsTyping(true);
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") setIsTyping(false);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <section className="flex flex-col w-full h-full border rounded-lg p-4 bg-gray-50 shadow-sm">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 max-w-[80%] break-words ${
                  message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {message.role === "assistant" ? (
                  <BotIcon className="w-6 h-6 text-green-700 mt-1" />
                ) : (
                  <Flower className="w-6 h-6 text-pink-500 mt-1" />
                )}

                <div
                  className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                    message.role === "user"
                      ? "bg-blue-200 text-blue-900"
                      : "bg-green-200 text-green-900"
                  }`}
                >
                  {message.parts.map((part, idx) =>
                    part.type === "text" ? <p key={idx}>{part.text}</p> : null
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 mt-1">
                <BotIcon className="w-6 h-6 text-green-700 mt-1 animate-bounce" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-green-700 rounded-full animate-bounce delay-0"></span>
                  <span className="w-2 h-2 bg-green-700 rounded-full animate-bounce delay-200"></span>
                  <span className="w-2 h-2 bg-green-700 rounded-full animate-bounce delay-400"></span>
                </div>
                <span className="text-gray-600 text-sm italic">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 mt-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about STEM or your PDF..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} disabled={status === "streaming"}>
              Send
            </Button>
            {status === "streaming" && (
              <Button variant="destructive" onClick={() => stop()}>
                Stop
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="p-4 overflow-y-auto flex-1">
          {summaryQu ? (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{summaryQu}</div>
          ) : (
            <p className="text-gray-400 text-sm">No summary available yet.</p>
          )}
        </TabsContent>

        <TabsContent value="questions" className="p-4 overflow-y-auto flex-1">
          {questionsQu && questionsQu.length > 0 ? (
            <div className="flex flex-col gap-2">
              {questionsQu.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100"
                  onClick={() => copyToClipboard(q)}
                >
                  <span className="text-sm text-gray-700">{q}</span>
                  <Copy className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No questions available.</p>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
