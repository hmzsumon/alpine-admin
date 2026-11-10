/* ────────── independent raw-material API client; no menu/waiter workspace calls ────────── */
export async function rawRequest(path: string, body?: unknown) {
  const r = await fetch("/api/procurement/" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const data = await r
    .json()
    .catch(() => ({ error: "সার্ভারের উত্তর পাওয়া যায়নি।" }));
  if (!r.ok) throw new Error(data.error || "কাজটি হয়নি।");
  return data;
}
