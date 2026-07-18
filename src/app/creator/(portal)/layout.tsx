import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { CreatorShell } from "@/components/creator/CreatorShell";

export default async function CreatorPortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const creatorId = cookieStore.get("creator_id")?.value;
  if (!creatorId) redirect("/login");

  const db = getServiceClient();
  const { data: creator } = await db
    .from("creator")
    .select("id, name, email, onboarding_done")
    .eq("id", creatorId)
    .single();

  if (!creator) redirect("/login");
  if (!creator.onboarding_done) redirect("/creator/onboarding");

  const initials = (creator.name ?? "C").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <CreatorShell creator={{ name: creator.name, email: creator.email, initials }}>
      {children}
    </CreatorShell>
  );
}
