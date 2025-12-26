"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function IntroSection() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    router.push(`/viewer?file=${encodeURIComponent(fileURL)}`);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl p-6 max-h-96 flex flex-col">
        <CardHeader className="mb-4">
          <CardTitle className="text-2xl text-center">Warmimind</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex gap-4 overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 overflow-auto">
            <p className="mb-2">Suelte un archivo o suba</p>
            <Input
              type="file"
              accept="application/pdf"
              className="w-full mb-2"
              onChange={handleUpload}
            />
          </div>
          <div className="flex-1 flex flex-col border border-gray-300 rounded-lg p-2 overflow-auto">
            <p className="mb-2">O pegue aquí (Ctrl+V)</p>
            <Textarea
              placeholder="Pegue su texto aquí..."
              className="flex-1 resize-none mb-2"
            />
            <Button className="self-end mt-auto">Procesar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
