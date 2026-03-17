import { neon } from "@neondatabase/serverless";

let tableReady = false;

function getSql() {
  return neon(process.env.NETLIFY_DATABASE_URL);
}

async function ensureTable(sql) {
  if (tableReady) return;
  await sql`CREATE TABLE IF NOT EXISTS audio_files (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  tableReady = true;
}

export default async (req, context) => {
  try {
    const sql = getSql();
    await ensureTable(sql);
    const files = await sql`SELECT key, name FROM audio_files ORDER BY created_at DESC`;
    return new Response(JSON.stringify(files), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("audio-list error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/audio",
  preferStatic: true,
};
