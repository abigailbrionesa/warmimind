import Link from "next/link";
import { BookOpen, FileText, MessageSquareText, Target, Upload } from "lucide-react";

const panels = [
  {
    title: "Upload / Start Session",
    icon: Upload,
    body: "Upload one STEM PDF, validate the file, create a document record, and start a learning session.",
  },
  {
    title: "Source-Grounded Summary",
    icon: FileText,
    body: "Generate a concise summary with citations back to page-aware chunks.",
  },
  {
    title: "Concepts + Guided Questions",
    icon: BookOpen,
    body: "Extract key concepts, explain them simply, and practice with evidence-linked questions.",
  },
  {
    title: "Tutor Chat + Misconception Check",
    icon: MessageSquareText,
    body: "Ask PDF-grounded questions, receive cited answers, and check understanding against source evidence.",
  },
  {
    title: "Progress + Next Action",
    icon: Target,
    body: "Track weak concepts, answered questions, misconception feedback, and the next recommended action without fake grades.",
  },
];

export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            WarmiMIND v2
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold">
            Source-grounded STEM learning workspace
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            This v2 workspace maps the end-to-end learning session: PDF ingestion,
            chunk retrieval, cited learning outputs, misconception checks, and a clear
            next action for the student.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <article key={panel.title} className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{panel.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{panel.body}</p>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link className="rounded-md bg-primary px-4 py-2 text-primary-foreground" href="/landing">
            Open current demo
          </Link>
          <Link className="rounded-md border px-4 py-2" href="/evals">
            View eval dashboard
          </Link>
          <Link className="rounded-md border px-4 py-2" href="/about">
            Read limitations
          </Link>
        </div>
      </section>
    </main>
  );
}
