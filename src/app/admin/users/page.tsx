import { getServiceClient } from "@/lib/supabase";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  const db = getServiceClient();
  const { data: creators } = await db
    .from("creator")
    .select("id, name, email, username, onboarding_done, email_verified, created_at, bank_name, account_number, account_name, is_admin")
    .order("created_at", { ascending: false });

  return <UsersClient creators={creators ?? []} />;
}
