import { neon } from "@neondatabase/serverless";

function getSql() {
  return neon(process.env.NETLIFY_DATABASE_URL);
}

export default async (req, context) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("No key provided", { status: 400 });
  }

  try {
    const sql = getSql();
    const rows = await sql`SELECT data, name FROM video_files WHERE key = ${key}`;

    if (!rows.length) {
      return new Response("Not found", { status: 404 });
    }

    const { data, name } = rows[0];
    const buffer = Buffer.from(data);

    return new Response(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="${name}"`,
      },
    });
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500 });
