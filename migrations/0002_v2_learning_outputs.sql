create table if not exists concepts (
  id uuid primary key,
  session_id uuid not null references learning_sessions(id) on delete cascade,
  name text not null,
  explanation text not null,
  confidence numeric not null default 0.5,
  citations jsonb not null default '[]'::jsonb
);

create table if not exists guided_questions (
  id uuid primary key,
  session_id uuid not null references learning_sessions(id) on delete cascade,
  text text not null,
  difficulty text not null,
  related_concept text not null,
  evidence jsonb not null default '[]'::jsonb,
  attempted_answer text
);

create table if not exists chat_messages (
  id uuid primary key,
  session_id uuid not null references learning_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists misconception_checks (
  id uuid primary key,
  session_id uuid not null references learning_sessions(id) on delete cascade,
  question text not null,
  student_answer text not null,
  correct jsonb not null default '[]'::jsonb,
  missing jsonb not null default '[]'::jsonb,
  review_next text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references learning_sessions(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
