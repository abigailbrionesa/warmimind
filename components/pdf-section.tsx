
"use client";

import { useState } from "react";
import pdfToText from "react-pdftotext";
import PDFViewer from "./PDFViewer";
type PdfSectionProps = {
  onProcessed: (
    data: { summaryQu: string; questionsQu: string[]; sessionId: string },
    fileUrl: string
  ) => void;
};

export default function PdfSection({ onProcessed }: PdfSectionProps) {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    const fileUrl = URL.createObjectURL(file);

    setPdfFile(URL.createObjectURL(file));

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

      onProcessed(
        {
          summaryQu: data.summaryQu,
          questionsQu: data.questionsQu,
          sessionId: data.sessionId,
        },
        fileUrl
      );
    } catch (err) {
      console.error("PDF processing failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="p-6 flex flex-col gap-4 border rounded-lg bg-card text-card-foreground shadow-md">
      <h2 className="font-semibold text-lg text-center">
        WarmiMind
      </h2>

      {!pdfFile && (
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors bg-background"
        >
          <span className="block text-muted-foreground">
            PDF ruwachiy (drag & drop kachay / click kachay)
          </span>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleUpload(e.target.files[0]);
            }}
          />
        </label>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] text-sm">
          <span className="animate-pulse">Yachachkan…</span>
          <svg className="w-4 h-4 animate-spin text-[var(--color-primary)]" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
            />
          </svg>
        </div>
      )}


    </section>


  );
}
