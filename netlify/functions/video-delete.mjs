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
      return new Response("No key provided", { status: 400 });
    }

    const sql = getSql();
    await sql`DELETE FROM video_files WHERE key = ${key}`;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Delete failed: " + e.message, { status: 500 });
  }
}
