"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { fmtDate } from "@/lib/utils";

const MON_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface DatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  initialMode?: "days" | "months" | "years";
  autoOpen?: boolean;
}

export default function DatePicker({ value, onChange, placeholder = "Select date", initialMode, autoOpen }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + "T00:00:00");
    return new Date();
  });
  const [mode, setMode] = useState<"days" | "months" | "years">(initialMode || "days");
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const didAutoOpen = useRef(false);

  // Auto-open on mount if requested
  useEffect(() => {
    if (autoOpen && !didAutoOpen.current) {
      didAutoOpen.current = true;
      // Small delay to let the trigger render and get its position
      requestAnimationFrame(() => {
        setOpen(true);
        if (initialMode) setMode(initialMode);
      });
    }
  }, [autoOpen, initialMode]);

  // Close on outside click — use mousedown so it doesn't race with React's onClick
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMode(initialMode || "days");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [initialMode]);

  // Position dropdown
  const positionDropdown = useCallback(() => {
    if (triggerRef.current && dropdownRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = (r.bottom + 6) + "px";
      dropdownRef.current.style.left = r.left + "px";
    }
  }, []);

  useEffect(() => {
    if (open) positionDropdown();
  }, [open, mode, positionDropdown]);

  // Sync viewDate when value changes externally
  useEffect(() => {
    if (value) setViewDate(new Date(value + "T00:00:00"));
  }, [value]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      setMode(initialMode || "days");
    } else {
      setOpen(true);
      if (initialMode) setMode(initialMode);
    }
  };

  const pickDate = (ds: string) => {
    onChange(ds);
    setOpen(false);
    setMode(initialMode || "days");
  };

  const today = new Date().toISOString().split("T")[0];
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();

  // Day grid
  const dayGrid = useMemo(() => {
    const first = new Date(y, m, 1);
    const startDay = first.getDay(); // Sunday = 0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();

    const cells: { day: number; dateStr: string; cls: string }[] = [];

    for (let i = 0; i < startDay; i++) {
      const day = prevDays - startDay + i + 1;
      const ds = new Date(y, m - 1, day).toISOString().split("T")[0];
      cells.push({ day, dateStr: ds, cls: "dp-cell other" });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      let cls = "dp-cell";
      if (ds === value) cls += " selected";
      if (ds === today) cls += " today";
      cells.push({ day: d, dateStr: ds, cls });
    }

    const total = startDay + daysInMonth;
    const remaining = (7 - (total % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const ds = new Date(y, m + 1, i).toISOString().split("T")[0];
      cells.push({ day: i, dateStr: ds, cls: "dp-cell other" });
    }

    return cells;
  }, [y, m, value, today]);

  const monthName = viewDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => setViewDate(new Date(y, m - 1, 1));
  const nextMonth = () => setViewDate(new Date(y, m + 1, 1));
  const prevYear = () => setViewDate(new Date(y - 1, m, 1));
  const nextYear = () => setViewDate(new Date(y + 1, m, 1));

  // Year grid: show decade centered around current year
  const yearBase = Math.floor(y / 10) * 10;

  return (
    <div className="dp-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dp-trigger${open ? " active" : ""}`}
        ref={triggerRef}
        onClick={toggle}
      >
        <span className="dp-label">{value ? fmtDate(value) : placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      <div className={`dp-dropdown${open ? " open" : ""}`} ref={dropdownRef}>
        {mode === "days" && (
          <>
            <div className="dp-nav">
              <button className="dp-nav-btn" type="button" onClick={(e) => { e.stopPropagation(); prevMonth(); }}>&#x276E;</button>
              <span className="dp-year-month" onClick={(e) => { e.stopPropagation(); setMode("months"); }}>{monthName}</span>
              <button className="dp-nav-btn" type="button" onClick={(e) => { e.stopPropagation(); nextMonth(); }}>&#x276F;</button>
            </div>
            <div className="dp-grid days">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                <div key={d} className="dp-day-hdr">{d}</div>
              ))}
              {dayGrid.map((cell, i) => (
                <div
                  key={i}
                  className={cell.cls}
                  onClick={(e) => { e.stopPropagation(); pickDate(cell.dateStr); }}
                >
                  {cell.day}
                </div>
              ))}
            </div>
          </>
        )}

        {mode === "months" && (
          <>
            <div className="dp-nav">
              <button className="dp-nav-btn" type="button" onClick={(e) => { e.stopPropagation(); prevYear(); }}>&#x276E;</button>
              <span className="dp-year-month" onClick={(e) => { e.stopPropagation(); setMode("years"); }}>{y}</span>
              <button className="dp-nav-btn" type="button" onClick={(e) => { e.stopPropagation(); nextYear(); }}>&#x276F;</button>
            </div>
            <div className="dp-grid months">
              {MON_ABBR.map((mn, i) => {
                const sel = value && new Date(value + "T00:00:00").getMonth() === i && new Date(value + "T00:00:00").getFullYear() === y ? " selected" : "";
                return (
                  <div
                    key={mn}
                    className={`dp-cell${sel}`}
                    onClick={(e) => { e.stopPropagation(); setViewDate(new Date(y, i, 1)); setMode("days"); }}
                  >
                    {mn}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {mode === "years" && (
          <>
            <div className="dp-nav">
              <button className="dp-nav-btn" type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(y - 12, m, 1)); }}>&#x276E;</button>
              <span className="dp-year-month">{yearBase} &mdash; {yearBase + 11}</span>
              <button className="dp-nav-btn" type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(y + 12, m, 1)); }}>&#x276F;</button>
            </div>
            <div className="dp-grid years">
              {Array.from({ length: 12 }, (_, i) => yearBase + i).map((yr) => (
                <div
                  key={yr}
                  className={`dp-cell${yr === y ? " selected" : ""}`}
                  onClick={(e) => { e.stopPropagation(); setViewDate(new Date(yr, m, 1)); setMode("months"); }}
                >
                  {yr}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
