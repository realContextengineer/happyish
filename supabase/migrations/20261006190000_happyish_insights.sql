begin;
create table if not exists public.happyish_insights_posts (
 id uuid primary key default gen_random_uuid(),slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null,excerpt text not null,body_markdown text not null,category_slug text not null,
 status text not null default 'draft' check(status in ('draft','published')),
 published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 author_name text not null default 'Karl Croft',seo_title text,meta_description text,
 cover_image_path text,cover_image_alt text,sources jsonb not null default '[]'::jsonb check(jsonb_typeof(sources)='array'),
 ai_disclosure text,ai_image_disclosure text,tile_colour text default 'yellow' check(tile_colour in ('yellow','coral','teal','ink')),
 check(status <> 'published' or published_at is not null)
);
alter table public.happyish_insights_posts enable row level security;
revoke all on public.happyish_insights_posts from anon,authenticated;
grant select on public.happyish_insights_posts to anon,authenticated;
grant all on public.happyish_insights_posts to service_role;
create policy "Read published Happyish Insights" on public.happyish_insights_posts for select to anon,authenticated using(status='published' and published_at<=now());
create index if not exists happyish_insights_public_date on public.happyish_insights_posts(published_at desc) where status='published';
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('happyish-insights-covers','happyish-insights-covers',true,10485760,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
commit;
