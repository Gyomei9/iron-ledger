"use client";
import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import ToastContainer from "./ToastContainer";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/log": "Log Workout",
  "/journal": "My Journal",
  "/progress": "Progress",
  "/community": "Community",
  "/physique": "Physique",
  "/settings": "Settings",
};

const PAGE_SUBTITLES: Record<string, string> = {
  "/dashboard": "Overview of your training",
  "/log": "Track your sets and reps",
  "/journal": "Your workout history",
  "/progress": "Exercise progression over time",
  "/community": "See how your friends train",
  "/physique": "Body composition analysis",
  "/settings": "Preferences & configuration",
};

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Iron Ledger";
  const subtitle = PAGE_SUBTITLES[pathname];

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="content">
          {children}
        </main>
      </div>

      <MobileNav />
      <ToastContainer />
    </div>
  );
}
