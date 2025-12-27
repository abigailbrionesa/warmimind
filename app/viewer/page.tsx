'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import pdfToText from 'react-pdftotext';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import ReactMarkdown from 'react-markdown';

const PDFViewer = dynamic(
  async () => {
    const { Document, Page, pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    return function Viewer({ file }: { file: string }) {
      const [numPages, setNumPages] = useState(0);

      return (
        <Document
          file={file}
          onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
        >
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
  const [fullText, setFullText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setFileURL(URL.createObjectURL(uploadedFile));
    setSummary('Extracting text from PDF...');
    setIsProcessing(true);

    try {
      const text = await pdfToText(uploadedFile);
      setFullText(text);

      setSummary('Generating AI summary...');
      const geminiRes = await fetch('/api/gemini-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const geminiData = await geminiRes.json();
      if (geminiRes.ok) {
        setSummary(geminiData.summary);
      } else {
        setSummary(`Extracted ${text.split(/\s+/).length} words. (AI summary unavailable: ${geminiData.error})`);
      }
    } catch (err: any) {
      console.error('PDF extraction error:', err);
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
    <div className="flex gap-4 p-4 h-screen bg-gray-50">
      <div className="flex-1 overflow-auto border rounded-lg p-4 bg-white shadow">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {fileURL ? <PDFViewer file={fileURL} /> : (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Upload a PDF to view
          </div>
        )}
      </div>
      <div className="w-96 border rounded-lg p-4 overflow-auto bg-white shadow">
        <h2 className="font-bold text-lg mb-3">AI Summary</h2>
        {isProcessing && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p>Processing PDF...</p>
          </div>
        )}
        {!isProcessing && summary && (
          <div>
            <div className="prose max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>            {fullText && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View Full Text ({fullText.split(/\s+/).length} words)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs max-h-96 overflow-auto">
                  <pre className="whitespace-pre-wrap font-mono">{fullText}</pre>
                </div>

              </details>
            )}
          </div>
        )}
        {!isProcessing && !summary && (
          <p className="text-gray-400">Upload a PDF to see the AI-generated summary...</p>
        )}
      </div>
    </div>
  );
}
