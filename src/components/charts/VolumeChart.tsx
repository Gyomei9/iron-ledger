"use client";
import { useMemo, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "./ChartSetup";
import type { Workout, WorkoutExercise, ExerciseSet } from "@/lib/types";
import { DAY_COLORS, DayType } from "@/lib/types";

interface Props {
  workouts: Workout[];
  exercises: WorkoutExercise[];
  sets: ExerciseSet[];
}

function getColors() {
  if (typeof window === "undefined") return null;
  const cs = getComputedStyle(document.documentElement);
  const v = (p: string) => cs.getPropertyValue(p).trim();
  return { text2: v("--text2"), muted: v("--muted"), surface: v("--surface"), surface2: v("--surface2"), border: v("--border"), text: v("--text"), acRgb: v("--ac-rgb") };
}

export default function VolumeChart({ workouts, exercises, sets }: Props) {
  const [colors, setColors] = useState(getColors);

  useEffect(() => {
    setColors(getColors());
    const obs = new MutationObserver(() => setColors(getColors()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const chartData = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

    // Group by date, then by day type
    const dateMap: Record<string, Record<DayType, number>> = {};
    const allDates: string[] = [];

    for (const w of sorted) {
      if (!dateMap[w.date]) {
        dateMap[w.date] = { Push: 0, Pull: 0, Legs: 0, Arms: 0 };
        allDates.push(w.date);
      }
      const exs = exercises.filter((e) => e.workout_id === w.id);
      let vol = 0;
      for (const ex of exs) {
        const ss = sets.filter((s) => s.exercise_id === ex.id);
        for (const s of ss) vol += (s.weight_kg + ex.barbell_weight) * s.reps;
      }
      dateMap[w.date][w.day_type as DayType] += vol;
    }

    const dayTypes: DayType[] = ["Push", "Pull", "Legs", "Arms"];

    return {
      labels: allDates,
      datasets: dayTypes.map((dt) => ({
        label: dt,
        data: allDates.map((d) => dateMap[d]?.[dt] || 0),
        backgroundColor: DAY_COLORS[dt] + "90",
        borderColor: DAY_COLORS[dt],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18,
      })),
    };
  }, [workouts, exercises, sets]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = useMemo(() => {
    const c = colors || { text2: "#999", muted: "#666", surface: "#1a1a1a", surface2: "#2a2a2a", text: "#fff", border: "#333", acRgb: "99,102,241" };
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      hover: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: c.text2,
            font: { family: "Plus Jakarta Sans", size: 11, weight: "600" },
            usePointStyle: true,
            pointStyle: "rectRounded",
            padding: 16,
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
          displayColors: false,
          caretSize: 6,
          caretPadding: 8,
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (ctx: any) => ctx.parsed.y > 0 ? `${ctx.dataset.label}: ${(ctx.parsed.y / 1000).toFixed(1)}t` : null,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: c.muted, font: { family: "Plus Jakarta Sans", size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 },
        },
        y: {
          stacked: true,
          grid: { color: c.border + "40" },
          ticks: {
            color: c.muted,
            font: { family: "Plus Jakarta Sans", size: 11 },
            callback: (v: number) => (v / 1000).toFixed(0) + "t",
          },
          beginAtZero: true,
        },
      },
    };
  }, [colors]);

  if (workouts.length === 0) {
    return <div className="empty-state"><div className="empty-text">No data yet</div></div>;
  }

  return (
    <Bar data={chartData} options={options} />
  );
}
