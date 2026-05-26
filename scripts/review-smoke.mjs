import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const root = cwd();

const requiredFiles = [
  "README.md",
  ".github/PRDs/project-audit-upgrade-prd.md",
  "docs/project-audit.md",
  "docs/architecture.md",
  "docs/methodology.md",
  "docs/limitations.md",
  "docs/deployment.md",
  "docs/demo-script.md",
  "docs/screenshots/workspace.png",
  "docs/screenshots/evals.png",
  "docs/screenshots/about.png",
  "api/README.md",
  "web/README.md",
  "evals/sample_stem_eval.json",
  "migrations/0001_v2_learning_core.sql",
  "migrations/0004_v2_access_control_posture.sql",
  "migrations/0006_document_storage_path.sql",
  "app/page.tsx",
  "app/landing/page.tsx",
  "app/workspace/page.tsx",
  "app/evals/page.tsx",
  "app/about/page.tsx",
  "components/pdf-section.tsx",
  "components/chat-panel.tsx",
  "components/PDFViewer.tsx",
  "api/app/services.py",
  "api/app/repositories.py",
  "api/app/api/v1/learning.py",
  "api/tests/test_services.py",
  "api/tests/test_repositories.py",
  "api/tests/test_visible_flow_contracts.py",
];

const requiredReferences = [
  {
    file: "components/pdf-section.tsx",
    patterns: [
      'createBackendApiUrl("/api/v1/documents")',
      "/api/v1/learning-sessions",
      "chunks: documentPayload.chunks",
    ],
  },
  {
    file: "components/chat-panel.tsx",
    patterns: [
      "Extracted source chunks",
      "/api/v1/learning-sessions/${learningSession.sessionId}/chat",
      "/api/v1/learning-sessions/${learningSession.sessionId}/misconception-checks",
      "WarmiMIND will say so instead of guessing",
    ],
  },
  {
    file: "app/evals/page.tsx",
    patterns: [
      'createBackendApiUrl("/api/v1/evals/runs")',
      "Run eval",
      "retrieval_hit_rate",
      "refusal_pass_rate",
    ],
  },
  {
    file: "api/app/services.py",
    patterns: [
      "MAX_FILE_BYTES = 12 * 1024 * 1024",
      "PDF signed URL issuance is disabled.",
      "could not find enough support",
      "MIN_RETRIEVAL_SCORE",
    ],
  },
  {
    file: "api/app/repositories.py",
    patterns: [
      "class InMemoryLearningRepository",
      "class SupabaseLearningRepository",
      "create_document_signed_url",
      "raw_pdf_bytes",
    ],
  },
  {
    file: "docs/deployment.md",
    patterns: [
      "not ready for public production uploads",
      "ENABLE_PDF_SIGNED_URLS=false",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
  },
  {
    file: "README.md",
    patterns: [
      "How to Review This Repo",
      "actions/workflows/ci.yml/badge.svg",
      "GitHub Actions CI workflow runs the same credential-free validation path",
      "docs/project-audit.md",
      ".github/PRDs/project-audit-upgrade-prd.md",
      "pnpm review:smoke",
      "FastAPI v2 Endpoints",
      "GET /api/v1/documents/{document_id}/signed-url",
      "pnpm build",
    ],
  },
];

const failures = [];

for (const relativePath of requiredFiles) {
  if (!existsSync(join(root, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

for (const check of requiredReferences) {
  const absolutePath = join(root, check.file);
  if (!existsSync(absolutePath)) {
    failures.push(`Missing file for reference check: ${check.file}`);
    continue;
  }

  const content = readFileSync(absolutePath, "utf8");
  for (const pattern of check.patterns) {
    if (!content.includes(pattern)) {
      failures.push(`Missing reference in ${check.file}: ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Static review smoke check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  exit(1);
}

console.log("Static review smoke check passed.");
