const metrics = [
  ["Retrieval hit rate", "100%", "Expected chunks found for seeded source questions"],
  ["Citation coverage", "100%", "Grounded answers include source references"],
  ["Refusal pass rate", "100%", "Unsupported questions trigger refusal behavior"],
  ["Guided question quality", "Pass", "Questions include difficulty and evidence"],
  ["Latency", "0 ms", "Placeholder deterministic runner"],
];

const cases = [
  {
    id: "sample-unsupported-question",
    status: "pass",
    notes: "Unsupported questions are expected to refuse when no source evidence is retrieved.",
  },
];

export default function EvalsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Learning Quality
          </p>
          <h1 className="text-4xl font-semibold">Evaluation Dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {metrics.map(([label, value, detail]) => (
            <article key={label} className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
            </article>
          ))}
        </div>

        <section className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Per-question Results</h2>
          </div>
          <div className="divide-y">
            {cases.map((item) => (
              <div key={item.id} className="grid gap-2 p-4 md:grid-cols-[1fr_120px_2fr]">
                <span className="font-mono text-sm">{item.id}</span>
                <span className="text-sm font-medium text-green-700">{item.status}</span>
                <span className="text-sm text-muted-foreground">{item.notes}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
