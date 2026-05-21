-- Production Supabase deployments must not expose uploaded learning data publicly.
-- These starter RLS switches make tables service-role-only until authenticated
-- ownership columns and user-facing policies are added in a later persistence pass.

alter table if exists documents enable row level security;
alter table if exists document_chunks enable row level security;
alter table if exists learning_sessions enable row level security;
alter table if exists concepts enable row level security;
alter table if exists guided_questions enable row level security;
alter table if exists chat_messages enable row level security;
alter table if exists misconception_checks enable row level security;
alter table if exists session_events enable row level security;
alter table if exists eval_questions enable row level security;
alter table if exists eval_runs enable row level security;
alter table if exists eval_results enable row level security;

comment on table documents is 'RLS enabled. Add authenticated ownership policies before accepting production student uploads.';
comment on table document_chunks is 'RLS enabled. Access should remain server-side until document ownership policies exist.';
comment on table learning_sessions is 'RLS enabled. Access should remain server-side until session ownership policies exist.';
