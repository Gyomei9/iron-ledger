"use client";
import { useState, useEffect, useCallback, useRef } from "react";

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

  if (!visible) return null;

  return (
    <div className="rest-timer" style={{ display: "block" }}>
      <div className="rt-label">
        Rest
        <button onClick={onDismiss} className="rt-btn" style={{ float: "right" }}>✕</button>
      </div>

      <div className="rt-time">
        {mins}:{secs.toString().padStart(2, "0")}
      </div>

      {/* Progress bar */}
      <div className="rt-progress">
        <div
          className="rt-progress-bar"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="rt-btns">
        {PRESETS.map((p) => (
          <button
            key={p.seconds}
            onClick={() => start(p.seconds)}
            className="rt-btn"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
