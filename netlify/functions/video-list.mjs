import { neon } from "@neondatabase/serverless";

function getSql() {
  return neon(process.env.NETLIFY_DATABASE_URL);
}

export default async (req, context) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const sql = getSql();
    const rows = await sql`SELECT key, name FROM video_files ORDER BY created_at DESC`;
    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
