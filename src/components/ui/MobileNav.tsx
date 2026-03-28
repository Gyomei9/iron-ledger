"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PenLine, BookOpen,
  TrendingUp, Users, Dna,
} from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: PenLine },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/community", label: "Community", icon: Users },
  { href: "/physique", label: "Physique", icon: Dna },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item${active ? " active" : ""}`}
            >
              <span className="m-icon"><Icon size={16} /></span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
