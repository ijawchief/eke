import { getServiceClient } from "@/lib/supabase";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const db = getServiceClient();
  const { data: members } = await db
    .from("creator")
    .select("id, name, email, username, created_at, is_admin")
    .eq("is_admin", true)
    .order("created_at", { ascending: false });

  return <TeamClient members={members ?? []} />;
}
