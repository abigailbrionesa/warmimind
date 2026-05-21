export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            About WarmiMIND
          </p>
          <h1 className="text-4xl font-semibold">Methodology and limitations</h1>
        </div>

        <p className="leading-7 text-muted-foreground">
          WarmiMIND v2 is a source-grounded learning workspace. The system is designed
          to retrieve evidence from an uploaded PDF before generating summaries,
          concepts, guided questions, tutor answers, and misconception feedback.
        </p>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Current limitations</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Quechua support is experimental and requires human review before public claims.</li>
            <li>The current deterministic backend skeleton is not a production AI provider integration.</li>
            <li>Uploaded PDF storage, retention, and access controls must be configured before real use.</li>
            <li>Evaluation metrics start with a small seeded runner and should grow with real documents.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
