"use client";

import SummaryPanel from "./summary-panel";
import QuestionsPanel from "./questions-panel";
import ChatPanel from "./chat-panel";

type LearningSectionProps = {
  summaryQu: string | null;
  questionsQu: string[];
  sessionId: string | null;
};

export default function LearningSection({
  summaryQu,
  questionsQu,
  sessionId,
}: LearningSectionProps) {
  if (!summaryQu || !sessionId) {
    return (
      <section className="flex flex-col justify-center items-center text-center p-6 border rounded-lg">
        <p className="text-gray-600">
          📄 Huk PDF churayqa chaymanta yachayta qallariy
        </p>
        <p className="text-sm text-gray-400 mt-2">
          (Upload a PDF to start learning)
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <SummaryPanel summary={summaryQu} />
      <QuestionsPanel questions={questionsQu} />
      <ChatPanel
        sessionId={sessionId}
        summaryQu={summaryQu}
        questionsQu={questionsQu}
      />
    </section>
  );
}
