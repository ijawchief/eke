import { cookies, headers } from "next/headers";

export async function getCreatorId(): Promise<string | null> {
  const h = await headers();

  // Prefer the header injected by proxy.ts — always reliable on Vercel
  const fromProxy = h.get("x-creator-id");
  if (fromProxy) return fromProxy;

  // Fallback: cookies() API
  const cookieStore = await cookies();
  const value = cookieStore.get("creator_id")?.value;
  if (value) return value;

  // Last resort: parse raw cookie header
  const raw = h.get("cookie")?.match(/creator_id=([^;]+)/)?.[1];
  return raw ? decodeURIComponent(raw) : null;
}
