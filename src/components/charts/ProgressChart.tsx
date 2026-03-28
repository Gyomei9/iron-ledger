"use client";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "./ChartSetup";

interface DataPoint {
  date: string;
  maxWeight: number;
  volume: number;
}

interface Props {
  data: DataPoint[];
}

export default function ProgressChart({ data }: Props) {
  const chartData = useMemo(() => ({
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Max Weight (kg)",
        data: data.map((d) => d.maxWeight),
        borderColor: "var(--ac)",
        backgroundColor: "rgba(var(--ac-rgb), 0.1)",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      {
        label: "Volume (kg)",
        data: data.map((d) => d.volume),
        borderColor: "var(--green)",
        backgroundColor: "rgba(var(--green-rgb), 0.1)",
        fill: true,
        tension: 0.4,
        yAxisID: "y1",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  }), [data]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" as const },
    plugins: {
      legend: { labels: { color: "var(--text2)", font: { family: "Plus Jakarta Sans", size: 11 } } },
    },
    scales: {
      x: {
        ticks: { color: "var(--muted)", font: { family: "Plus Jakarta Sans", size: 10 } },
        grid: { color: "var(--border)", lineWidth: 0.5 },
      },
      y: {
        type: "linear" as const,
        position: "left" as const,
        ticks: { color: "var(--ac)", font: { family: "Plus Jakarta Sans", size: 10 }, callback: (v: number | string) => v + "kg" },
        grid: { color: "var(--border)", lineWidth: 0.5 },
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        ticks: { color: "var(--green)", font: { family: "Plus Jakarta Sans", size: 10 }, callback: (v: number | string) => v + "kg" },
        grid: { display: false },
      },
    },
  };

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-text-muted text-sm">No data for this exercise</div>;
  }

  return (
    <div className="h-72">
      <Line data={chartData} options={options} />
    </div>
  );
}
