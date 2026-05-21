"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createBackendApiUrl, readBackendJson } from "@/lib/backend-api";

type Citation = {
  chunk_id: string;
  page: number | null;
  snippet: string;
};

type DocumentResponse = {
  document: {
    document_id: string;
    file_name: string;
  };
};

type SessionResponse = {
  session_id: string;
  summary?: string | null;
  summary_citations?: Citation[];
  next_recommended_action?: string;
};

type ConceptsResponse = {
  concepts: Array<{
    name: string;
    explanation: string;
    citations: Citation[];
  }>;
};

type QuestionsResponse = {
  questions: Array<{
    text: string;
    difficulty: string;
    evidence: Citation[];
  }>;
};

export type ProcessedLearningSession = {
  documentId: string;
  fileName: string;
  sessionId: string;
  summary: string;
  summaryCitations: Citation[];
  concepts: ConceptsResponse["concepts"];
  questions: QuestionsResponse["questions"];
  nextRecommendedAction: string;
};

type PdfSectionProps = {
  onProcessed: (data: ProcessedLearningSession, fileUrl: string) => void;
};

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return readBackendJson<T>(response);
}

export default function PdfSection({ onProcessed }: PdfSectionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    setSelectedName(file.name);
    const fileUrl = URL.createObjectURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const documentPayload = await readBackendJson<DocumentResponse>(
        await fetch(createBackendApiUrl("/api/v1/documents"), {
          method: "POST",
          body: formData,
        })
      );

      const session = await postJson<SessionResponse>(
        createBackendApiUrl("/api/v1/learning-sessions"),
        { document_id: documentPayload.document.document_id }
      );
      const summary = await postJson<SessionResponse>(
        createBackendApiUrl(`/api/v1/learning-sessions/${session.session_id}/summary`)
      );
      const concepts = await postJson<ConceptsResponse>(
        createBackendApiUrl(`/api/v1/learning-sessions/${session.session_id}/concepts`)
      );
      const questions = await postJson<QuestionsResponse>(
        createBackendApiUrl(`/api/v1/learning-sessions/${session.session_id}/questions`)
      );

      onProcessed(
        {
          documentId: documentPayload.document.document_id,
          fileName: documentPayload.document.file_name,
          sessionId: session.session_id,
          summary: summary.summary ?? "",
          summaryCitations: summary.summary_citations ?? [],
          concepts: concepts.concepts,
          questions: questions.questions,
          nextRecommendedAction:
            summary.next_recommended_action ??
            "Ask a source-grounded question or try a guided question.",
        },
        fileUrl
      );
    } catch (err) {
      URL.revokeObjectURL(fileUrl);
      setSelectedName(null);
      setError(err instanceof Error ? err.message : "PDF processing failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex max-w-xl flex-col gap-4 border bg-card p-6 text-card-foreground shadow-md">
      <div className="flex justify-center bg-secondary py-5">
        <Image src="/warmimind.png" alt="WarmiMIND STEM learning" width={300} height={200} />
      </div>

      <label
        htmlFor="pdf-upload"
        className="cursor-pointer border-2 border-dashed border-border bg-background p-5 text-center transition-colors hover:border-primary/50"
      >
        <Upload className="mx-auto mb-3 h-6 w-6 text-primary" />
        <span className="block font-medium">Upload one STEM PDF</span>
        <span className="mt-1 block text-sm text-muted-foreground">
          Files are sent to the v2 API for validation, chunking, and cited learning outputs.
        </span>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={loading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>

      {selectedName && (
        <p className="text-sm text-muted-foreground">Selected: {selectedName}</p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Processing through the v2 learning API...
        </div>
      )}

      {error && (
        <div className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button disabled={loading} asChild variant="outline">
        <label htmlFor="pdf-upload">Choose PDF</label>
      </Button>
    </section>
  );
}
