'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleUpload = () => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    router.push(`/viewer?file=${encodeURIComponent(fileURL)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload} disabled={!file}>
        View PDF
      </button>
    </div>
  );
}
