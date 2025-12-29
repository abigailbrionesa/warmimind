"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  async () => {
    const { Document, Page, pdfjs } = await import("react-pdf");

    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    return function Viewer({ file }: { file: string }) {
      const [numPages, setNumPages] = useState(0);
      const containerRef = useRef<HTMLDivElement>(null);
      const [pageWidth, setPageWidth] = useState(0);

      useEffect(() => {
        function updateWidth() {
          if (containerRef.current) {
            const containerHeight = containerRef.current.offsetHeight;
            const containerWidth = containerRef.current.offsetWidth;

            setPageWidth(containerWidth); // Keep full width, let height scroll
          }
        }
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
      }, []);

      return (
        <div ref={containerRef} className="flex-1 h-full overflow-auto relative">
  <Document file={file} onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}>
    {Array.from({ length: numPages }, (_, i) => (
      <Page
        key={i + 1}
        pageNumber={i + 1}
        width={containerRef.current?.offsetWidth}
      />
    ))}
  </Document>
</div>
      );
    };
  },
  { ssr: false }
);

export default PDFViewer;
