"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { useToast } from "@/hooks/useToast";
import ExercisePicker from "@/components/workout/ExercisePicker";
import RestTimer from "@/components/workout/RestTimer";
import { DAY_TYPES, DAY_TARGETS, DAY_ICONS, DayType, MuscleGroup, LogExercise, Gym } from "@/lib/types";
import { todayISO, uid, cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function LogPage() {
  const { user } = useAuth();
  const { loadAll } = useStore();
  const { toast } = useToast();

  const [date, setDate] = useState(todayISO());
  const [dayType, setDayType] = useState<DayType>("Push");
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>(DAY_TARGETS.Push);
  const [notes, setNotes] = useState("");
  const [gym, setGym] = useState("");
  const [exercises, setExercises] = useState<LogExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);

  // Workout timer
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("il-gyms");
    if (saved) setGyms(JSON.parse(saved));
  }, []);

  const startTimer = useCallback(() => {
    if (timerStart) return;
    const now = Date.now();
    setTimerStart(now);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  }, [timerStart]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const selectDayType = (dt: DayType) => {
    setDayType(dt);
    setSelectedMuscles(DAY_TARGETS[dt]);
  };

  const toggleMuscle = (m: MuscleGroup) => {
    setSelectedMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const addExercise = (ex: LogExercise) => {
    setExercises((prev) => [...prev, ex]);
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSet = (exIdx: number, setIdx: number, field: "weight" | "reps", val: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], [field]: val };
      next[exIdx] = ex;
      return next;
    });
  };

  const toggleSetDone = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], done: !ex.sets[setIdx].done };
      next[exIdx] = ex;
      return next;
    });
    startTimer();
    setShowRest(true);
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets = [...ex.sets, { weight: lastSet?.weight ?? 0, reps: lastSet?.reps ?? 0, done: false }];
      next[exIdx] = ex;
      return next;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      ex.sets = ex.sets.filter((_, i) => i !== setIdx);
      if (ex.sets.length === 0) return next.filter((_, i) => i !== exIdx);
      next[exIdx] = ex;
      return next;
    });
  };

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVolume = exercises.reduce(
    (a, e) => a + e.sets.reduce((b, s) => b + (s.weight + e.barbellWeight) * s.reps, 0),
    0
  );
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  const saveWorkout = async () => {
    if (!user || exercises.length === 0) return;
    setSaving(true);

    const country = localStorage.getItem("il-country") || "India 🇮🇳";
    const workoutId = uid();
    const payload = {
      workout: { id: workoutId, date, day_type: dayType, notes: notes || null, gym: gym || null, country },
      exercises: exercises.map((ex, i) => {
        const exId = uid();
        return {
          id: exId,
          exercise_name: ex.name,
          barbell_weight: ex.barbellWeight,
          exercise_order: i + 1,
          sets: ex.sets.map((s, j) => ({
            id: uid(),
            set_number: j + 1,
            weight_kg: s.weight,
            reps: s.reps,
          })),
        };
      }),
    };

    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      toast("Failed to save: " + (data.error || "Unknown error"), "error");
      setSaving(false);
      return;
    }

    toast("Workout saved!", "success");
    setSaving(false);
    setExercises([]);
    setNotes("");
    setTimerStart(null);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    await loadAll();
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Date */}
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-surface border border-border rounded-lg text-[0.82rem] text-text"
        />
      </div>

      {/* Day type */}
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Day Type</label>
        <div className="flex gap-2 flex-wrap">
          {DAY_TYPES.map((dt) => (
            <button
              key={dt}
              onClick={() => selectDayType(dt)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[0.8rem] font-semibold border transition-all",
                dayType === dt
                  ? "bg-accent/15 border-accent text-accent"
                  : "border-border text-text-2 hover:border-accent/40"
              )}
            >
              {DAY_ICONS[dt]} {dt}
            </button>
          ))}
        </div>
      </div>

      {/* Muscle chips */}
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Target Muscles</label>
        <div className="flex gap-1.5 flex-wrap">
          {DAY_TARGETS[dayType].map((m) => (
            <button
              key={m}
              onClick={() => toggleMuscle(m)}
              className={cn(
                "px-2.5 py-1 rounded-pill text-[0.7rem] font-medium border transition-all",
                selectedMuscles.includes(m)
                  ? "bg-accent/10 border-accent/40 text-accent"
                  : "border-border text-text-muted"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Gym + Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Gym</label>
          <select
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[0.82rem] text-text"
          >
            <option value="">Select gym...</option>
            {gyms.map((g) => (
              <option key={g.name} value={g.name}>{g.country} {g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[0.82rem] text-text placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Live stats bar */}
      {exercises.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-[0.72rem] font-semibold text-text-2">
          <span>⏱ {elapsedMin}:{elapsedSec.toString().padStart(2, "0")}</span>
          <span>🏋️ {exercises.length} exercises</span>
          <span>📊 {totalSets} sets</span>
          <span>💪 {(totalVolume / 1000).toFixed(1)}t</span>
        </div>
      )}

      {/* Exercise blocks */}
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => (
          <motion.div
            key={exIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[0.85rem] font-bold">
                {ex.name}
                {ex.barbellWeight > 0 && (
                  <span className="text-[0.65rem] text-text-muted ml-1.5">+{ex.barbellWeight}kg bar</span>
                )}
              </h4>
              <button onClick={() => removeExercise(exIdx)} className="text-text-muted hover:text-danger text-sm">✕</button>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              <div className="grid grid-cols-[2.5rem_1fr_1fr_2.5rem_2rem] gap-2 text-[0.65rem] font-semibold uppercase text-text-muted">
                <span>Set</span><span>Weight (kg)</span><span>Reps</span><span></span><span></span>
              </div>
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-[2.5rem_1fr_1fr_2.5rem_2rem] gap-2 items-center">
                  <span className="text-[0.78rem] font-bold text-text-muted text-center">{setIdx + 1}</span>
                  <input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(exIdx, setIdx, "weight", Number(e.target.value))}
                    placeholder="0"
                    className="px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[0.82rem] text-text text-center"
                  />
                  <input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) => updateSet(exIdx, setIdx, "reps", Number(e.target.value))}
                    placeholder="0"
                    className="px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[0.82rem] text-text text-center"
                  />
                  <button
                    onClick={() => toggleSetDone(exIdx, setIdx)}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all",
                      set.done ? "bg-ok/20 text-ok" : "bg-surface-2 text-text-muted hover:bg-ok/10"
                    )}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => removeSet(exIdx, setIdx)}
                    className="text-text-muted hover:text-danger text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exIdx)}
              className="mt-2 text-[0.72rem] text-accent hover:underline font-medium"
            >
              + Add set
            </button>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowPicker(true)}
          className="flex-1 py-2.5 bg-surface border-2 border-dashed border-border rounded-xl text-[0.82rem] font-semibold text-text-2 hover:border-accent/40 hover:text-accent transition-all"
        >
          + Add Exercise
        </button>
        {exercises.length > 0 && (
          <button
            onClick={saveWorkout}
            disabled={saving}
            className="px-8 py-2.5 bg-accent-grad rounded-xl text-[var(--btn-primary-text,#fff)] text-[0.82rem] font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        )}
      </div>

      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        muscles={selectedMuscles}
        onAdd={addExercise}
      />

      <RestTimer visible={showRest} onDismiss={() => setShowRest(false)} />
    </div>
  );
}
