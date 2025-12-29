"use client";

import { useState } from "react";
import PdfSection from "@/components/pdf-section";
import ChatPanel from "@/components/chat-panel";
import PDFViewer from "@/components/PDFViewer";
export default function Landing() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summaryQu, setSummaryQu] = useState<string | null>(null);
  const [questionsQu, setQuestionsQu] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  return (
    <main className="flex-col flex items-center justify-center gap-4 h-screen w-screen p-4 bg-primary">
        <PdfSection
          onProcessed={(data, fileUrl) => {
            setSessionId(data.sessionId);
            setSummaryQu(data.summaryQu);
            setQuestionsQu(data.questionsQu);
            setPdfFile(fileUrl);
          }}
        />

      

      {pdfFile && sessionId && (
        <div className="flex gap-4 bg-primary h-full  overflow-y-auto">

          {pdfFile && (
            <div className="basis-2/5 overflow-y-auto h-full border rounded-lg shadow-md">
              <PDFViewer file={pdfFile} />
            </div>
          )}

          {sessionId && (
            <div className="flex basis-3/5 h-full">
              <ChatPanel
                sessionId={sessionId}
                summaryQu={summaryQu}
                questionsQu={questionsQu}
              />
            </div>
          )}


        </div>

      )}

    </main>

  );
}
