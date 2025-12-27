'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFViewer = dynamic(
  async () => {
    const { Document, Page, pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    return function Viewer({ file }: { file: string }) {
      const [numPages, setNumPages] = useState(0);

      const handleLoadSuccess = (pdf: any) => setNumPages(pdf.numPages);

      return (
        <Document file={file} onLoadSuccess={handleLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const url = URL.createObjectURL(uploadedFile);
    setFile(uploadedFile);
    setFileURL(url);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    const res = await fetch('/api/process-pdf', { method: 'POST', body: formData });
    const data = await res.json();
    setSummary('hola');
  };

  useEffect(() => {
    return () => {
      if (fileURL) URL.revokeObjectURL(fileURL);
    };
  }, [fileURL]);

  return (
    <div className="flex gap-4 p-4 h-screen">
      <div className="flex-1 overflow-auto border rounded-lg p-2">
        <input type="file" accept="application/pdf" onChange={handleUpload} className="mb-4" />
        {fileURL && <PDFViewer file={fileURL} />}
      </div>

      <div className="w-96 border rounded-lg p-4 overflow-auto">
        <h2 className="font-bold mb-2">Summary</h2>
        <p>{summary || 'Waiting for PDF upload...'}</p>
      </div>
    </div>
  );
}
