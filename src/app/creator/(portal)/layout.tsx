import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { CreatorShell } from "@/components/creator/CreatorShell";

export default async function CreatorPortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  let creatorId = cookieStore.get("creator_id")?.value;

  // Fallback: parse raw cookie header
  if (!creatorId) {
    const h = await headers();
    const raw = h.get("cookie")?.match(/creator_id=([^;]+)/)?.[1];
    creatorId = raw ? decodeURIComponent(raw) : undefined;
  }

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
