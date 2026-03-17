import { neon } from "@neondatabase/serverless";

function getSql() {
  return neon(process.env.NETLIFY_DATABASE_URL);
}

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing key parameter", { status: 400 });
    }

    const sql = getSql();
    const rows = await sql`SELECT data, name FROM audio_files WHERE key = ${key}`;

    if (!rows.length) {
      return new Response("File not found", { status: 404 });
    }

    const row = rows[0];

    // neon() HTTP driver returns bytea as hex string (e.g. \x48656c6c6f)
    let buffer;
    if (typeof row.data === "string") {
      const hex = row.data.startsWith("\\x") ? row.data.slice(2) : row.data;
      buffer = Buffer.from(hex, "hex");
    } else if (row.data instanceof Uint8Array || Buffer.isBuffer(row.data)) {
      buffer = Buffer.from(row.data);
    } else {
      buffer = Buffer.from(row.data);
    }

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  } catch (e) {
    console.error("audio-file error:", e);
    return new Response("Error: " + e.message, { status: 500 });
  }
};

export const config = {
  path: "/api/audio/file",
};
