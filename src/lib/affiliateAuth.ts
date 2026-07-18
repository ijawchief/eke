import { NextRequest } from "next/server";

export function getAffiliateId(req: NextRequest): string | null {
  const raw = req.cookies.get("affiliate_id")?.value;
  return raw ? decodeURIComponent(raw) : null;
}
