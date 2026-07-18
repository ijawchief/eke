import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get("creator_id")?.value;
  const creatorId = raw ? decodeURIComponent(raw) : null;
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();
  const { data, error } = await db
    .from("creator")
    .select("name, email, username, phone, bank_name, bank_code, account_number, account_name")
    .eq("id", creatorId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
