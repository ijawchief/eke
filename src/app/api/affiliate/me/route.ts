import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getAffiliateId } from "@/lib/affiliateAuth";

export async function GET(req: NextRequest) {
  const id = getAffiliateId(req);
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();
  const { data } = await db
    .from("affiliate")
    .select("id, name, email, username, balance_kobo, total_earned_kobo")
    .eq("id", id)
    .single();

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
