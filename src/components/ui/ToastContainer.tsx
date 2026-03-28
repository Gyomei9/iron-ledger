"use client";
import { useToast } from "@/hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  const bgMap = {
    success: "bg-ok text-white",
    error: "bg-danger text-white",
    info: "bg-surface border border-border text-text",
  };

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto cursor-pointer px-4 py-2.5 rounded-lg shadow-lg text-[0.82rem] font-medium max-w-xs ${bgMap[t.type]}`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
