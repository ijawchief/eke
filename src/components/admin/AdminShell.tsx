"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  LogOut, Settings, Wallet, Menu, X, UserCheck, ShieldCheck,
} from "lucide-react";

const nav = [
  { href: "/admin",            label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products",   label: "Products",  icon: Package },
  { href: "/admin/orders",     label: "Orders",    icon: ShoppingCart },
  { href: "/admin/sales",      label: "Sales",     icon: BarChart2 },
  { href: "/admin/users",      label: "Creators",  icon: UserCheck },
  { href: "/admin/payouts",    label: "Payouts",   icon: Wallet },
  { href: "/admin/affiliates", label: "Affiliates",icon: Users },
  { href: "/admin/team",       label: "Team",      icon: ShieldCheck },
];

export function AdminShell({ children, currencySlot }: { children: React.ReactNode; currencySlot: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);
  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const NavLinks = () => (
    <>
      <nav className="flex-1 px-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 space-y-1">
        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <Settings size={16} /> Settings
        </Link>
        <Link href="/api/admin/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <LogOut size={16} /> Logout
        </Link>
        <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-white/10">
          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">Admin</p>
            <p className="text-white/30 text-xs truncate">Veelage</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col bg-[#16162a] fixed h-full z-10">
        <div className="px-6 py-6">
          <span className="text-white text-xl font-bold tracking-tight">Veelage</span>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Mobile drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#16162a] z-50 flex flex-col transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-6 py-6 flex items-center justify-between">
          <span className="text-white text-xl font-bold tracking-tight">Veelage</span>
          <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
        <NavLinks />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 px-4 lg:px-8 py-3 lg:py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="lg:hidden text-base font-bold text-gray-900">Veelage</span>
          <div className="ml-auto">{currencySlot}</div>
        </div>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
