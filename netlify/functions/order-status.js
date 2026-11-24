import { fetchPaidSession, json } from "./lib/order.js";

export default async (request) => {
  if (request.method !== "GET") {
    return json({ error: "Use GET to check order status." }, 405);
  }

  try {
    const sessionId = new URL(request.url).searchParams.get("session_id");
    await fetchPaidSession(sessionId);
    return json({ paid: true });
  } catch (error) {
    console.error("Order status verification failed", error.message);
    const status = error.message.includes("not a paid") ? 402 : 400;
    return json({ error: error.message }, status);
  }
};
