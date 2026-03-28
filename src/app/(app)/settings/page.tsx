"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { THEMES, COUNTRIES, Gym, ThemeName } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [country, setCountry] = useState("India 🇮🇳");
  const [newGymName, setNewGymName] = useState("");
  const [newGymCountry, setNewGymCountry] = useState("India 🇮🇳");

  useEffect(() => {
    const savedGyms = localStorage.getItem("il-gyms");
    if (savedGyms) setGyms(JSON.parse(savedGyms));
    const savedCountry = localStorage.getItem("il-country");
    if (savedCountry) setCountry(savedCountry);
  }, []);

  const saveGyms = (updated: Gym[]) => {
    setGyms(updated);
    localStorage.setItem("il-gyms", JSON.stringify(updated));
  };

  const addGym = () => {
    if (!newGymName.trim()) return;
    const updated = [...gyms, { name: newGymName.trim(), country: newGymCountry }];
    saveGyms(updated);
    setNewGymName("");
    toast("Gym added", "success");
  };

  const removeGym = (idx: number) => {
    saveGyms(gyms.filter((_, i) => i !== idx));
    toast("Gym removed", "info");
  };

  const updateCountry = (val: string) => {
    setCountry(val);
    localStorage.setItem("il-country", val);
    toast("Default country updated", "success");
  };

  const lightThemes = THEMES.filter((t) => !t.dark);
  const darkThemes = THEMES.filter((t) => t.dark);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Gyms */}
      <section>
        <h3 className="text-[0.9rem] font-bold mb-4">Manage Gyms</h3>
        <div className="space-y-2 mb-4">
          {gyms.map((g, i) => (
            <div key={i} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2.5">
              <span className="text-[0.82rem] font-medium">{g.country} {g.name}</span>
              <button onClick={() => removeGym(i)} className="text-text-muted hover:text-danger text-sm">✕</button>
            </div>
          ))}
          {gyms.length === 0 && <p className="text-[0.78rem] text-text-muted">No gyms added yet</p>}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGymName}
            onChange={(e) => setNewGymName(e.target.value)}
            placeholder="Gym name"
            className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-[0.82rem] text-text placeholder:text-text-muted"
            onKeyDown={(e) => e.key === "Enter" && addGym()}
          />
          <select
            value={newGymCountry}
            onChange={(e) => setNewGymCountry(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-[0.82rem] text-text"
          >
            {COUNTRIES.map((c) => (
              <option key={c.name} value={`${c.name} ${c.flag}`}>{c.flag} {c.name}</option>
            ))}
          </select>
          <button onClick={addGym} className="px-4 py-2 bg-accent-grad rounded-lg text-[var(--btn-primary-text,#fff)] text-[0.78rem] font-bold">
            Add
          </button>
        </div>
      </section>

      {/* Default country */}
      <section>
        <h3 className="text-[0.9rem] font-bold mb-4">Default Country</h3>
        <select
          value={country}
          onChange={(e) => updateCountry(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-surface border border-border rounded-lg text-[0.82rem] text-text"
        >
          {COUNTRIES.map((c) => (
            <option key={c.name} value={`${c.name} ${c.flag}`}>{c.flag} {c.name}</option>
          ))}
        </select>
      </section>

      {/* Themes */}
      <section>
        <h3 className="text-[0.9rem] font-bold mb-4">Theme</h3>

        <div className="mb-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-text-muted mb-2">Light</p>
          <div className="flex gap-2 flex-wrap">
            {lightThemes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={cn(
                  "w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center",
                  theme === t.name ? "border-accent scale-110 shadow-md" : "border-border hover:border-accent/40"
                )}
                style={{ background: t.preview }}
                title={t.label}
              >
                {theme === t.name && <span className="text-white text-sm font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-text-muted mb-2">Dark</p>
          <div className="flex gap-2 flex-wrap">
            {darkThemes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={cn(
                  "w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center",
                  theme === t.name ? "border-accent scale-110 shadow-md" : "border-border hover:border-accent/40"
                )}
                style={{ background: t.preview }}
                title={t.label}
              >
                {theme === t.name && <span className="text-white text-sm font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
