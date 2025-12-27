export function findRelevantChunks(
  question: string,
  chunks: string[],
  maxChunks: number = 4
): string[] {
  if (!chunks || chunks.length === 0) return [];

  const questionWords = question
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3);

  const scored = chunks.map(chunk => {
    const chunkText = chunk.toLowerCase();
    let score = 0;

    for (const word of questionWords) {
      if (chunkText.includes(word)) {
        score += 1;
      }
    }

    return { chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(s => s.chunk);
}
