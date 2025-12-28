export function findRelevantChunks(
  query: string,
  chunks: string[]
) {
  const keywords = query
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 3);

  const scored = chunks.map((chunk) => {
    const score = keywords.reduce(
      (acc, word) =>
        acc + (chunk.toLowerCase().includes(word) ? 1 : 0),
      0
    );
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.chunk);
}
