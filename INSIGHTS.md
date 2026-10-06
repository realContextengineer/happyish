# Happyish Insights

Happyish owns a separate `happyish_insights_posts` table and `happyish-insights-covers` Storage bucket in the existing Supabase project. AiGENCY tables and functions are unchanged. Old articles are not imported automatically.

## Preview

Run `npm run dev` from this folder, then open http://127.0.0.1:8800/insights.html. The Node preview and Netlify use the same server-rendered article handler. `npm test` checks escaping, readable article HTML, metadata, public-feed filters and error responses.

## Publishing from Hermes

Run `python3 scripts/publish_happyish_insight.py /absolute/path/article.json --check` to validate without publishing. Remove `--check` to upload and publish. Pass `HAPPYISH_PUBLISH_TOKEN` in the environment, or use this checkout's ignored private token file. Never put the private token in Git, browser code or prompts.

Required JSON fields: `slug`, `title`, `excerpt`, `body_markdown`, `category_slug`, `cover_image_file` (a real image file), `cover_image_alt`, `sources` (HTTPS source objects with `url` and `title`), and `tile_colour` (`yellow`, `coral`, `teal`, `ink`). Optional: `author_name`, `seo_title`, `meta_description`, `ai_disclosure`, `ai_image_disclosure`, `published_at`. The endpoint accepts 50–10,000 words and publishes immediately; run scheduled work at the intended publication time. Publishing the same slug updates its article.

Categories: `ai-digital-life`, `neurodiversity`, `getting-unstuck`, `work-skills`, `digital-inclusion`, `recovery-wellbeing`, `community`, `technology`.

## Hosting

Netlify builds a public-only `dist` directory. Private files, publishing scripts and server source are excluded. Its function serves `/api/insights`, `/insights/:slug/`, `/insights/archive/` and `/insights-sitemap.xml`. Set `HAPPYISH_SITE_URL` to the production HTTPS origin in both Netlify and Supabase when the domain is ready. Netlify's `URL` is used as the article canonical origin until then. Configure the publishing token hash as a Supabase secret. The publishable key can be public; RLS limits its article access to published, nonfuture rows. Private publishing writes use only the protected server functions.

Image generation is separate from publishing. No image-provider integration is configured yet. The helper accepts an image produced by any provider.
