export function findRelevantChunks(
  query: string,
  chunks: string[]
) {
  const q = query.toLowerCase().trim();

  const terms = q
    .split(/\s+/)
    .filter(w => w.length > 3);

  const phrases: string[] = [];
  for (let i = 0; i < terms.length - 1; i++) {
    phrases.push(`${terms[i]} ${terms[i + 1]}`);
    if (i < terms.length - 2) {
      phrases.push(`${terms[i]} ${terms[i + 1]} ${terms[i + 2]}`);
    }
  }

  const scored = chunks.map(chunk => {
    const text = chunk.toLowerCase();

    let score = 0;

    for (const phrase of phrases) {
      if (text.includes(phrase)) score += 5;
    }

    for (const term of terms) {
      if (text.includes(term)) {
        score += term.length > 6 ? 2 : 1;
      }
    }

    score -= Math.max(0, Math.floor(chunk.length / 1000));

    return { chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.chunk);
}
