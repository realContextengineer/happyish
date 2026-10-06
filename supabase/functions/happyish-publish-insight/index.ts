import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceRoleKey);
const siteUrl = Deno.env.get("HAPPYISH_SITE_URL") ?? "";
const allowedColours = new Set(["yellow", "coral", "teal", "ink"]);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

function tokenMatches(value: string) {
  const expected = Deno.env.get("HAPPYISH_PUBLISH_TOKEN_SHA256") ?? "";
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then((digest) => {
    const supplied = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0")).join("");
    if (supplied.length !== expected.length) return false;
    let mismatch = 0;
    for (let index = 0; index < expected.length; index += 1) {
      mismatch |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
    }
    return mismatch === 0;
  });
}

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 120;
}

function validHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function wordCount(markdown: string) {
  return markdown
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_`>[\](){}|~-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function cleanSources(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((source) => {
    if (!source || typeof source !== "object") return [];
    const row = source as Record<string, unknown>;
    const url = text(row.url, 2_000);
    if (!validHttpsUrl(url)) return [];
    const title = text(row.title, 300) || text(row.publisher, 200) || url;
    const publisher = text(row.publisher, 200);
    return [{ title, url, ...(publisher ? { publisher } : {}) }];
  }).slice(0, 30);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const suppliedToken = request.headers.get("x-hermes-publish-token") ?? "";
  if (!suppliedToken || !(await tokenMatches(suppliedToken))) {
    return json({ error: "The private publishing token is invalid." }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be JSON." }, 400);
  }

  const slug = text(payload.slug, 120);
  const title = text(payload.title, 300);
  const excerpt = text(payload.excerpt, 1_000);
  const bodyMarkdown = text(payload.body_markdown, 120_000);
  const categorySlug = text(payload.category_slug, 120);
  const coverImagePath = text(payload.cover_image_path, 2_000);
  const coverImageAlt = text(payload.cover_image_alt, 500);
  const tileColour = text(payload.tile_colour, 40).toLowerCase();
  const sources = cleanSources(payload.sources);
  const words = wordCount(bodyMarkdown);

  if (!validSlug(slug)) return json({ error: "A valid lowercase hyphenated slug is required." }, 400);
  if (!title || !excerpt || !bodyMarkdown || !categorySlug) {
    return json({ error: "Title, excerpt, article body and category are required." }, 400);
  }
  if (words < 50 || words > 10_000) {
    return json({ error: `The Insight must contain 50 to 10,000 words; received ${words}.` }, 400);
  }
  if (!validHttpsUrl(coverImagePath) || !coverImageAlt) {
    return json({ error: "A public HTTPS cover image and accessible alt text are required." }, 400);
  }
  if (!allowedColours.has(tileColour)) {
    return json({ error: "The Insight colour must be yellow, coral, teal or ink." }, 400);
  }
  if (!sources.length) return json({ error: "At least one valid HTTPS source is required." }, 400);

  const suppliedPublishedAt = text(payload.published_at, 80);
  const currentDate = new Date();
  let publishedDate = suppliedPublishedAt ? new Date(suppliedPublishedAt) : currentDate;
  if (Number.isNaN(publishedDate.getTime())) return json({ error: "published_at must be a valid date." }, 400);
  // This endpoint publishes immediately. A future publication time hides the
  // row from the public reader, so scheduled work must call this endpoint at
  // its scheduled time rather than pre-date the record into the future.
  if (publishedDate.getTime() > currentDate.getTime()) publishedDate = currentDate;

  const canonicalUrl = text(payload.canonical_url, 2_000) || `${siteUrl}/insights/${slug}/`;
  if (siteUrl && !validHttpsUrl(canonicalUrl)) return json({ error: "canonical_url must be HTTPS." }, 400);

  const record = {
    slug,
    title,
    excerpt,
    body_markdown: bodyMarkdown,
    category_slug: categorySlug,
    status: "published",
    updated_at: currentDate.toISOString(),
    published_at: publishedDate.toISOString(),
    author_name: text(payload.author_name, 200) || "HAPPY",
    seo_title: text(payload.seo_title, 300) || title,
    meta_description: text(payload.meta_description, 500) || excerpt,
    cover_image_path: coverImagePath,
    cover_image_alt: coverImageAlt,
    sources,
    ai_disclosure: text(payload.ai_disclosure, 1_000)
      || "This Insight was researched and drafted with AI assistance using Hermes, and may contain errors. See the cited sources.",
    ai_image_disclosure: text(payload.ai_image_disclosure, 200) || "AI-generated image",
    tile_colour: tileColour,
  };

  const { data, error } = await admin
    .from("happyish_insights_posts")
    .upsert(record, { onConflict: "slug" })
    .select("id,slug,title,published_at,cover_image_path,tile_colour")
    .single();

  if (error) {
    console.error("hermes-publish-insight database error", error.message);
    return json({ error: "The Insight could not be published." }, 500);
  }

  return json({
    ok: true,
    ...data,
    public_url: `${siteUrl}/insights/${encodeURIComponent(slug)}/`,
  });
});
