"use client";
import { useState, useMemo } from "react";

const MON_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDisplay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    text: `${d.getDate()} ${MON_FULL[d.getMonth()]} ${d.getFullYear()}`,
    day: DAY_FULL[d.getDay()],
  };
}

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

export default function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(value + "T00:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [mode, setMode] = useState<"days" | "months" | "years">("days");

  const today = todayStr();
  const isToday = value === today;
  const display = fmtDisplay(value);

  const jumpToToday = () => {
    onChange(today);
    const d = new Date();
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
    setOpen(false);
  };

  const pickDate = (dateStr: string) => {
    onChange(dateStr);
    const d = new Date(dateStr + "T00:00:00");
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
    setOpen(false);
    setMode("days");
  };

  const pickMonth = (m: number) => {
    setViewMonth((prev) => ({ ...prev, month: m }));
    setMode("days");
  };

  const pickYear = (y: number) => {
    setViewMonth((prev) => ({ ...prev, year: y }));
    setMode("months");
  };

  // Build day grid
  const dayGrid = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startOffset = firstDay.getDay() - 1; // Monday-based
    if (startOffset < 0) startOffset = 6;

    const cells: { day: number; dateStr: string; isToday: boolean; isSelected: boolean }[] = [];
    // Empty cells
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: 0, dateStr: "", isToday: false, isSelected: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        day: d,
        dateStr,
        isToday: dateStr === today,
        isSelected: dateStr === value,
      });
    }
    return cells;
  }, [viewMonth, value, today]);

  return (
    <div className="cal-picker">
      <div className="cal-picker-header">
        <div className="cal-picker-display" onClick={() => setOpen(!open)}>
          <span className="cpd-icon">📅</span>
          <span className="cpd-text">{display.text}</span>
          <span className="cpd-day">{display.day}</span>
        </div>
        {!isToday && (
          <button className="cal-today-btn" onClick={jumpToToday}>
            Today
          </button>
        )}
      </div>

      <div className={`cal-grid${open ? " open" : ""}`}>
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
                    className={`cal-cell${cell.isToday ? " today" : ""}${cell.isSelected ? " selected" : ""}`}
                    onClick={() => pickDate(cell.dateStr)}
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
    </div>
  );
}
