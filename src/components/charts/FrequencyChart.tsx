"use client";
import { useMemo, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "./ChartSetup";
import type { Workout } from "@/lib/types";
import { DAY_COLORS, DayType } from "@/lib/types";

const MON_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Props {
  workouts: Workout[];
}

function getColors() {
  if (typeof window === "undefined") return null;
  const cs = getComputedStyle(document.documentElement);
  const v = (p: string) => cs.getPropertyValue(p).trim();
  return { text: v("--text"), text2: v("--text2"), muted: v("--muted"), surface: v("--surface"), border: v("--border"), acRgb: v("--ac-rgb") };
}

export default function FrequencyChart({ workouts }: Props) {
  const [colors, setColors] = useState(getColors);

  useEffect(() => {
    setColors(getColors());
    const obs = new MutationObserver(() => setColors(getColors()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const chartData = useMemo(() => {
    // Always show trailing 12 months ending at current month
    const now = new Date();
    const months: string[] = [];
    const monthMap: Record<string, Record<DayType, number>> = {};

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push(key);
      monthMap[key] = { Push: 0, Pull: 0, Legs: 0, Arms: 0 };
    }

    for (const w of workouts) {
      const d = new Date(w.date + "T00:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key]) monthMap[key][w.day_type as DayType]++;
    }

    const dayTypes: DayType[] = ["Push", "Pull", "Legs", "Arms"];
    const displayLabels = months.map((ym) => {
      const [y, m] = ym.split("-");
      return MON_ABBR[parseInt(m) - 1] + " '" + y.slice(2);
    });

    return {
      labels: displayLabels,
      datasets: dayTypes.map((dt) => ({
        label: dt,
        data: months.map((m) => monthMap[m]?.[dt] ?? 0),
        backgroundColor: DAY_COLORS[dt] + "60",
        borderColor: DAY_COLORS[dt],
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false,
      })),
    };
  }, [workouts]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = useMemo(() => {
    const c = colors || { text: "#fff", text2: "#999", muted: "#666", surface: "#15171c", border: "#333", acRgb: "99,102,241" };
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      hover: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          align: "start",
          labels: {
            color: c.text2,
            font: { family: "Plus Jakarta Sans", size: 11, weight: "600" },
            usePointStyle: true,
            pointStyle: "rectRounded",
            padding: 14,
            boxWidth: 10,
            boxHeight: 10,
          },
        },
        tooltip: {
          backgroundColor: c.surface || "#15171c",
          titleColor: c.text || "#f0f0f3",
          bodyColor: c.text2 || "#d1d5db",
          borderColor: `rgba(${c.acRgb}, 0.2)`,
          borderWidth: 1,
          cornerRadius: 10,
          padding: { top: 10, bottom: 10, left: 14, right: 14 },
          titleFont: { family: "Plus Jakarta Sans", size: 12, weight: "600" },
          bodyFont: { family: "Plus Jakarta Sans", size: 13, weight: "500" },
          titleMarginBottom: 6,
          displayColors: true,
          caretSize: 6,
          caretPadding: 8,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: {
            color: c.muted,
            font: { family: "Plus Jakarta Sans", size: 10 },
            maxRotation: 0,
          },
        },
        y: {
          stacked: true,
          grid: { color: c.border + "30" },
          ticks: {
            color: c.muted,
            font: { family: "Plus Jakarta Sans", size: 11 },
            stepSize: 2,
          },
          beginAtZero: true,
          title: { display: true, text: "Sessions", color: c.muted, font: { family: "Plus Jakarta Sans", size: 10 } },
        },
      },
    };
  }, [colors]);

  if (workouts.length === 0) {
    return <div className="empty-state"><div className="empty-text">No data yet</div></div>;
  }

  return <Bar data={chartData} options={options} />;
}
