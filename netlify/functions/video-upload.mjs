import { neon } from "@neondatabase/serverless";

let tableReady = false;

function getSql() {
  return neon(process.env.NETLIFY_DATABASE_URL);
}

async function ensureTable(sql) {
  if (tableReady) return;
  await sql`CREATE TABLE IF NOT EXISTS video_files (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  tableReady = true;
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const sql = getSql();
    await ensureTable(sql);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const name = file.name || "video.mp4";
    const key = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await sql`INSERT INTO video_files (key, name, data) VALUES (${key}, ${name}, ${buffer})`;

    return new Response(JSON.stringify({ success: true, key }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("video-upload error:", e);
    return new Response("Upload failed: " + e.message, { status: 500 });
  }
}
