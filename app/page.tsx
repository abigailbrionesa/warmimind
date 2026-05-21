import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Target } from "lucide-react";

const signals = [
  {
    icon: ShieldCheck,
    title: "Safe PDF intake",
    body: "Uploads route through the v2 API boundary with file validation and size limits.",
  },
  {
    icon: FileText,
    title: "Source-grounded outputs",
    body: "Summaries, questions, and tutor replies stay tied to document chunks and citations.",
  },
  {
    icon: Target,
    title: "Clear next step",
    body: "The workspace points learners toward concepts, checks, and the next useful action.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-6 py-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            WarmiMIND v2
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Source-grounded STEM study from one PDF.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Upload a STEM document, inspect source-backed learning outputs, and ask
            questions that cite the PDF or refuse when evidence is weak.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <article key={signal.title} className="border bg-card p-5 shadow-sm">
                <Icon className="mb-4 h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{signal.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.body}</p>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href="/landing"
          >
            Open v2 demo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link className="border px-4 py-2 text-sm font-medium" href="/workspace">
            Review workspace map
          </Link>
          <Link className="border px-4 py-2 text-sm font-medium" href="/about">
            Read limitations
          </Link>
        </div>
      </section>
    </main>
  );
}
