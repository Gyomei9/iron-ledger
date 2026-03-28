"use client";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div className="text-2xl font-extrabold text-gradient leading-tight">{value}</div>
      {sub && <p className="text-[0.68rem] text-text-muted mt-1">{sub}</p>}
    </motion.div>
  );
}
