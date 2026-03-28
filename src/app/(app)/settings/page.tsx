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
  const [country, setCountry] = useState("India \u{1F1EE}\u{1F1F3}");
  const [newGymName, setNewGymName] = useState("");
  const [newGymCountry, setNewGymCountry] = useState("India \u{1F1EE}\u{1F1F3}");

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
    <div>
      {/* Gyms */}
      <section>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Manage Gyms</h3>
          </div>
          <div className="card-body">
            {gyms.map((g, i) => (
              <div key={i} className="assess-item" style={{ marginBottom: "0.5rem" }}>
                <span className="assess-label">{g.country} {g.name}</span>
                <button onClick={() => removeGym(i)} className="btn btn-danger btn-sm">✕</button>
              </div>
            ))}
            {gyms.length === 0 && <p className="assess-label">No gyms added yet</p>}

            <div className="form-row" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <input
                  type="text"
                  value={newGymName}
                  onChange={(e) => setNewGymName(e.target.value)}
                  placeholder="Gym name"
                  className="form-input"
                  onKeyDown={(e) => e.key === "Enter" && addGym()}
                />
              </div>
              <div className="form-group">
                <select
                  value={newGymCountry}
                  onChange={(e) => setNewGymCountry(e.target.value)}
                  className="form-select"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={`${c.name} ${c.flag}`}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={addGym} className="btn btn-primary">Add</button>
          </div>
        </div>
      </section>

      {/* Default country */}
      <section style={{ marginTop: "2rem" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Default Country</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <select
                value={country}
                onChange={(e) => updateCountry(e.target.value)}
                className="form-select"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={`${c.name} ${c.flag}`}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section style={{ marginTop: "2rem" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Theme</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Light</label>
              <div className="theme-grid">
                {lightThemes.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={cn("theme-option", theme === t.name && "active")}
                  >
                    <div className="theme-swatch" style={{ background: t.preview }} />
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dark</label>
              <div className="theme-grid">
                {darkThemes.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={cn("theme-option", theme === t.name && "active")}
                  >
                    <div className="theme-swatch" style={{ background: t.preview }} />
                    <span>{t.label}</span>
                    <span className="theme-mode dark">dark</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
