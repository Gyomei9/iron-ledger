"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/ui/Modal";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
import { Line } from "react-chartjs-2";
import "@/components/charts/ChartSetup";
import { PhysiqueEntry } from "@/lib/types";
import { todayISO, fmtDate, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ClipboardList, LineChart } from "lucide-react";

function getChartColors() {
  if (typeof window === "undefined") return { text2: "#999", muted: "#666", border: "#333", surface: "#15171c", text: "#fff", acRgb: "99,102,241" };
  const cs = getComputedStyle(document.documentElement);
  const v = (p: string) => cs.getPropertyValue(p).trim();
  return { text2: v("--text2"), muted: v("--muted"), border: v("--border"), surface: v("--surface"), text: v("--text"), acRgb: v("--ac-rgb") };
}

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
  const [activeMetrics, setActiveMetrics] = useState<string[]>(["weight", "smm", "bfm"]);

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
        legend: {
          position: "top",
          align: "start",
          labels: {
            color: c.text2,
            font: { family: "Plus Jakarta Sans", size: 11, weight: "600" },
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            padding: 12,
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
        x: { ticks: { color: c.muted, font: { family: "Plus Jakarta Sans", size: 10 } }, grid: { display: false } },
        y: { ticks: { color: c.muted, font: { family: "Plus Jakarta Sans", size: 10 } }, grid: { color: c.border + "30" } },
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

  // Stat display helper
  const statItem = (label: string, value: string | number | null, unit?: string, colorClass?: string) => {
    if (value == null) return null;
    return (
      <div className="phy-stat">
        <div className="phy-stat-label">{label}</div>
        <div className={cn("phy-stat-value", colorClass)}>{value}{unit ? <span className="phy-stat-unit">{unit}</span> : null}</div>
      </div>
    );
  };

  return (
    <div>
      {/* Tabs */}
      <div className="phy-tabs">
        <button onClick={() => setTab("logs")} className={cn("phy-tab", tab === "logs" && "active")}>
          <ClipboardList size={14} style={{ marginRight: 4 }} /> BCA Logs
        </button>
        <button onClick={() => setTab("trends")} className={cn("phy-tab", tab === "trends" && "active")}>
          <LineChart size={14} style={{ marginRight: 4 }} /> Trends
        </button>
        <button onClick={() => setShowNew(true)} className="btn btn-primary" style={{ marginLeft: "auto" }}>
          + New Entry
        </button>
      </div>

      {tab === "logs" && (
        <>
          {entries.length > 0 ? (
            <>
              {/* Entry selector as dropdown */}
              <div className="form-group" style={{ maxWidth: 220 }}>
                <select
                  value={selectedIdx}
                  onChange={(e) => setSelectedIdx(parseInt(e.target.value))}
                  className="form-select"
                >
                  {entries.map((e, i) => (
                    <option key={e.id} value={i}>{fmtDate(e.date)}</option>
                  ))}
                </select>
              </div>

              {current && (
                <div className="phy-detail">
                  {/* Body Metrics */}
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">Basic Info</h3></div>
                    <div className="card-body">
                      <div className="phy-stat-grid">
                        {statItem("Weight", current.weight, " kg", "ac")}
                        {statItem("Height", current.height, " cm")}
                        {statItem("BMI", current.bmi)}
                        {statItem("BMR", current.bmr, " kcal")}
                      </div>
                    </div>
                  </div>

                  {/* Muscle-Fat */}
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">Muscle-Fat Analysis</h3></div>
                    <div className="card-body">
                      <div className="phy-stat-grid">
                        {statItem("Skeletal Muscle", current.smm, " kg", "green")}
                        {statItem("Body Fat Mass", current.bfm, " kg", "text-danger")}
                        {statItem("Body Fat %", current.bfp, "%", "text-danger")}
                        {statItem("Waist-Hip Ratio", current.whr)}
                      </div>
                    </div>
                  </div>

                  {/* Body Elements */}
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">Body Elements</h3></div>
                    <div className="card-body">
                      <div className="phy-stat-grid">
                        {statItem("Protein", current.protein, " kg")}
                        {statItem("Water", current.water, " kg")}
                        {statItem("Water Rate", current.water_rate, "%")}
                        {statItem("Fat", current.fat, " kg")}
                      </div>
                    </div>
                  </div>

                  {/* Health */}
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">Health Assessment</h3></div>
                    <div className="card-body">
                      <div className="phy-health-row">
                        <div className="phy-health-score">
                          <div className="phy-health-num">{current.score ?? "—"}</div>
                          <div className="phy-health-label">Health Score</div>
                        </div>
                        <div className="phy-health-age">
                          <div className="phy-health-num">{current.bio_age ?? "—"}</div>
                          <div className="phy-health-label">Bio Age</div>
                        </div>
                      </div>
                    </div>
                  </div>
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
              {/* Delta cards */}
              {(() => {
                const latest = sorted[sorted.length - 1];
                const prev = sorted[sorted.length - 2];
                const delta = (a: number | null, b: number | null) => a != null && b != null ? parseFloat(String(a)) - parseFloat(String(b)) : null;
                const items = [
                  { label: "Weight", val: delta(latest.weight, prev.weight), unit: "kg", invertColor: false },
                  { label: "Muscle", val: delta(latest.smm, prev.smm), unit: "kg", invertColor: false },
                  { label: "Body Fat", val: delta(latest.bfm, prev.bfm), unit: "kg", invertColor: true },
                  { label: "BF%", val: delta(latest.bfp, prev.bfp), unit: "%", invertColor: true },
                  { label: "Score", val: delta(latest.score, prev.score), unit: "pts", invertColor: false },
                ];
                return (
                  <div className="phy-delta-row">
                    {items.map((d) => {
                      if (d.val === null) return null;
                      const isGood = d.invertColor ? d.val <= 0 : d.val >= 0;
                      const icon = d.val > 0.01 ? <TrendingUp size={14} /> : d.val < -0.01 ? <TrendingDown size={14} /> : <Minus size={14} />;
                      return (
                        <div key={d.label} className={cn("phy-delta-card", isGood ? "delta-good" : "delta-bad")}>
                          <div className="phy-delta-icon">{icon}</div>
                          <div>
                            <div className="phy-delta-label">{d.label}</div>
                            <div className="phy-delta-value">{d.val > 0 ? "+" : ""}{d.val.toFixed(1)} {d.unit}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

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

              {/* Body comp chart */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Body Composition Trends</h3>
                </div>
                <div className="card-body">
                  <div className="chart-wrap" style={{ height: 340 }}>
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
          <div className="phy-form-section">Basic</div>
          <div className="form-row">
            {formField("Weight (kg)", "weight")}
            {formField("Height (cm)", "height")}
          </div>
          <div className="phy-form-section">Body Elements</div>
          <div className="form-row">
            {formField("Body Fat (kg)", "fat")}
            {formField("Protein (kg)", "protein")}
          </div>
          <div className="form-row">
            {formField("Salt (kg)", "salt")}
            {formField("Water (kg)", "water")}
          </div>
          <div className="phy-form-section">Muscle-Fat Analysis</div>
          <div className="form-row">
            {formField("Skeletal Muscle (kg)", "smm")}
            {formField("Body Fat Mass (kg)", "bfm")}
          </div>
          <div className="phy-form-section">Obesity Analysis</div>
          <div className="form-row">
            {formField("BMI", "bmi")}
            {formField("Body Fat %", "bfp")}
          </div>
          <div className="form-row">
            {formField("Waist-Hip Ratio", "whr")}
            {formField("Water Rate", "water_rate")}
          </div>
          <div className="phy-form-section">Health</div>
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
