"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotIcon, Flower, Copy, FileText, List } from "lucide-react";

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
    <section className="flex flex-col w-full h-full border rounded-lg p-4 bg-card shadow-sm">
  <Tabs defaultValue="chat" className="flex-1 flex flex-col">
    <TabsList className="bg-card rounded-lg shadow-sm border p-1 mb-2">
      <TabsTrigger
        value="chat"
        className="flex items-center gap-2 font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-3 py-1 hover:bg-primary/10"
      >
        <BotIcon className="w-4 h-4" /> Chat
      </TabsTrigger>

      <TabsTrigger
        value="summary"
        className="flex items-center gap-2 font-semibold text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md px-3 py-1 hover:bg-accent/10"
      >
        <FileText className="w-4 h-4" /> Summary
      </TabsTrigger>

      <TabsTrigger
        value="questions"
        className="flex items-center gap-2 font-semibold text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-md px-3 py-1 hover:bg-secondary/10"
      >
        <List className="w-4 h-4" /> Questions
      </TabsTrigger>
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
              <BotIcon className="w-6 h-6 text-accent-foreground mt-1" />
            ) : (
              <Flower className="w-6 h-6 text-secondary-foreground mt-1" />
            )}

            <div
              className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground"
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
            <BotIcon className="w-6 h-6 text-accent-foreground mt-1 animate-bounce" />
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce delay-0"></span>
              <span className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce delay-200"></span>
              <span className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce delay-400"></span>
            </div>
            <span className="text-muted-foreground text-sm italic">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about STEM or your PDF..."
          className="flex-1 border-input text-foreground bg-card"
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

<TabsContent value="summary" className="p-4 overflow-y-auto flex-1 text-foreground">
  {summaryQu ? (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-primary-foreground">Summary</h3>
      <div className="bg-card-foreground/5 p-4 rounded-lg shadow-sm text-sm whitespace-pre-wrap">
        {summaryQu}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-muted-foreground">
      <FileText className="w-8 h-8" />
      <p className="text-sm">No summary available yet.</p>
      <p className="text-xs">Upload a PDF or start a chat to generate a summary.</p>
    </div>
  )}
</TabsContent>

<TabsContent value="questions" className="p-4 overflow-y-auto flex-1 text-foreground">
  {questionsQu && questionsQu.length > 0 ? (
    <div className="flex flex-col gap-3 h-full overflow-auto">
      <h3 className="text-lg font-semibold text-secondary-foreground">Generated Questions</h3>
      {questionsQu.map((q, idx) => (
        <div
          key={idx}
          onClick={() => copyToClipboard(q)}
          className="flex items-center justify-between p-3 bg-card-foreground/5 rounded-lg hover:bg-secondary/10 transition-all text-sm text-foreground shadow-sm"
        >
          <span>{q}</span>
          <Copy className="w-4 h-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-muted-foreground">
      <List className="w-8 h-8" />
      <p className="text-sm">No questions available.</p>
      <p className="text-xs">Ask the AI or upload a PDF to generate questions.</p>
    </div>
  )}
</TabsContent>

  </Tabs>
</section>

  );
}
