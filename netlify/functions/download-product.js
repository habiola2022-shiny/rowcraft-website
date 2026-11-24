import { fetchPaidSession, getProductArchive, json } from "./lib/order.js";

export default async (request) => {
  if (request.method !== "GET") {
    return json({ error: "Use GET to download the paid product." }, 405);
  }

  try {
    const sessionId = new URL(request.url).searchParams.get("session_id");
    await fetchPaidSession(sessionId);
    const archive = await getProductArchive();
    return new Response(archive, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="rowcraft-ico-data-protection-decisions.zip"',
        "Content-Length": String(archive.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Paid product download failed", error.message);
    const status = error.message.includes("not a paid") ? 402 : 400;
    return json({ error: error.message }, status);
  }
};
