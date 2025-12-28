"use client";

import { useState } from "react";
import PdfSection from "@/components/pdf-section";
import ChatPanel from "@/components/chat-panel";

export default function Landing() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summaryQu, setSummaryQu] = useState<string | null>(null);
  const [questionsQu, setQuestionsQu] = useState<string[]>([]);

  return (
    <main className="grid grid-cols-2 gap-6 p-6">
      <PdfSection
        onProcessed={(data) => {
          console.log("PDF Processed:", data);
          setSessionId(data.sessionId);
          setSummaryQu(data.summaryQu);
          setQuestionsQu(data.questionsQu);
        }}
      />

      {sessionId && (
        <ChatPanel
          sessionId={sessionId}
          summaryQu={summaryQu}
          questionsQu={questionsQu}
        />
      )}
    </main>
  );
}
