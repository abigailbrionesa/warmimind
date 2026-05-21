"use client";

import { useState } from "react";

import ChatPanel from "@/components/chat-panel";
import PDFViewer from "@/components/PDFViewer";
import PdfSection, { type ProcessedLearningSession } from "@/components/pdf-section";

export default function Landing() {
  const [learningSession, setLearningSession] = useState<ProcessedLearningSession | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center gap-4 bg-background p-4 text-foreground">
      {!pdfFile && !learningSession && (
        <div className="flex w-full max-w-3xl flex-col items-center gap-5 text-center">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
              WarmiMIND v2 demo
            </p>
            <h1 className="text-4xl font-semibold">Start with one source PDF.</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The visible demo now uses the v2 FastAPI backend for upload validation,
              document chunking, cited learning outputs, and unsupported-question refusal.
            </p>
          </div>
          <PdfSection
            onProcessed={(data, fileUrl) => {
              setLearningSession(data);
              setPdfFile(fileUrl);
            }}
          />
        </div>
      )}

      {pdfFile && learningSession && (
        <div className="flex h-[calc(100vh-2rem)] w-full gap-4 overflow-hidden">
          <div className="hidden h-full basis-2/5 overflow-y-auto border shadow-md lg:block">
            <PDFViewer file={pdfFile} />
          </div>

          <div className="flex h-full flex-1">
            <ChatPanel learningSession={learningSession} />
          </div>
        </div>
      )}
    </main>
  );
}
