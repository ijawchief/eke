import { cookies, headers } from "next/headers";

export async function getCreatorId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get("creator_id")?.value;
  if (value) return value;

  const h = await headers();
  const raw = h.get("cookie")?.match(/creator_id=([^;]+)/)?.[1];
  return raw ? decodeURIComponent(raw) : null;
}
