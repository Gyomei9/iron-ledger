"use client";
import { useState, useMemo } from "react";

const MON_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface DashCalendarProps {
  onPick: (dateStr: string) => void;
}

export default function DashCalendar({ onPick }: DashCalendarProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const today = todayStr();

  const pickMonth = (m: number) => {
    setViewMonth((prev) => ({ ...prev, month: m }));
    setMode("days");
  };

  const pickYear = (y: number) => {
    setViewMonth((prev) => ({ ...prev, year: y }));
    setMode("months");
  };

  const dayGrid = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const cells: { day: number; dateStr: string; isToday: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: 0, dateStr: "", isToday: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, dateStr, isToday: dateStr === today });
    }
    return cells;
  }, [viewMonth, today]);

  return (
    <div>
      {mode === "days" && (
        <>
          <div className="cal-nav">
            <button
              className="cal-nav-btn"
              onClick={() =>
                setViewMonth((prev) => {
                  const d = new Date(prev.year, prev.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
            >
              ‹
            </button>
            <span
              className="cal-nav-title"
              onClick={() => setMode("months")}
              style={{ cursor: "pointer" }}
            >
              {MON_FULL[viewMonth.month]} {viewMonth.year}
            </span>
            <button
              className="cal-nav-btn"
              onClick={() =>
                setViewMonth((prev) => {
                  const d = new Date(prev.year, prev.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
            >
              ›
            </button>
          </div>
          <div className="cal-weekdays">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="cal-days">
            {dayGrid.map((cell, i) =>
              cell.day === 0 ? (
                <div key={`empty-${i}`} className="cal-cell empty" />
              ) : (
                <div
                  key={cell.dateStr}
                  className={`cal-cell${cell.isToday ? " today" : ""}`}
                  onClick={() => onPick(cell.dateStr)}
                >
                  {cell.day}
                </div>
              )
            )}
          </div>
        </>
      )}

      {mode === "months" && (
        <>
          <div className="cal-nav">
            <button
              className="cal-nav-btn"
              onClick={() => setViewMonth((prev) => ({ ...prev, year: prev.year - 1 }))}
            >
              ‹
            </button>
            <span
              className="cal-nav-title"
              onClick={() => setMode("years")}
              style={{ cursor: "pointer" }}
            >
              {viewMonth.year}
            </span>
            <button
              className="cal-nav-btn"
              onClick={() => setViewMonth((prev) => ({ ...prev, year: prev.year + 1 }))}
            >
              ›
            </button>
          </div>
          <div className="cal-monthpick">
            {MON_ABBR.map((m, i) => (
              <div
                key={m}
                className={`cal-monthpick-cell${i === viewMonth.month ? " active" : ""}`}
                onClick={() => pickMonth(i)}
              >
                {m}
              </div>
            ))}
          </div>
        </>
      )}

      {mode === "years" && (() => {
        const startYr = viewMonth.year - 5;
        return (
          <>
            <div className="cal-nav">
              <button
                className="cal-nav-btn"
                onClick={() => setViewMonth((prev) => ({ ...prev, year: prev.year - 12 }))}
              >
                ‹
              </button>
              <span className="cal-nav-title">
                {startYr} – {startYr + 11}
              </span>
              <button
                className="cal-nav-btn"
                onClick={() => setViewMonth((prev) => ({ ...prev, year: prev.year + 12 }))}
              >
                ›
              </button>
            </div>
            <div className="cal-monthpick">
              {Array.from({ length: 12 }, (_, i) => startYr + i).map((y) => (
                <div
                  key={y}
                  className={`cal-monthpick-cell${y === viewMonth.year ? " active" : ""}`}
                  onClick={() => pickYear(y)}
                >
                  {y}
                </div>
              ))}
            </div>
          </>
        );
      })()}
    </div>
  );
}
