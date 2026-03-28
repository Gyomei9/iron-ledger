"use client";
import { useMemo, useRef, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./ChartSetup";
import type { Workout, WorkoutExercise, ExerciseSet } from "@/lib/types";
import { DAY_COLORS, DayType } from "@/lib/types";

interface Props {
  workouts: Workout[];
  exercises: WorkoutExercise[];
  sets: ExerciseSet[];
  exercisesByWorkout?: Map<string, WorkoutExercise[]>;
  setsByExercise?: Map<string, ExerciseSet[]>;
}

function getColors() {
  if (typeof window === "undefined") return null;
  const cs = getComputedStyle(document.documentElement);
  const v = (p: string) => cs.getPropertyValue(p).trim();
  return { text2: v("--text2"), muted: v("--muted"), surface: v("--surface"), surface2: v("--surface2"), border: v("--border"), text: v("--text"), acRgb: v("--ac-rgb"), ac: v("--ac") };
}

export default function VolumeChart({ workouts, exercises, sets, exercisesByWorkout, setsByExercise }: Props) {
  const [colors, setColors] = useState(getColors);
  const chartRef = useRef(null);

  useEffect(() => {
    setColors(getColors());
    const obs = new MutationObserver(() => setColors(getColors()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const chartData = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    const dayTypes: DayType[] = ["Push", "Pull", "Legs", "Arms"];

    // Build per-date, per-daytype volume
    const allDates: string[] = [];
    const dateSet = new Set<string>();
    const dateVol: Record<string, Record<DayType, number>> = {};

    for (const w of sorted) {
      if (!dateSet.has(w.date)) {
        dateSet.add(w.date);
        allDates.push(w.date);
        dateVol[w.date] = { Push: 0, Pull: 0, Legs: 0, Arms: 0 };
      }
      const exs = exercisesByWorkout ? (exercisesByWorkout.get(w.id) || []) : exercises.filter((e) => e.workout_id === w.id);
      let vol = 0;
      for (const ex of exs) {
        const ss = setsByExercise ? (setsByExercise.get(ex.id) || []) : sets.filter((s) => s.exercise_id === ex.id);
        for (const s of ss) vol += (s.weight_kg + ex.barbell_weight) * s.reps;
      }
      dateVol[w.date][w.day_type as DayType] += vol;
    }

    return {
      labels: allDates,
      datasets: dayTypes.map((dt) => {
        const raw = allDates.map((d) => dateVol[d][dt] || 0);
        // Only include if there's any data for this day type
        if (raw.every((v) => v === 0)) return null;
        return {
          label: dt,
          data: raw.map((v) => v || null), // null for zero so lines break
          borderColor: DAY_COLORS[dt],
          backgroundColor: DAY_COLORS[dt] + "15",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: DAY_COLORS[dt],
          pointBorderColor: DAY_COLORS[dt],
          borderWidth: 2,
          spanGaps: false,
        };
      }).filter((d): d is NonNullable<typeof d> => d !== null),
    };
  }, [workouts, exercises, sets, exercisesByWorkout, setsByExercise]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = useMemo(() => {
    const c = colors || { text2: "#999", muted: "#666", surface: "#1a1a1a", surface2: "#2a2a2a", text: "#fff", border: "#333", acRgb: "99,102,241", ac: "#6366f1" };
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
            pointStyle: "circle",
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
          bodyFont: { family: "Plus Jakarta Sans", size: 12, weight: "500" },
          titleMarginBottom: 6,
          displayColors: true,
          caretSize: 6,
          caretPadding: 8,
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (ctx: any) => ctx.parsed.y != null ? ` ${ctx.dataset.label}: ${(ctx.parsed.y / 1000).toFixed(1)}t` : null,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: c.muted, font: { family: "Plus Jakarta Sans", size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 },
        },
        y: {
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
    <Line ref={chartRef} data={chartData} options={options} />
  );
}
