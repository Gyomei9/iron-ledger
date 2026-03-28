"use client";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "./ChartSetup";
import type { Workout } from "@/lib/types";
import { DAY_COLORS, DayType } from "@/lib/types";
import { getMonthKey } from "@/lib/utils";

interface Props {
  workouts: Workout[];
}

export default function FrequencyChart({ workouts }: Props) {
  const chartData = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    const months: string[] = [];
    const monthMap: Record<string, Record<DayType, number>> = {};

    for (const w of sorted) {
      const key = getMonthKey(w.date);
      if (!monthMap[key]) {
        monthMap[key] = { Push: 0, Pull: 0, Legs: 0, Arms: 0 };
        months.push(key);
      }
      monthMap[key][w.day_type]++;
    }

    const dayTypes: DayType[] = ["Push", "Pull", "Legs", "Arms"];
    return {
      labels: months,
      datasets: dayTypes.map((dt) => ({
        label: dt,
        data: months.map((m) => monthMap[m]?.[dt] ?? 0),
        backgroundColor: DAY_COLORS[dt] + "CC",
        borderRadius: 4,
      })),
    };
  }, [workouts]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "var(--text2)", font: { family: "Plus Jakarta Sans", size: 11 } },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "var(--muted)", font: { family: "Plus Jakarta Sans", size: 10 } },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: { color: "var(--muted)", font: { family: "Plus Jakarta Sans", size: 10 }, stepSize: 1 },
        grid: { color: "var(--border)", lineWidth: 0.5 },
      },
    },
  };

  if (workouts.length === 0) {
    return <div className="h-64 flex items-center justify-center text-text-muted text-sm">No data yet</div>;
  }

  return (
    <div className="h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
}
