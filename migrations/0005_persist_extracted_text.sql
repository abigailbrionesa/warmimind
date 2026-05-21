alter table documents
  add column if not exists extracted_text text not null default '';
