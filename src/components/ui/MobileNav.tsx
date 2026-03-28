"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/log", label: "Log", icon: "✏️" },
  { href: "/journal", label: "Journal", icon: "📖" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/physique", label: "Physique", icon: "🧬" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item${active ? " active" : ""}`}
            >
              <span className="m-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
