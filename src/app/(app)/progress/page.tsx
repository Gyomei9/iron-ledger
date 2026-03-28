"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import StatCard from "@/components/ui/StatCard";
import ProgressChart from "@/components/charts/ProgressChart";
import { DAY_TARGETS, MUSCLE_COLORS, MuscleGroup } from "@/lib/types";
import { COMPOUND_LIFTS } from "@/lib/exercises";
import { fmtDate, cn } from "@/lib/utils";

const ALL_MUSCLES: MuscleGroup[] = ["Chest", "Shoulders", "Triceps", "Back", "Biceps", "Quads", "Hamstrings", "Glutes", "Calves"];

export default function ProgressPage() {
  const { user } = useAuth();
  const { workouts, exercises, sets, loading } = useStore();
  const [muscle, setMuscle] = useState<MuscleGroup>("Chest");
  const [selectedExName, setSelectedExName] = useState<string>("");

  const myWorkouts = useMemo(() => workouts.filter((w) => w.user_id === user?.id), [workouts, user]);

  // Get exercises for selected muscle that the user has logged
  const availableExNames = useMemo(() => {
    const names = new Set<string>();
    for (const w of myWorkouts) {
      const exs = exercises.filter((e) => e.workout_id === w.id);
      for (const ex of exs) names.add(ex.exercise_name);
    }
    return [...names].sort();
  }, [myWorkouts, exercises]);

  // Compute progress data
  const progressData = useMemo(() => {
    if (!selectedExName) return { points: [], maxWeight: 0, avgVol: 0, sessions: 0, latestMax: 0, ratio: null as number | null };

    const isCompound = COMPOUND_LIFTS.some((c) => selectedExName.toLowerCase().includes(c.toLowerCase()));
    const points: { date: string; maxWeight: number; volume: number }[] = [];
    let totalVol = 0;
    let overallMax = 0;
    let latestMax = 0;

    const sorted = [...myWorkouts].sort((a, b) => a.date.localeCompare(b.date));
    for (const w of sorted) {
      const exs = exercises.filter((e) => e.workout_id === w.id && e.exercise_name === selectedExName);
      for (const ex of exs) {
        const ss = sets.filter((s) => s.exercise_id === ex.id);
        let maxW = 0;
        let vol = 0;
        for (const s of ss) {
          const effective = parseFloat(String(s.weight_kg)) + parseFloat(String(ex.barbell_weight));
          if (effective > maxW) maxW = effective;
          vol += effective * parseInt(String(s.reps), 10);
        }
        totalVol += vol;
        if (maxW > overallMax) overallMax = maxW;
        latestMax = maxW;
        points.push({ date: fmtDate(w.date), maxWeight: maxW, volume: vol });
      }
    }

    const bodyweight = 75; // default
    return {
      points,
      maxWeight: overallMax,
      avgVol: points.length > 0 ? Math.round(totalVol / points.length) : 0,
      sessions: points.length,
      latestMax,
      ratio: isCompound ? overallMax / bodyweight : null,
    };
  }, [selectedExName, myWorkouts, exercises, sets]);

  if (loading) return <div className="empty-state"><div className="empty-text">Loading...</div></div>;

  return (
    <div>
      {/* Muscle selector */}
      <div className="form-group">
        <label className="form-label">Muscle Group</label>
        <div className="target-selector">
          {ALL_MUSCLES.map((m) => (
            <button
              key={m}
              onClick={() => { setMuscle(m); setSelectedExName(""); }}
              className={cn("target-btn", muscle === m && "active")}
              style={{ "--chip-color": MUSCLE_COLORS[m] } as React.CSSProperties}
            >
              <span className="chip-dot" style={{ background: MUSCLE_COLORS[m], width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: "0.3rem" }} />
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise selector */}
      <div className="form-group">
        <label className="form-label">Exercise</label>
        <div className="exercise-selector">
          {availableExNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedExName(name)}
              className={cn("ex-sel-btn", selectedExName === name && "active")}
            >
              {name}
            </button>
          ))}
          {availableExNames.length === 0 && (
            <p className="assess-label">No exercises logged yet</p>
          )}
        </div>
      </div>

      {selectedExName && (
        <>
          {/* Stats */}
          <div className="stats-row">
            <StatCard label="1RM / Max" value={`${progressData.maxWeight}kg`} colorClass="ac" />
            {progressData.ratio !== null && (
              <StatCard label="1RM / BW" value={parseFloat(String(progressData.ratio)).toFixed(2)} />
            )}
            <StatCard label="Avg Vol/Session" value={`${progressData.avgVol}kg`} />
            <StatCard label="Sessions" value={progressData.sessions} />
          </div>

          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{selectedExName} — Progress</h3>
            </div>
            <div className="card-body">
              <div className="chart-wrap">
                <ProgressChart data={progressData.points} accentColor={MUSCLE_COLORS[muscle]} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
