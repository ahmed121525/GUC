-- Optional production metadata schema for the GUC archive.
create table if not exists public.archive_images (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  month integer not null check (month between 1 and 12),
  event_name text not null,
  storage_path text not null,
  public_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- Create the Storage bucket named: guc-archive
-- Storage RLS policies should be configured separately. Before launch, restrict
-- INSERT/UPDATE/DELETE to authenticated admin users and allow public SELECT only
-- if your archive is intended to be public.
