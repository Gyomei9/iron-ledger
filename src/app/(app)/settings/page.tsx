"use client";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { THEMES, Gym, DEFAULT_GYMS, MuscleGroup } from "@/lib/types";
import { EXERCISE_DB } from "@/lib/exercises";
import { WORLD_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { Trash2, Plus, ChevronDown, ChevronRight, Dumbbell } from "lucide-react";
import FlagImg from "@/components/ui/FlagImg";

type SettingsTab = "general" | "exercises";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest", "Shoulders", "Triceps", "Back", "Biceps", "Forearms",
  "Quads", "Hamstrings", "Glutes", "Calves", "Adductors", "Abductors",
];

interface CustomExercise {
  name: string;
  muscle: MuscleGroup;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [tab, setTab] = useState<SettingsTab>("general");
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [country, setCountry] = useState("India");
  const [preferredGym, setPreferredGym] = useState("");
  const [newGymName, setNewGymName] = useState("");
  const [newGymCountry, setNewGymCountry] = useState("India");

  // Exercise catalog state
  const [expandedMuscle, setExpandedMuscle] = useState<MuscleGroup | null>(null);
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [hiddenExercises, setHiddenExercises] = useState<string[]>([]);
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>("Chest");

  useEffect(() => {
    const savedGyms = localStorage.getItem("il-gyms");
    if (savedGyms) {
      setGyms(JSON.parse(savedGyms));
    } else {
      setGyms(DEFAULT_GYMS);
      localStorage.setItem("il-gyms", JSON.stringify(DEFAULT_GYMS));
    }
    const savedCountry = localStorage.getItem("il-country");
    if (savedCountry) {
      // Migrate old format "India 🇮🇳" to just "India"
      const name = savedCountry.replace(/\s*[\p{Emoji_Presentation}\p{Regional_Indicator}]+\s*/gu, "").trim();
      setCountry(name || savedCountry);
    }
    const savedPref = localStorage.getItem("il-preferred-gym");
    if (savedPref) setPreferredGym(savedPref);
    // Load custom exercises
    const savedCustom = localStorage.getItem("il-custom-exercises");
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    const savedHidden = localStorage.getItem("il-hidden-exercises");
    if (savedHidden) setHiddenExercises(JSON.parse(savedHidden));
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

  const updatePreferredGym = (val: string) => {
    setPreferredGym(val);
    localStorage.setItem("il-preferred-gym", val);
    toast("Preferred gym updated", "success");
  };

  // Exercise management
  const addCustomExercise = () => {
    if (!newExName.trim()) return;
    const updated = [...customExercises, { name: newExName.trim(), muscle: newExMuscle }];
    setCustomExercises(updated);
    localStorage.setItem("il-custom-exercises", JSON.stringify(updated));
    setNewExName("");
    toast("Exercise added", "success");
  };

  const removeCustomExercise = (idx: number) => {
    const updated = customExercises.filter((_, i) => i !== idx);
    setCustomExercises(updated);
    localStorage.setItem("il-custom-exercises", JSON.stringify(updated));
    toast("Exercise removed", "info");
  };

  const toggleHideExercise = (exId: string) => {
    const updated = hiddenExercises.includes(exId)
      ? hiddenExercises.filter((id) => id !== exId)
      : [...hiddenExercises, exId];
    setHiddenExercises(updated);
    localStorage.setItem("il-hidden-exercises", JSON.stringify(updated));
  };

  const exercisesByMuscle = useMemo(() => {
    const map: Record<string, { id: string; name: string; isCustom: boolean; hidden: boolean }[]> = {};
    for (const mg of MUSCLE_GROUPS) {
      const builtIn = (EXERCISE_DB[mg] || []).map((e) => ({
        id: e.id,
        name: e.name,
        isCustom: false,
        hidden: hiddenExercises.includes(e.id),
      }));
      const custom = customExercises
        .filter((c) => c.muscle === mg)
        .map((c, i) => ({
          id: `custom-${mg}-${i}`,
          name: c.name,
          isCustom: true,
          hidden: false,
        }));
      map[mg] = [...builtIn, ...custom];
    }
    return map;
  }, [customExercises, hiddenExercises]);

  const lightThemes = THEMES.filter((t) => !t.dark);
  const darkThemes = THEMES.filter((t) => t.dark);

  return (
    <div>
      {/* Tab bar */}
      <div className="dash-range" style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => setTab("general")}
          className={`dash-range-btn${tab === "general" ? " active" : ""}`}
        >
          General
        </button>
        <button
          onClick={() => setTab("exercises")}
          className={`dash-range-btn${tab === "exercises" ? " active" : ""}`}
        >
          <Dumbbell size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Exercises
        </button>
      </div>

      {tab === "general" && (
        <>
          {/* Gyms */}
          <section>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manage Gyms</h3>
              </div>
              <div className="card-body">
                {gyms.map((g, i) => (
                  <div key={i} className="assess-item" style={{ marginBottom: "0.5rem" }}>
                    <span className="assess-label">
                      <FlagImg country={g.country} size={14} />
                      <span style={{ marginLeft: 6 }}>{g.name}</span>
                    </span>
                    <button onClick={() => removeGym(i)} className="btn btn-danger btn-sm">
                      <Trash2 size={12} />
                    </button>
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
                      {WORLD_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={addGym} className="btn btn-primary">
                  <Plus size={14} style={{ marginRight: 4 }} /> Add
                </button>
              </div>
            </div>
          </section>

          {/* Preferred Gym */}
          <section style={{ marginTop: "2rem" }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Preferred Gym</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <select
                    value={preferredGym}
                    onChange={(e) => updatePreferredGym(e.target.value)}
                    className="form-select"
                  >
                    <option value="">None</option>
                    {gyms.map((g) => (
                      <option key={g.name} value={g.name}>{g.name} ({g.country})</option>
                    ))}
                  </select>
                </div>
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
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
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
        </>
      )}

      {tab === "exercises" && (
        <>
          {/* Add custom exercise */}
          <section>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add Custom Exercise</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <input
                      type="text"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      placeholder="Exercise name"
                      className="form-input"
                      onKeyDown={(e) => e.key === "Enter" && addCustomExercise()}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <select
                      value={newExMuscle}
                      onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                      className="form-select"
                    >
                      {MUSCLE_GROUPS.map((mg) => (
                        <option key={mg} value={mg}>{mg}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={addCustomExercise} className="btn btn-primary">
                  <Plus size={14} style={{ marginRight: 4 }} /> Add Exercise
                </button>
              </div>
            </div>
          </section>

          {/* Exercise catalog by muscle group */}
          <section style={{ marginTop: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Exercise Catalog</h3>
                <span className="assess-label">{hiddenExercises.length} hidden</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {MUSCLE_GROUPS.map((mg) => {
                  const exList = exercisesByMuscle[mg] || [];
                  const isExpanded = expandedMuscle === mg;
                  const activeCount = exList.filter((e) => !e.hidden).length;
                  return (
                    <div key={mg} className="ex-catalog-group">
                      <button
                        className="ex-catalog-header"
                        onClick={() => setExpandedMuscle(isExpanded ? null : mg)}
                      >
                        <span className="ex-catalog-chevron">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        <span className="ex-catalog-muscle">{mg}</span>
                        <span className="ex-catalog-count">{activeCount}/{exList.length}</span>
                      </button>
                      {isExpanded && (
                        <div className="ex-catalog-list">
                          {exList.map((ex, idx) => (
                            <div key={ex.id} className={cn("ex-catalog-item", ex.hidden && "ex-hidden")}>
                              <span className="ex-catalog-name">
                                {ex.name}
                                {ex.isCustom && <span className="ex-custom-badge">custom</span>}
                              </span>
                              <div className="ex-catalog-actions">
                                {!ex.isCustom && (
                                  <button
                                    className={cn("btn btn-sm", ex.hidden ? "btn-primary" : "btn-secondary")}
                                    onClick={() => toggleHideExercise(ex.id)}
                                    title={ex.hidden ? "Show exercise" : "Hide exercise"}
                                  >
                                    {ex.hidden ? "Show" : "Hide"}
                                  </button>
                                )}
                                {ex.isCustom && (
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                      const customIdx = customExercises.findIndex(
                                        (c) => c.muscle === mg && c.name === ex.name
                                      );
                                      if (customIdx >= 0) removeCustomExercise(customIdx);
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
