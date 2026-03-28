"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/ui/StatCard";
import { Line } from "react-chartjs-2";
import "@/components/charts/ChartSetup";
import { PhysiqueEntry } from "@/lib/types";
import { todayISO, fmtDate, cn } from "@/lib/utils";

export default function PhysiquePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<PhysiqueEntry[]>([]);
  const [tab, setTab] = useState<"logs" | "trends">("logs");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showNew, setShowNew] = useState(false);

  // Form state
  const [form, setForm] = useState({
    date: todayISO(), weight: "", height: "", fat: "", protein: "", salt: "", water: "",
    smm: "", bfm: "", bmi: "", bfp: "", whr: "", water_rate: "", bmr: "", score: "", bio_age: "",
  });

  useEffect(() => {
    if (!user) return;
    fetch("/api/physique")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => {});
  }, [user]);

  const current = entries[selectedIdx];

  const saveEntry = async () => {
    const entry = {
      date: form.date,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
      fat: form.fat ? Number(form.fat) : null,
      protein: form.protein ? Number(form.protein) : null,
      salt: form.salt ? Number(form.salt) : null,
      water: form.water ? Number(form.water) : null,
      smm: form.smm ? Number(form.smm) : null,
      bfm: form.bfm ? Number(form.bfm) : null,
      bmi: form.bmi ? Number(form.bmi) : null,
      bfp: form.bfp ? Number(form.bfp) : null,
      whr: form.whr ? Number(form.whr) : null,
      water_rate: form.water_rate ? Number(form.water_rate) : null,
      bmr: form.bmr ? Number(form.bmr) : null,
      score: form.score ? Number(form.score) : null,
      bio_age: form.bio_age ? Number(form.bio_age) : null,
      bio: null,
      assessments: null,
    };

    const res = await fetch("/api/physique", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (res.ok) {
      const reload = await fetch("/api/physique");
      const data = await reload.json();
      setEntries(data.entries || []);
      setShowNew(false);
      toast("Entry saved", "success");
    } else {
      toast("Failed to save", "error");
    }
  };

  // Trends data
  const sorted = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);

  const bodyCompChart = useMemo(() => ({
    labels: sorted.map((e) => fmtDate(e.date)),
    datasets: [
      { label: "Weight", data: sorted.map((e) => e.weight), borderColor: "#3b82f6", tension: 0.4, pointRadius: 4 },
      { label: "Skeletal Muscle", data: sorted.map((e) => e.smm), borderColor: "#10b981", tension: 0.4, pointRadius: 4 },
      { label: "Body Fat", data: sorted.map((e) => e.bfm), borderColor: "#ef4444", tension: 0.4, pointRadius: 4 },
    ],
  }), [sorted]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "var(--text2)", font: { family: "Plus Jakarta Sans", size: 11 } } } },
    scales: {
      x: { ticks: { color: "var(--muted)", font: { family: "Plus Jakarta Sans", size: 10 } }, grid: { color: "var(--border)" } },
      y: { ticks: { color: "var(--muted)", font: { family: "Plus Jakarta Sans", size: 10 } }, grid: { color: "var(--border)" } },
    },
  };

  const formField = (label: string, key: keyof typeof form, type = "number") => (
    <div>
      <label className="text-[0.68rem] font-semibold text-text-muted block mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[0.82rem] text-text"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-2">
        {(["logs", "trends"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-[0.82rem] font-semibold transition-all",
              tab === t ? "bg-accent/15 text-accent" : "text-text-2 hover:bg-surface-2"
            )}
          >
            {t === "logs" ? "BCA Logs" : "Trends"}
          </button>
        ))}
        <button
          onClick={() => setShowNew(true)}
          className="ml-auto px-4 py-2 bg-accent-grad rounded-lg text-[var(--btn-primary-text,#fff)] text-[0.78rem] font-bold"
        >
          + New Entry
        </button>
      </div>

      {tab === "logs" && (
        <>
          {entries.length > 0 ? (
            <>
              {/* Entry selector */}
              <div className="flex gap-2 flex-wrap">
                {entries.map((e, i) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedIdx(i)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[0.75rem] font-medium border transition-all",
                      selectedIdx === i ? "bg-accent/10 border-accent text-accent" : "border-border text-text-2"
                    )}
                  >
                    {fmtDate(e.date)}
                  </button>
                ))}
              </div>

              {/* Detail */}
              {current && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {current.weight && <StatCard label="Weight" value={`${current.weight} kg`} icon="⚖️" />}
                  {current.height && <StatCard label="Height" value={`${current.height} cm`} icon="📏" />}
                  {current.smm && <StatCard label="Skeletal Muscle" value={`${current.smm} kg`} icon="💪" />}
                  {current.bfm && <StatCard label="Body Fat Mass" value={`${current.bfm} kg`} icon="🔥" />}
                  {current.bmi && <StatCard label="BMI" value={current.bmi} icon="📊" />}
                  {current.bfp && <StatCard label="Body Fat %" value={`${current.bfp}%`} icon="📈" />}
                  {current.bmr && <StatCard label="BMR" value={`${current.bmr} kcal`} icon="🍽️" />}
                  {current.score && <StatCard label="Health Score" value={`${current.score}/100`} icon="❤️" />}
                  {current.bio_age && <StatCard label="Bio Age" value={current.bio_age} icon="🧬" />}
                  {current.whr && <StatCard label="Waist-Hip" value={current.whr} icon="📐" />}
                  {current.protein && <StatCard label="Protein" value={`${current.protein} kg`} icon="🥩" />}
                  {current.water && <StatCard label="Water" value={`${current.water} kg`} icon="💧" />}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-text-muted text-sm py-12">No BCA entries yet. Add one!</div>
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
                const delta = (a: number | null, b: number | null) => a != null && b != null ? a - b : null;
                const deltas = [
                  { label: "Weight", val: delta(latest.weight, prev.weight), unit: "kg" },
                  { label: "Muscle", val: delta(latest.smm, prev.smm), unit: "kg" },
                  { label: "Body Fat", val: delta(latest.bfm, prev.bfm), unit: "kg" },
                  { label: "BF%", val: delta(latest.bfp, prev.bfp), unit: "%" },
                ];
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {deltas.map((d) => d.val !== null && (
                      <div key={d.label} className="bg-surface border border-border rounded-xl p-3 shadow-sm">
                        <div className="text-[0.68rem] text-text-muted font-semibold mb-1">{d.label}</div>
                        <div className={`text-lg font-extrabold ${d.val >= 0 ? (d.label === "Body Fat" || d.label === "BF%" ? "text-danger" : "text-ok") : (d.label === "Body Fat" || d.label === "BF%" ? "text-ok" : "text-danger")}`}>
                          {d.val > 0 ? "+" : ""}{d.val.toFixed(1)}{d.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Body comp chart */}
              <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                <h3 className="text-[0.82rem] font-bold mb-4">Body Composition</h3>
                <div className="h-72"><Line data={bodyCompChart} options={chartOpts} /></div>
              </div>
            </>
          ) : (
            <div className="text-center text-text-muted text-sm py-12">Need at least 2 entries for trends</div>
          )}
        </>
      )}

      {/* New entry modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New BCA Entry" wide>
        <div className="space-y-4">
          {formField("Date", "date", "date")}
          <div className="grid grid-cols-2 gap-3">
            {formField("Weight (kg)", "weight")}
            {formField("Height (cm)", "height")}
          </div>
          <h4 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Body Elements</h4>
          <div className="grid grid-cols-2 gap-3">
            {formField("Body Fat (kg)", "fat")}
            {formField("Protein (kg)", "protein")}
            {formField("Salt (kg)", "salt")}
            {formField("Water (kg)", "water")}
          </div>
          <h4 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Muscle-Fat Analysis</h4>
          <div className="grid grid-cols-2 gap-3">
            {formField("Skeletal Muscle (kg)", "smm")}
            {formField("Body Fat Mass (kg)", "bfm")}
          </div>
          <h4 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Obesity Analysis</h4>
          <div className="grid grid-cols-2 gap-3">
            {formField("BMI", "bmi")}
            {formField("Body Fat %", "bfp")}
            {formField("Waist-Hip Ratio", "whr")}
            {formField("Water Rate", "water_rate")}
          </div>
          <h4 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Health</h4>
          <div className="grid grid-cols-3 gap-3">
            {formField("BMR (kcal)", "bmr")}
            {formField("Score (0-100)", "score")}
            {formField("Bio Age", "bio_age")}
          </div>
          <button
            onClick={saveEntry}
            className="w-full py-2.5 bg-accent-grad rounded-lg text-[var(--btn-primary-text,#fff)] text-[0.82rem] font-bold"
          >
            Save Entry
          </button>
        </div>
      </Modal>
    </div>
  );
}
