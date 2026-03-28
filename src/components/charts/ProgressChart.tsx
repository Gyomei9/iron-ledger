"use client";
import { useMemo, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./ChartSetup";

interface DataPoint {
  date: string;
  maxWeight: number;
  volume: number;
}

interface Props {
  data: DataPoint[];
  accentColor?: string;
}

function getColors() {
  if (typeof window === "undefined") return null;
  const cs = getComputedStyle(document.documentElement);
  const v = (p: string) => cs.getPropertyValue(p).trim();
  return { text2: v("--text2"), muted: v("--muted"), surface: v("--surface"), surface2: v("--surface2"), border: v("--border"), text: v("--text"), ac: v("--ac"), acRgb: v("--ac-rgb") };
}

export default function ProgressChart({ data, accentColor }: Props) {
  const [colors, setColors] = useState(getColors);

  useEffect(() => {
    setColors(getColors());
    const obs = new MutationObserver(() => setColors(getColors()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const ac = accentColor || colors?.ac || "#3b82f6";

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Max Weight (kg)",
        data: data.map((d) => d.maxWeight),
        borderColor: ac,
        backgroundColor: ac + "20",
        fill: true,
        tension: 0.35,
        yAxisID: "y",
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: ac,
        pointBorderColor: ac,
        borderWidth: 2,
      },
      {
        label: "Volume (kg)",
        data: data.map((d) => d.volume),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.12)",
        fill: true,
        tension: 0.35,
        yAxisID: "y1",
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#10b981",
        borderWidth: 2,
      },
    ],
  }), [data, ac]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = useMemo(() => {
    const c = colors || { text2: "#999", muted: "#666", surface2: "#2a2a2a", text: "#fff", border: "#333", ac: "#3b82f6", acRgb: "59,130,246" };
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      hover: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { color: c.text2, font: { family: "Plus Jakarta Sans", size: 11, weight: "600" }, usePointStyle: true, pointStyle: "circle", padding: 16 },
        },
        tooltip: {
          backgroundColor: "#15171c",
          titleColor: "#f0f0f3",
          bodyColor: "#d1d5db",
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
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(42,45,54,0.4)" },
          ticks: { color: c.muted, font: { family: "Plus Jakarta Sans", size: 11 }, maxRotation: 45 },
        },
        y: {
          position: "left",
          grid: { color: "rgba(42,45,54,0.3)" },
          ticks: { color: c.muted, font: { family: "Plus Jakarta Sans", size: 11 } },
          title: { display: true, text: "Max Weight (kg)", color: c.muted, font: { family: "Plus Jakarta Sans", size: 11 } },
        },
        y1: {
          position: "right",
          grid: { display: false },
          ticks: { color: c.muted, font: { family: "Plus Jakarta Sans", size: 11 } },
          title: { display: true, text: "Volume (kg)", color: c.muted, font: { family: "Plus Jakarta Sans", size: 11 } },
        },
      },
    };
  }, [colors]);

  if (data.length === 0) {
    return <div className="empty-state"><div className="empty-text">No data for this exercise</div></div>;
  }

  return <Line data={chartData} options={options} />;
}
