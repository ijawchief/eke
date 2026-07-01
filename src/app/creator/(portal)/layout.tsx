import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Wallet, ShoppingCart, LogOut } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";

async function getCreator(cookie: string) {
  const creatorId = cookie.match(/creator_id=([^;]+)/)?.[1];
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

const nav = [
  { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/wallet", label: "Wallet", icon: Wallet },
  { href: "/creator/orders", label: "My Sales", icon: ShoppingCart },
];

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const creator = await getCreator(cookie);

  const initials = (creator.name ?? "C").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <aside className="w-56 flex-shrink-0 flex flex-col bg-[#16162a] fixed h-full z-10">
        <div className="px-6 py-6">
          <span className="text-white text-xl font-bold tracking-tight">Eke</span>
          <span className="ml-2 text-xs text-white/30">Creator</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <Link
            href="/api/creator/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all mb-2"
          >
            <LogOut size={16} />
            Logout
          </Link>
          <div className="flex items-center gap-3 px-3 py-3 border-t border-white/10">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{creator.name ?? "Creator"}</p>
              <p className="text-white/30 text-xs truncate">{creator.email}</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
