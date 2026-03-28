"use client";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const { user: profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-5 bg-[var(--topbar-bg)] glass border-b border-border">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-2 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 className="text-[0.95rem] font-bold">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {profile && (
          <span className="text-[0.78rem] text-text-2 font-medium hidden sm:block">
            {profile.display_name}
          </span>
        )}
        <button
          onClick={logout}
          className="text-[0.75rem] text-text-muted hover:text-danger transition px-2 py-1 rounded-md hover:bg-danger-bg"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
