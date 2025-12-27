'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import pdfToText from 'react-pdftotext';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import ReactMarkdown from 'react-markdown';

export const PDFViewer = dynamic(
  async () => {
    const { Document, Page, pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    return function Viewer({ file }: { file: string }) {
      const [numPages, setNumPages] = useState(0);

      return (
        <Document file={file} onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}>
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i + 1}
              pageNumber={i + 1}
              width={600}
              renderTextLayer
              renderAnnotationLayer
            />
          ))}
        </Document>
      );
    };
  },
  { ssr: false }
);

export default function ViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryQuechua, setSummaryQuechua] = useState<string | null>(null);
  const [fullText, setFullText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setFileURL(URL.createObjectURL(uploadedFile));
    setSummary('Extracting text from PDF...');
    setSummaryQuechua(null);
    setIsProcessing(true);

    try {
      const text = await pdfToText(uploadedFile);
      setFullText(text);

      setSummary('Generating AI summary...');
      const res = await fetch('/api/gemini-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSummary(data.summary);
      setSummaryQuechua(data.summaryQuechua);
    } catch (err: any) {
      setSummary(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (fileURL) URL.revokeObjectURL(fileURL);
    };
  }, [fileURL]);

  return (
    <div className="flex h-screen gap-4 p-4 bg-background text-foreground">
      {/* PDF PANEL */}
      <div className="flex-1 overflow-auto rounded-lg border bg-card p-4 shadow-sm">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          className="mb-4 block w-full cursor-pointer text-sm text-muted-foreground
            file:mr-4 file:rounded file:border-0 file:bg-secondary
            file:px-4 file:py-2 file:text-sm file:font-medium
            file:text-secondary-foreground hover:file:bg-accent"
        />

        {fileURL ? (
          <PDFViewer file={fileURL} />
        ) : (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Upload a PDF to view
          </div>
        )}
      </div>

      {/* SUMMARY PANEL */}
      <div className="w-96 overflow-auto rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">AI Summary</h2>

        {isProcessing && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p>Processing PDF...</p>
          </div>
        )}

        {!isProcessing && summary && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-primary">English Summary</h3>
              <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>

            {summaryQuechua && (
              <div>
                <h3 className="font-medium text-primary">Quechua Summary</h3>
                <div className="prose max-w-none dark:prose-invert">
                  <ReactMarkdown>{summaryQuechua}</ReactMarkdown>
                </div>
              </div>
            )}

            {fullText && (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                  View Full Text ({fullText.split(/\s+/).length} words)
                </summary>
                <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-3 text-xs font-mono">
                  {fullText}
                </pre>
              </details>
            )}
          </div>
        )}

        {!isProcessing && !summary && (
          <p className="text-muted-foreground">
            Upload a PDF to see the AI-generated summary.
          </p>
        )}
      </div>
    </div>
  );
}
