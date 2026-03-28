"use client";
import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import ToastContainer from "./ToastContainer";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/log": "Log Workout",
  "/journal": "Journal",
  "/progress": "Progress",
  "/community": "Community",
  "/physique": "Physique",
  "/settings": "Settings",
};

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Iron Ledger";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-[225px] flex flex-col min-h-screen">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 p-4 md:p-6 pb-20 md:pb-6"
        >
          {children}
        </motion.main>
      </div>

      <MobileNav />
      <ToastContainer />
    </div>
  );
}
