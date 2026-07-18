import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { CreatorShell } from "@/components/creator/CreatorShell";

async function getCreator(cookie: string) {
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;
  if (!creatorId) redirect("/login");
  const db = getServiceClient();
  const { data } = await db
    .from("creator")
    .select("id, name, email, onboarding_done")
    .eq("id", creatorId)
    .single();
  if (!data) redirect("/login");
  if (!data.onboarding_done) redirect("/creator/onboarding");
  return data;
}

export default async function CreatorPortalLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const creator = await getCreator(cookie);
  const initials = (creator.name ?? "C").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <CreatorShell creator={{ name: creator.name, email: creator.email, initials }}>
      {children}
    </CreatorShell>
  );
}
