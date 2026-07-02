import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart2, LogOut, Settings, Wallet, Plug } from "lucide-react";
import { CurrencySwitcher } from "@/components/admin/CurrencySwitcher";
import { getCurrencyFromCookie } from "@/lib/currency";

async function requireAdmin(cookie: string) {
  const raw = cookie.match(/admin_token=([^;]+)/)?.[1];
  const token = raw ? decodeURIComponent(raw) : undefined;
  if (token !== process.env.ADMIN_SECRET) redirect("/login");
}

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/sales", label: "Sales", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  await requireAdmin(cookie);
  const currency = getCurrencyFromCookie(cookie);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-[#16162a] fixed h-full z-10">
        {/* Logo */}
        <div className="px-6 py-6">
          <span className="text-white text-xl font-bold tracking-tight">Eke</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <Settings size={16} />
            Settings
          </Link>
          <Link
            href="/api/admin/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={16} />
            Logout
          </Link>
          {/* User */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-white/10">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Admin</p>
              <p className="text-white/30 text-xs truncate">Oporo System Ltd</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-end gap-4 px-8 py-4 bg-white border-b border-gray-100">
          <CurrencySwitcher current={currency} />
        </div>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
