"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Play, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createBackendApiUrl, readBackendJson } from "@/lib/backend-api";

type EvalResult = {
  case_id: string;
  status: "pass" | "fail";
  notes: string;
  question?: string;
  expected_chunk_ids?: string[];
  retrieved_chunk_ids?: string[];
  citation_chunk_ids?: string[];
};

type EvalRun = {
  run_id: string;
  eval_name?: string;
  retrieval_hit_rate: number;
  citation_coverage: number;
  refusal_pass_rate: number;
  guided_question_quality: string;
  latency_ms: number;
  results: EvalResult[];
};

type EvalRunsResponse = {
  runs: EvalRun[];
};

const metricDetails = {
  retrieval_hit_rate: "Expected chunks found for seeded source questions",
  citation_coverage: "Grounded answers include expected source references",
  refusal_pass_rate: "Unsupported questions trigger refusal behavior",
  guided_question_quality: "Generated questions include difficulty and evidence",
  latency_ms: "Measured runtime for the seeded eval run",
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function EvalsPage() {
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestRun = runs[0] ?? null;
  const metrics = useMemo(
    () =>
      latestRun
        ? [
            ["Retrieval hit rate", formatPercent(latestRun.retrieval_hit_rate), metricDetails.retrieval_hit_rate],
            ["Citation coverage", formatPercent(latestRun.citation_coverage), metricDetails.citation_coverage],
            ["Refusal pass rate", formatPercent(latestRun.refusal_pass_rate), metricDetails.refusal_pass_rate],
            ["Guided question quality", latestRun.guided_question_quality, metricDetails.guided_question_quality],
            ["Latency", `${latestRun.latency_ms} ms`, metricDetails.latency_ms],
          ]
        : [],
    [latestRun]
  );

  async function loadRuns() {
    setLoading(true);
    setError(null);
    try {
      const response = await readBackendJson<EvalRunsResponse>(
        await fetch(createBackendApiUrl("/api/v1/evals/runs"), { cache: "no-store" })
      );
      setRuns(response.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load eval runs.");
    } finally {
      setLoading(false);
    }
  }

  async function runEval() {
    setRunning(true);
    setError(null);
    try {
      const run = await readBackendJson<EvalRun>(
        await fetch(createBackendApiUrl("/api/v1/evals/runs"), { method: "POST" })
      );
      setRuns((current) => [run, ...current.filter((item) => item.run_id !== run.run_id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run eval.");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    void loadRuns();
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Learning Quality
            </p>
            <h1 className="text-4xl font-semibold">Evaluation Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadRuns()} disabled={loading || running}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => void runEval()} disabled={running}>
              <Play className="h-4 w-4" />
              {running ? "Running" : "Run eval"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && !latestRun && (
          <div className="flex items-center gap-2 border bg-card p-4 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse text-primary" />
            Loading eval runs from the v2 API...
          </div>
        )}

        {!loading && !latestRun && (
          <div className="border bg-card p-4 text-sm text-muted-foreground">
            No eval runs yet. Run the seeded eval to measure retrieval, citation, refusal, question quality, and latency.
          </div>
        )}

        {latestRun && (
          <>
            <div className="text-sm text-muted-foreground">
              Latest run: <span className="font-mono">{latestRun.run_id}</span>
              {latestRun.eval_name ? ` (${latestRun.eval_name})` : ""}
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
                {latestRun.results.map((item) => (
                  <div key={item.case_id} className="grid gap-2 p-4 md:grid-cols-[1fr_120px_2fr]">
                    <span className="font-mono text-sm">{item.case_id}</span>
                    <span
                      className={`text-sm font-medium ${
                        item.status === "pass" ? "text-green-700" : "text-destructive"
                      }`}
                    >
                      {item.status}
                    </span>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{item.notes}</p>
                      {item.question && <p>{item.question}</p>}
                      {item.retrieved_chunk_ids && (
                        <p className="font-mono text-xs">
                          retrieved: {item.retrieved_chunk_ids.join(", ") || "none"}
                        </p>
                      )}
                      {item.citation_chunk_ids && (
                        <p className="font-mono text-xs">
                          cited: {item.citation_chunk_ids.join(", ") || "none"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
