
"use client";

import { useState } from "react";
import pdfToText from "react-pdftotext";

type PdfSectionProps = {
  onProcessed: (data: { summaryQu: string; questionsQu: string[]; sessionId: string }) => void;
};

export default function PdfSection({ onProcessed }: PdfSectionProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(file: File) {
    setLoading(true);

    try {
      const extractedText = await pdfToText(file);
      console.log("Extracted text:", extractedText);

      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      const data = await res.json();
      console.log("Process API response:", data);

      onProcessed({
        summaryQu: data.summaryQu,
        questionsQu: data.questionsQu,
        sessionId: data.sessionId,
      });
    } catch (err) {
      console.error("PDF processing failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border rounded-lg p-4 flex flex-col gap-4">
      <h2 className="font-semibold">📄 Yachay Qillqa (PDF)</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (e.target.files) handleUpload(e.target.files[0]);
        }}
      />
      {loading && <p className="text-sm text-gray-500">PDF yachachkan…</p>}
    </section>
  );
}
