"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <button className="hamburger" onClick={onMenuClick}>
          ☰
        </button>
        <span className="topbar-title">{title}</span>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
    </header>
  );
}
