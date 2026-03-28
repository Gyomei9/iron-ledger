"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { useToast } from "@/hooks/useToast";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
import ExercisePicker from "@/components/workout/ExercisePicker";
import RestTimer from "@/components/workout/RestTimer";
import DatePicker from "@/components/ui/DatePicker";
import { DAY_TYPES, DAY_TARGETS, DAY_ICONS, DAY_COLORS, MUSCLE_COLORS, DEFAULT_GYMS, DayType, MuscleGroup, LogExercise, Gym } from "@/lib/types";
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
    if (saved) {
      setGyms(JSON.parse(saved));
    } else {
      setGyms(DEFAULT_GYMS);
      localStorage.setItem("il-gyms", JSON.stringify(DEFAULT_GYMS));
    }
    const pref = localStorage.getItem("il-preferred-gym");
    if (pref) setGym(pref);
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
    startTimer();
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSet = (exIdx: number, setIdx: number, field: "weight" | "reps", val: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], [field]: parseFloat(String(val)) || 0 };
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
    (a, e) => a + e.sets.reduce((b, s) => b + (parseFloat(String(s.weight)) + parseFloat(String(e.barbellWeight))) * parseInt(String(s.reps), 10), 0),
    0
  );
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  const saveWorkout = async () => {
    if (!user || exercises.length === 0) return;
    setSaving(true);

    const country = localStorage.getItem("il-country") || "India \u{1F1EE}\u{1F1F3}";
    const workoutId = uid();
    const payload = {
      workout: { id: workoutId, date, day_type: dayType, notes: notes || null, gym: gym || null, country },
      exercises: exercises.map((ex, i) => {
        const exId = uid();
        return {
          id: exId,
          exercise_name: ex.name,
          barbell_weight: parseFloat(String(ex.barbellWeight)) || 0,
          exercise_order: i + 1,
          sets: ex.sets.map((s, j) => ({
            id: uid(),
            set_number: j + 1,
            weight_kg: parseFloat(String(s.weight)) || 0,
            reps: parseInt(String(s.reps), 10) || 0,
          })),
        };
      }),
    };

    const res = await fetch(`${BASE}/api/workouts`, {
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
    <div>
      {/* Date */}
      <div className="form-group">
        <label className="form-label">Date</label>
        <DatePicker value={date} onChange={setDate} />
      </div>

      {/* Day type */}
      <div className="form-group">
        <label className="form-label">Day Type</label>
        <div className="day-type-selector">
          {DAY_TYPES.map((dt) => (
            <button
              key={dt}
              onClick={() => selectDayType(dt)}
              data-day={dt}
              className={cn("day-type-btn", dayType === dt && "active")}
            >
              <span className="dt-icon" style={{ color: DAY_COLORS[dt] }}>{DAY_ICONS[dt]}</span> {dt}
            </button>
          ))}
        </div>
      </div>

      {/* Muscle chips */}
      <div className="form-group">
        <label className="muscle-chip-label">Target Muscles</label>
        <div className="muscle-group-selector">
          {DAY_TARGETS[dayType].map((m) => (
            <button
              key={m}
              onClick={() => toggleMuscle(m)}
              className={cn("muscle-chip", selectedMuscles.includes(m) && "active")}
              style={{ "--chip-color": MUSCLE_COLORS[m] } as React.CSSProperties}
            >
              <span className="chip-dot" style={{ background: MUSCLE_COLORS[m] }} />
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Gym + Notes */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Gym</label>
          <select
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            className="form-select"
          >
            <option value="">Select gym...</option>
            {gyms.map((g) => (
              <option key={g.name} value={g.name}>{g.name} ({g.country})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            className="form-input"
          />
        </div>
      </div>

      {/* Live stats bar */}
      {exercises.length > 0 && (
        <div className="live-stats">
          <div className="live-stat">
            <span className="ls-icon">{"\u23F1"}</span>
            <span className="ls-val">{elapsedMin}:{elapsedSec.toString().padStart(2, "0")}</span>
            <span className="ls-label">time</span>
          </div>
          <div className="live-stat">
            <span className="ls-icon">{"\u{1F3CB}\uFE0F"}</span>
            <span className="ls-val">{exercises.length}</span>
            <span className="ls-label">exercises</span>
          </div>
          <div className="live-stat">
            <span className="ls-icon">{"\u{1F4CA}"}</span>
            <span className="ls-val">{totalSets}</span>
            <span className="ls-label">sets</span>
          </div>
          <div className="live-stat">
            <span className="ls-icon">{"\u{1F4AA}"}</span>
            <span className="ls-val">{(totalVolume / 1000).toFixed(1)}t</span>
            <span className="ls-label">volume</span>
          </div>
        </div>
      )}

      {/* Exercise blocks */}
      <div>
        {exercises.map((ex, exIdx) => (
          <motion.div
            key={exIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="exercise-block"
          >
            <div className="exercise-header">
              <div>
                <span className="exercise-order-num">{exIdx + 1}</span>
                <span className="exercise-name">{ex.name}</span>
                {parseFloat(String(ex.barbellWeight)) > 0 && (
                  <span className="barbell-tag">+{ex.barbellWeight}kg bar</span>
                )}
              </div>
              <button onClick={() => removeExercise(exIdx)} className="btn btn-danger btn-sm">✕</button>
            </div>

            {/* Sets table */}
            <table className="sets-table">
              <thead>
                <tr>
                  <th>Set</th>
                  <th>Weight (kg)</th>
                  <th>Reps</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((set, setIdx) => (
                  <tr key={setIdx}>
                    <td className="set-num">{setIdx + 1}</td>
                    <td>
                      <input
                        type="number"
                        value={set.weight || ""}
                        onChange={(e) => updateSet(exIdx, setIdx, "weight", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={set.reps || ""}
                        onChange={(e) => updateSet(exIdx, setIdx, "reps", parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => toggleSetDone(exIdx, setIdx)}
                        className={cn("set-complete", set.done && "done")}
                      >
                        {set.done ? "\u2713" : ""}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => removeSet(exIdx, setIdx)}
                        className="btn btn-danger btn-sm"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={() => addSet(exIdx)} className="add-set-btn">
              + Add set
            </button>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="form-row">
        <button
          onClick={() => setShowPicker(true)}
          className="btn btn-secondary"
        >
          + Add Exercise
        </button>
        {exercises.length > 0 && (
          <button
            onClick={saveWorkout}
            disabled={saving}
            className="btn btn-primary"
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
