'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFViewer = dynamic(
  async () => {
    const { Document, Page, pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    return function Viewer({ file, onLoadSuccess }: any) {
      const [numPages, setNumPages] = useState(0);

      const handleLoadSuccess = (pdf: any) => {
        setNumPages(pdf.numPages);
        onLoadSuccess?.(pdf);
      };

      return (
        <Document file={file} onLoadSuccess={handleLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      );
    };
  },
  { ssr: false }
);

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const fileURL = searchParams.get('file'); 

  if (!fileURL) return <p>No file provided.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <PDFViewer file={fileURL} />
    </div>
  );
}
