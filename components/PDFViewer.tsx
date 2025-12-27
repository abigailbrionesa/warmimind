import { useState } from 'react';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(
  async () => {
    const { Document, Page, pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    return function Viewer({ file }: { file: string }) {
      const [numPages, setNumPages] = useState(0);

      return (
        <Document file={file} onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}>
          {Array.from({ length: numPages }, (_, i) => (
            <Page key={i + 1} pageNumber={i + 1} width={600} renderTextLayer renderAnnotationLayer />
          ))}
        </Document>
      );
    };
  },
  { ssr: false }
);

export default PDFViewer;