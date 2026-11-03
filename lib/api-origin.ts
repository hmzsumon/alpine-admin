/* ────────── shared API origin for server routes and session middleware ────────── */
export function apiOrigin() {
  const configured = process.env.API_URL?.trim();
  // Hosted deployments must never use a developer machine's loopback API.
  if (process.env.VERCEL) {
    if (configured?.startsWith("https://")) return configured.replace(/\/$/, "");
    return "https://alpine-2f4777ce8b3b.herokuapp.com";
  }
  return (configured || "http://127.0.0.1:4100").replace(/\/$/, "");
}
