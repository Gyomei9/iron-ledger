"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/log", label: "Log Workout", icon: "✏️" },
      { href: "/journal", label: "My Journal", icon: "📖" },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/progress", label: "Progress", icon: "📈" },
      { href: "/community", label: "Community", icon: "👥" },
      { href: "/physique", label: "Physique", icon: "🧬" },
    ],
  },
  {
    label: "Profile",
    items: [
      { href: "/settings", label: "Settings", icon: "⚙" },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user: profile, logout } = useAuth();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="sidebar-overlay active"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar${open ? " open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
              <rect x="6" y="18" width="6" height="28" rx="2" fill="var(--ac, #a1a1aa)"/>
              <rect x="14" y="22" width="5" height="20" rx="1.5" fill="var(--text2, #d4d4d8)"/>
              <rect x="19" y="29" width="26" height="6" rx="3" fill="var(--muted, #71717a)"/>
              <rect x="45" y="22" width="5" height="20" rx="1.5" fill="var(--text2, #d4d4d8)"/>
              <rect x="52" y="18" width="6" height="28" rx="2" fill="var(--ac, #a1a1aa)"/>
            </svg>
          </div>
          <div className="brand-name">Iron Ledger</div>
          <div className="brand-tagline">Workout Tracker</div>
        </div>

        {/* User badge */}
        {profile && (
          <div className="user-badge">
            <div className="user-avatar">
              {profile.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <div className="user-name">{profile.display_name}</div>
              <div className="user-role">Athlete</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Sign out">
              ⏻
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="nav-section">{section.label}</div>
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`nav-item${active ? " active" : ""}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <span>Iron Ledger</span> v2.0
        </div>
      </aside>
    </>
  );
}
