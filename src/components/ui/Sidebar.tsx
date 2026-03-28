"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/log", label: "Log Workout", icon: "➕" },
  { href: "/journal", label: "Journal", icon: "📖" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/physique", label: "Physique", icon: "🧬" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[225px] bg-surface border-r border-border z-50",
          "flex flex-col transition-transform duration-300 ease-out",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <div className="text-2xl mb-1">🏋️</div>
          <h1 className="text-xl font-extrabold text-gradient">Iron Ledger</h1>
          <p className="text-[0.6rem] tracking-[0.22em] uppercase text-text-muted mt-0.5">
            Workout Tracker
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.82rem] font-medium transition-all duration-200",
                  active
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-text-2 hover:bg-surface-2 hover:text-text"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="px-5 py-4 text-[0.65rem] text-text-muted">
          v2.0 — Next.js
        </div>
      </aside>
    </>
  );
}
