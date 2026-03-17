import { neon } from "@neondatabase/serverless";

function getSql() {
  return neon(process.env.NETLIFY_DATABASE_URL);
}

export default async (req, context) => {
  if (req.method !== "DELETE") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing key parameter", { status: 400 });
    }

    const sql = getSql();
    await sql`DELETE FROM audio_files WHERE key = ${key}`;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("audio-delete error:", e);
    return new Response("Error: " + e.message, { status: 500 });
  }
};

export const config = {
  path: "/api/audio/delete",
};
