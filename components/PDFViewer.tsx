"use client";

export default function PDFViewer({ file }: { file: string }) {
  return (
    <iframe
      src={file}
      title="Uploaded PDF preview"
      className="h-full w-full bg-background"
    />
  );
}
