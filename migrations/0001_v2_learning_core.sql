create extension if not exists vector;

create table if not exists documents (
  id uuid primary key,
  title text not null,
  file_name text not null,
  content_type text not null,
  size_bytes integer not null,
  detected_language text not null default 'unknown',
  status text not null default 'processed',
  created_at timestamptz not null default now()
);

create table if not exists document_chunks (
  id text primary key,
  document_id uuid not null references documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  page integer,
  char_count integer not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists document_chunks_document_idx on document_chunks(document_id);
create index if not exists document_chunks_embedding_idx on document_chunks using ivfflat (embedding vector_cosine_ops);

create table if not exists learning_sessions (
  id uuid primary key,
  document_id uuid not null references documents(id) on delete cascade,
  status text not null default 'created',
  summary text,
  summary_citations jsonb not null default '[]'::jsonb,
  weak_concepts jsonb not null default '[]'::jsonb,
  next_recommended_action text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
