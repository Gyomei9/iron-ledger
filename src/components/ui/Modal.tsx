"use client";
import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ open, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative bg-surface border border-border rounded-xl shadow-lg overflow-hidden ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <h3 className="text-[0.9rem] font-bold">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-2 text-text-muted transition"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="max-h-[75vh] overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
