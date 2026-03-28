"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/ui/Modal";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
import StatCard from "@/components/ui/StatCard";
import { Line } from "react-chartjs-2";
import "@/components/charts/ChartSetup";
import { PhysiqueEntry } from "@/lib/types";
import { todayISO, fmtDate, cn } from "@/lib/utils";

function getChartColors() {
  if (typeof window === "undefined") return { text2: "#999", muted: "#666", border: "#333" };
  const cs = getComputedStyle(document.documentElement);
  const v = (p: string) => cs.getPropertyValue(p).trim();
  return { text2: v("--text2"), muted: v("--muted"), border: v("--border") };
}

// Available metrics for trend chart
const TREND_METRICS: { key: string; label: string; color: string; unit: string }[] = [
  { key: "weight", label: "Weight", color: "#60a5fa", unit: "kg" },
  { key: "smm", label: "Skeletal Muscle", color: "#34d399", unit: "kg" },
  { key: "bfm", label: "Body Fat Mass", color: "#f87171", unit: "kg" },
  { key: "bfp", label: "Body Fat %", color: "#fb923c", unit: "%" },
  { key: "bmi", label: "BMI", color: "#a78bfa", unit: "" },
  { key: "bmr", label: "BMR", color: "#38bdf8", unit: "kcal" },
  { key: "score", label: "Health Score", color: "#4ade80", unit: "/100" },
  { key: "bio_age", label: "Bio Age", color: "#e879f9", unit: "yr" },
  { key: "whr", label: "Waist-Hip", color: "#fbbf24", unit: "" },
  { key: "protein", label: "Protein", color: "#2dd4bf", unit: "kg" },
  { key: "water", label: "Water", color: "#22d3ee", unit: "kg" },
];

export default function PhysiquePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<PhysiqueEntry[]>([]);
  const [tab, setTab] = useState<"logs" | "trends">("logs");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showNew, setShowNew] = useState(false);

  // Trend metric filters (default: weight, smm, bfm)
  const [activeMetrics, setActiveMetrics] = useState<string[]>(["weight", "smm", "bfm"]);

  // Form state
  const [form, setForm] = useState({
    date: todayISO(), weight: "", height: "", fat: "", protein: "", salt: "", water: "",
    smm: "", bfm: "", bmi: "", bfp: "", whr: "", water_rate: "", bmr: "", score: "", bio_age: "",
  });

  useEffect(() => {
    if (!user) return;
    fetch(`${BASE}/api/physique`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => {});
  }, [user]);

  const current = entries[selectedIdx];

  const saveEntry = async () => {
    const entry = {
      date: form.date,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      fat: form.fat ? parseFloat(form.fat) : null,
      protein: form.protein ? parseFloat(form.protein) : null,
      salt: form.salt ? parseFloat(form.salt) : null,
      water: form.water ? parseFloat(form.water) : null,
      smm: form.smm ? parseFloat(form.smm) : null,
      bfm: form.bfm ? parseFloat(form.bfm) : null,
      bmi: form.bmi ? parseFloat(form.bmi) : null,
      bfp: form.bfp ? parseFloat(form.bfp) : null,
      whr: form.whr ? parseFloat(form.whr) : null,
      water_rate: form.water_rate ? parseFloat(form.water_rate) : null,
      bmr: form.bmr ? parseFloat(form.bmr) : null,
      score: form.score ? parseFloat(form.score) : null,
      bio_age: form.bio_age ? parseFloat(form.bio_age) : null,
      bio: null,
      assessments: null,
    };

    const res = await fetch(`${BASE}/api/physique`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (res.ok) {
      const reload = await fetch(`${BASE}/api/physique`);
      const data = await reload.json();
      setEntries(data.entries || []);
      setShowNew(false);
      toast("Entry saved", "success");
    } else {
      toast("Failed to save", "error");
    }
  };

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Trends data
  const sorted = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);

  const [chartColors, setChartColors] = useState(getChartColors);
  useEffect(() => {
    setChartColors(getChartColors());
    const obs = new MutationObserver(() => setChartColors(getChartColors()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const bodyCompChart = useMemo(() => ({
    labels: sorted.map((e) => fmtDate(e.date)),
    datasets: TREND_METRICS
      .filter((m) => activeMetrics.includes(m.key))
      .map((m) => ({
        label: m.label,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: sorted.map((e) => (e as any)[m.key]),
        borderColor: m.color,
        backgroundColor: m.color + "18",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: m.color,
        pointHoverRadius: 6,
        borderWidth: 2,
      })),
  }), [sorted, activeMetrics]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartOpts: any = useMemo(() => {
    const c = chartColors;
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      hover: { mode: "index" as const, intersect: false },
      plugins: {
        legend: { labels: { color: c.text2, font: { family: "Plus Jakarta Sans", size: 11, weight: "600" }, boxWidth: 12, padding: 10 } },
        tooltip: {
          backgroundColor: "#15171c",
          titleColor: "#f0f0f3",
          bodyColor: "#d1d5db",
          borderColor: c.border,
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
        x: { ticks: { color: c.text2, font: { family: "Plus Jakarta Sans", size: 10 } }, grid: { color: "rgba(42,45,54,0.4)" } },
        y: { ticks: { color: c.text2, font: { family: "Plus Jakarta Sans", size: 10 } }, grid: { color: "rgba(42,45,54,0.3)" } },
      },
    };
  }, [chartColors]);

  const formField = (label: string, key: keyof typeof form, type = "number") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="form-input"
      />
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="phy-tabs">
        {(["logs", "trends"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("phy-tab", tab === t && "active")}
          >
            {t === "logs" ? "BCA Logs" : "Trends"}
          </button>
        ))}
        <button
          onClick={() => setShowNew(true)}
          className="btn btn-primary"
          style={{ marginLeft: "auto" }}
        >
          + New Entry
        </button>
      </div>

      {tab === "logs" && (
        <>
          {entries.length > 0 ? (
            <>
              {/* Entry selector */}
              <div className="phy-tabs">
                {entries.map((e, i) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedIdx(i)}
                    className={cn("phy-tab", selectedIdx === i && "active")}
                  >
                    {fmtDate(e.date)}
                  </button>
                ))}
              </div>

              {/* Detail */}
              {current && (
                <div className="stats-row">
                  {current.weight && <StatCard label="Weight" value={`${current.weight} kg`} />}
                  {current.height && <StatCard label="Height" value={`${current.height} cm`} />}
                  {current.smm && <StatCard label="Skeletal Muscle" value={`${current.smm} kg`} />}
                  {current.bfm && <StatCard label="Body Fat Mass" value={`${current.bfm} kg`} />}
                  {current.bmi && <StatCard label="BMI" value={current.bmi} />}
                  {current.bfp && <StatCard label="Body Fat %" value={`${current.bfp}%`} />}
                  {current.bmr && <StatCard label="BMR" value={`${current.bmr} kcal`} />}
                  {current.score && <StatCard label="Health Score" value={`${current.score}/100`} />}
                  {current.bio_age && <StatCard label="Bio Age" value={current.bio_age} />}
                  {current.whr && <StatCard label="Waist-Hip" value={current.whr} />}
                  {current.protein && <StatCard label="Protein" value={`${current.protein} kg`} />}
                  {current.water && <StatCard label="Water" value={`${current.water} kg`} />}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-text">No BCA entries yet. Add one!</div>
            </div>
          )}
        </>
      )}

      {tab === "trends" && (
        <>
          {sorted.length >= 2 ? (
            <>
              {/* Metric filter chips */}
              <div className="muscle-group-selector" style={{ marginBottom: "1rem" }}>
                {TREND_METRICS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => toggleMetric(m.key)}
                    className={cn("muscle-chip", activeMetrics.includes(m.key) && "active")}
                    style={{ "--chip-color": m.color } as React.CSSProperties}
                  >
                    <span className="chip-dot" style={{ background: m.color }} />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Delta cards */}
              {(() => {
                const latest = sorted[sorted.length - 1];
                const prev = sorted[sorted.length - 2];
                const delta = (a: number | null, b: number | null) => a != null && b != null ? parseFloat(String(a)) - parseFloat(String(b)) : null;
                const deltas = [
                  { label: "Weight", val: delta(latest.weight, prev.weight), unit: "kg" },
                  { label: "Muscle", val: delta(latest.smm, prev.smm), unit: "kg" },
                  { label: "Body Fat", val: delta(latest.bfm, prev.bfm), unit: "kg" },
                  { label: "BF%", val: delta(latest.bfp, prev.bfp), unit: "%" },
                ];
                return (
                  <div className="stats-row">
                    {deltas.map((d) => d.val !== null && (
                      <div key={d.label} className="stat-card">
                        <div className="stat-label">{d.label}</div>
                        <div className={`stat-value ${d.val >= 0 ? (d.label === "Body Fat" || d.label === "BF%" ? "text-danger" : "green") : (d.label === "Body Fat" || d.label === "BF%" ? "green" : "text-danger")}`}>
                          {d.val > 0 ? "+" : ""}{d.val.toFixed(1)}{d.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Body comp chart */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Body Composition</h3>
                </div>
                <div className="card-body">
                  <div className="chart-wrap">
                    {activeMetrics.length > 0 ? (
                      <Line data={bodyCompChart} options={chartOpts} />
                    ) : (
                      <div className="empty-state"><div className="empty-text">Select at least one metric</div></div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-text">Need at least 2 entries for trends</div>
            </div>
          )}
        </>
      )}

      {/* New entry modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New BCA Entry" wide>
        <div>
          {formField("Date", "date", "date")}
          <div className="form-row">
            {formField("Weight (kg)", "weight")}
            {formField("Height (cm)", "height")}
          </div>
          <h4 className="form-label" style={{ marginTop: "1rem" }}>Body Elements</h4>
          <div className="form-row">
            {formField("Body Fat (kg)", "fat")}
            {formField("Protein (kg)", "protein")}
            {formField("Salt (kg)", "salt")}
            {formField("Water (kg)", "water")}
          </div>
          <h4 className="form-label" style={{ marginTop: "1rem" }}>Muscle-Fat Analysis</h4>
          <div className="form-row">
            {formField("Skeletal Muscle (kg)", "smm")}
            {formField("Body Fat Mass (kg)", "bfm")}
          </div>
          <h4 className="form-label" style={{ marginTop: "1rem" }}>Obesity Analysis</h4>
          <div className="form-row">
            {formField("BMI", "bmi")}
            {formField("Body Fat %", "bfp")}
            {formField("Waist-Hip Ratio", "whr")}
            {formField("Water Rate", "water_rate")}
          </div>
          <h4 className="form-label" style={{ marginTop: "1rem" }}>Health</h4>
          <div className="form-row">
            {formField("BMR (kcal)", "bmr")}
            {formField("Score (0-100)", "score")}
            {formField("Bio Age", "bio_age")}
          </div>
          <button onClick={saveEntry} className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
            Save Entry
          </button>
        </div>
      </Modal>
    </div>
  );
}
