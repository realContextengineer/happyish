import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceRoleKey);
const bucket = "happyish-insights-covers";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

function cleanSlug(value: unknown) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 120;
}

function tokenMatches(value: string) {
  // Keep the same private bridge boundary as hermes-publish-insight. The raw
  // token is never stored in this function or sent to the browser.
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

function decodeBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const suppliedToken = request.headers.get("x-hermes-publish-token") ?? "";
  if (!suppliedToken || !(await tokenMatches(suppliedToken))) {
    return json({ error: "The private image-upload token is invalid." }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be JSON." }, 400);
  }

  const slug = typeof payload.slug === "string" ? payload.slug.trim() : "";
  const mimeType = typeof payload.mime_type === "string" ? payload.mime_type : "";
  const encoded = typeof payload.image_base64 === "string" ? payload.image_base64 : "";
  if (!cleanSlug(slug) || !encoded || encoded.length > 70_000_000) {
    return json({ error: "A valid slug and image are required." }, 400);
  }
  if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
    return json({ error: "Only PNG, JPEG and WebP images are accepted." }, 400);
  }

  let bytes: Uint8Array;
  try {
    bytes = decodeBase64(encoded);
  } catch {
    return json({ error: "The image data is not valid base64." }, 400);
  }
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) {
    return json({ error: "The image is empty or exceeds the 10 MB limit." }, 400);
  }

  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const path = `insights/${slug}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await admin.storage.from(bucket).upload(path, bytes, {
    contentType: mimeType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) {
    console.error("upload-insight-image storage error", uploadError.message);
    return json({ error: "The image could not be stored." }, 500);
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return json({ ok: true, path, public_url: data.publicUrl });
});
