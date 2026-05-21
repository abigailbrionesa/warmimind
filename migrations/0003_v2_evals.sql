create table if not exists eval_questions (
  id uuid primary key,
  document_id uuid references documents(id) on delete set null,
  question text not null,
  expected_chunk_ids jsonb not null default '[]'::jsonb,
  unsupported boolean not null default false
);

create table if not exists eval_runs (
  id uuid primary key,
  retrieval_hit_rate numeric not null,
  citation_coverage numeric not null,
  refusal_pass_rate numeric not null,
  guided_question_quality text not null,
  latency_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists eval_results (
  id uuid primary key,
  eval_run_id uuid not null references eval_runs(id) on delete cascade,
  eval_question_id uuid references eval_questions(id) on delete set null,
  status text not null,
  notes text not null,
  payload jsonb not null default '{}'::jsonb
);
