"use client";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "./ChartSetup";
import type { Workout, WorkoutExercise, ExerciseSet } from "@/lib/types";
import { DAY_COLORS, DayType } from "@/lib/types";

interface Props {
  workouts: Workout[];
  exercises: WorkoutExercise[];
  sets: ExerciseSet[];
}

export default function VolumeChart({ workouts, exercises, sets }: Props) {
  const chartData = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    const dayTypes: DayType[] = ["Push", "Pull", "Legs", "Arms"];

    const datasets = dayTypes.map((dt) => {
      const filtered = sorted.filter((w) => w.day_type === dt);
      return {
        label: dt,
        data: filtered.map((w) => {
          const exs = exercises.filter((e) => e.workout_id === w.id);
          let vol = 0;
          for (const ex of exs) {
            const ss = sets.filter((s) => s.exercise_id === ex.id);
            for (const s of ss) vol += (s.weight_kg + ex.barbell_weight) * s.reps;
          }
          return { x: w.date, y: vol / 1000 };
        }),
        borderColor: DAY_COLORS[dt],
        backgroundColor: DAY_COLORS[dt] + "20",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      };
    });

    return { datasets };
  }, [workouts, exercises, sets]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: {
        labels: { color: "var(--text2)", font: { family: "Plus Jakarta Sans", size: 11 } },
      },
      tooltip: {
        backgroundColor: "var(--surface)",
        titleColor: "var(--text)",
        bodyColor: "var(--text2)",
        borderColor: "var(--border)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "var(--muted)", font: { family: "Plus Jakarta Sans", size: 10 } },
        grid: { color: "var(--border)", lineWidth: 0.5 },
      },
      y: {
        ticks: { color: "var(--muted)", font: { family: "Plus Jakarta Sans", size: 10 } },
        grid: { color: "var(--border)", lineWidth: 0.5 },
      },
    },
  };

  if (workouts.length === 0) {
    return <div className="h-64 flex items-center justify-center text-text-muted text-sm">No data yet</div>;
  }

  return (
    <div className="h-72">
      <Line data={chartData} options={options} />
    </div>
  );
}
