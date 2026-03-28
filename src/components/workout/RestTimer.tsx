"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

const PRESETS = [
  { label: "1:00", seconds: 60 },
  { label: "1:30", seconds: 90 },
  { label: "2:00", seconds: 120 },
  { label: "3:00", seconds: 180 },
];

export default function RestTimer({ visible, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(90);
  const [total, setTotal] = useState(90);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((secs: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTotal(secs);
    setRemaining(secs);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (visible) start(90);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [visible, start]);

  useEffect(() => {
    if (remaining === 0 && visible) {
      const t = setTimeout(onDismiss, 2000);
      return () => clearTimeout(t);
    }
  }, [remaining, visible, onDismiss]);

  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-surface border border-border rounded-xl shadow-lg p-4 w-56"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.72rem] font-bold uppercase tracking-wider text-text-muted">Rest</span>
            <button onClick={onDismiss} className="text-text-muted hover:text-text text-sm">✕</button>
          </div>

          <div className="text-center mb-3">
            <span className={`text-3xl font-extrabold tabular-nums ${remaining === 0 ? "text-ok" : "text-gradient"}`}>
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-surface-3 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-accent-grad rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => start(p.seconds)}
                className="flex-1 py-1 text-[0.68rem] font-semibold rounded-md bg-surface-2 border border-border text-text-2 hover:border-accent/50 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
