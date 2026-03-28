"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/log", label: "Log", icon: "➕" },
  { href: "/journal", label: "Journal", icon: "📖" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/physique", label: "Physique", icon: "🧬" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface border-t border-border">
      <div className="flex items-center justify-around h-14">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[0.6rem] font-medium transition-colors min-w-[48px]",
                active ? "text-accent" : "text-text-muted"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
