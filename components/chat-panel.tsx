"use client";

import { useEffect, useRef, useState } from "react";
import { BotIcon, Copy, FileText, Flower, List, Send, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createBackendApiUrl, readBackendJson } from "@/lib/backend-api";
import type { ProcessedLearningSession } from "@/components/pdf-section";

type Citation = {
  chunk_id: string;
  page: number | null;
  snippet: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
};

type ChatResponse = {
  message: {
    message_id: string;
    role: "assistant";
    content: string;
    citations: Citation[];
  };
};

type MisconceptionCheck = {
  check_id: string;
  question: string;
  student_answer: string;
  correct: string[];
  missing: string[];
  review_next: string;
  citations: Citation[];
};

type MisconceptionResponse = {
  check: MisconceptionCheck;
};

type ChatPanelProps = {
  learningSession: ProcessedLearningSession;
};

export default function ChatPanel({ learningSession }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(
    learningSession.questions[0]?.text ?? ""
  );
  const [studentAnswer, setStudentAnswer] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [misconceptionCheck, setMisconceptionCheck] = useState<MisconceptionCheck | null>(null);
  const [nextRecommendedAction, setNextRecommendedAction] = useState(
    learningSession.nextRecommendedAction
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const message = input.trim();
    if (!message || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      citations: [],
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await readBackendJson<ChatResponse>(
        await fetch(
          createBackendApiUrl(`/api/v1/learning-sessions/${learningSession.sessionId}/chat`),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          }
        )
      );

      setMessages((current) => [
        ...current,
        {
          id: response.message.message_id,
          role: "assistant",
          content: response.message.content,
          citations: response.message.citations,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  async function handleMisconceptionCheck() {
    const question = selectedQuestion.trim();
    const answer = studentAnswer.trim();
    if (!question || !answer || checkLoading) return;

    setCheckLoading(true);
    setCheckError(null);

    try {
      const response = await readBackendJson<MisconceptionResponse>(
        await fetch(
          createBackendApiUrl(
            `/api/v1/learning-sessions/${learningSession.sessionId}/misconception-checks`
          ),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, student_answer: answer }),
          }
        )
      );

      setMisconceptionCheck(response.check);
      setNextRecommendedAction(response.check.review_next);
    } catch (err) {
      setCheckError(
        err instanceof Error ? err.message : "Misconception check failed. Please try again."
      );
    } finally {
      setCheckLoading(false);
    }
  }

  return (
    <section className="flex h-full w-full flex-col border bg-card p-4 shadow-sm">
      <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mb-2 border bg-card p-1 shadow-sm">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <BotIcon className="h-4 w-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Summary
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <List className="h-4 w-4" /> Questions
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Flower className="h-4 w-4" /> Practice
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="h-4 w-4" /> Next
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
            {messages.length === 0 && (
              <div className="border bg-background p-4 text-sm text-muted-foreground">
                Ask about a concept in {learningSession.fileName}. If the source does not
                support the answer, WarmiMIND will say so instead of guessing.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" ? (
                  <BotIcon className="mt-1 h-5 w-5 text-primary" />
                ) : (
                  <Flower className="mt-1 h-5 w-5 text-secondary-foreground" />
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 text-sm shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.citations.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-current/20 pt-2 text-xs">
                      {message.citations.map((citation) => (
                        <p key={citation.chunk_id}>
                          Page {citation.page ?? "?"}: {citation.snippet}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BotIcon className="h-5 w-5 animate-pulse text-primary" />
                Checking source evidence...
              </div>
            )}

            {error && (
              <div className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="mt-2 flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a source-grounded question..."
              className="flex-1"
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleSend();
              }}
            />
            <Button onClick={() => void handleSend()} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Source-grounded summary</h3>
            <div className="bg-card-foreground/5 p-4 text-sm leading-6 whitespace-pre-wrap">
              {learningSession.summary || "No summary was generated."}
            </div>
            {learningSession.summaryCitations.length > 0 && (
              <div className="space-y-2 text-xs text-muted-foreground">
                {learningSession.summaryCitations.map((citation) => (
                  <p key={citation.chunk_id}>
                    Page {citation.page ?? "?"}: {citation.snippet}
                  </p>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="questions" className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Guided questions</h3>
            {learningSession.questions.map((question) => (
              <button
                key={question.text}
                type="button"
                onClick={() => {
                  setSelectedQuestion(question.text);
                  copyToClipboard(question.text);
                }}
                className="border bg-card-foreground/5 p-3 text-left text-sm transition-colors hover:bg-secondary/10"
              >
                <span className="mb-2 inline-block text-xs uppercase text-muted-foreground">
                  {question.difficulty}
                </span>
                <span className="block">{question.text}</span>
                <Copy className="mt-2 h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practice" className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Misconception check</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a guided question, write your answer, and compare it with cited source evidence.
              </p>
            </div>

            <div className="grid gap-3">
              {learningSession.questions.map((question) => {
                const selected = selectedQuestion === question.text;
                return (
                  <button
                    key={question.text}
                    type="button"
                    onClick={() => setSelectedQuestion(question.text)}
                    className={`border p-3 text-left text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "bg-card-foreground/5 hover:bg-secondary/10"
                    }`}
                  >
                    <span className="mb-2 inline-block text-xs uppercase text-muted-foreground">
                      {question.difficulty}
                    </span>
                    <span className="block">{question.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label htmlFor="misconception-answer" className="text-sm font-medium">
                Your answer
              </label>
              <Textarea
                id="misconception-answer"
                value={studentAnswer}
                onChange={(event) => setStudentAnswer(event.target.value)}
                placeholder="Explain your answer using the source..."
                className="min-h-28 text-sm md:text-sm"
              />
            </div>

            {checkError && (
              <div className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {checkError}
              </div>
            )}

            <Button
              onClick={() => void handleMisconceptionCheck()}
              disabled={checkLoading || !selectedQuestion.trim() || !studentAnswer.trim()}
            >
              <Target className="h-4 w-4" />
              {checkLoading ? "Checking..." : "Check answer"}
            </Button>

            {misconceptionCheck && (
              <section className="space-y-4 border bg-background p-4 text-sm">
                <div>
                  <h4 className="font-semibold">What looks supported</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                    {misconceptionCheck.correct.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">What to strengthen</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                    {misconceptionCheck.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Review next</h4>
                  <p className="mt-2 text-muted-foreground">
                    {misconceptionCheck.review_next}
                  </p>
                </div>

                {misconceptionCheck.citations.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Source evidence</h4>
                    <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                      {misconceptionCheck.citations.map((citation) => (
                        <p key={citation.chunk_id}>
                          Page {citation.page ?? "?"}: {citation.snippet}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Next recommended action</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {nextRecommendedAction}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Concepts</h3>
              <div className="mt-3 grid gap-3">
                {learningSession.concepts.map((concept) => (
                  <article key={concept.name} className="border p-3 text-sm">
                    <h4 className="font-medium">{concept.name}</h4>
                    <p className="mt-1 text-muted-foreground">{concept.explanation}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
