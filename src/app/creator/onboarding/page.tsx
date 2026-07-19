import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const creatorId = cookieStore.get("creator_id")?.value;
  if (!creatorId) redirect("/login");

  const db = getServiceClient();
  const { data: creator } = await db
    .from("creator")
    .select("id, name, email, email_verified, onboarding_done")
    .eq("id", creatorId)
    .single();

  if (!creator) redirect("/login");
  if (creator.onboarding_done) redirect("/creator/dashboard");

  return (
    <OnboardingClient
      creatorId={creator.id}
      email={creator.email}
      name={creator.name ?? ""}
      emailVerified={creator.email_verified ?? false}
    />
  );
}
