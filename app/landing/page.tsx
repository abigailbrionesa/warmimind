"use client";

import { useState } from "react";
import PdfSection from "@/components/pdf-section";
import LearningSection from "@/components/learning-section";

export default function Landing() {
  const [summaryQu, setSummaryQu] = useState<string | null>(null);
  const [questionsQu, setQuestionsQu] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <main className="grid grid-cols-2 gap-6 p-6">
      <PdfSection
        onProcessed={(data) => {
          setSummaryQu(data.summaryQu);
          setQuestionsQu(data.questionsQu);
          setSessionId(data.sessionId);
        }}
      />

      <LearningSection
        summaryQu={summaryQu}
        questionsQu={questionsQu}
        sessionId={sessionId}
      />
    </main>
  );
}
