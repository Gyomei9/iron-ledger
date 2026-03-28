"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import StatCard from "@/components/ui/StatCard";
import ProgressChart from "@/components/charts/ProgressChart";
import { DAY_TARGETS, MuscleGroup } from "@/lib/types";
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
          const effective = s.weight_kg + ex.barbell_weight;
          if (effective > maxW) maxW = effective;
          vol += effective * s.reps;
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

  if (loading) return <div className="text-text-muted text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Muscle selector */}
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-2 block">Muscle Group</label>
        <div className="flex gap-2 flex-wrap">
          {ALL_MUSCLES.map((m) => (
            <button
              key={m}
              onClick={() => { setMuscle(m); setSelectedExName(""); }}
              className={cn(
                "px-3 py-1.5 rounded-pill text-[0.75rem] font-semibold border transition-all",
                muscle === m ? "bg-accent/15 border-accent text-accent" : "border-border text-text-2 hover:border-accent/40"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise selector */}
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-2 block">Exercise</label>
        <div className="flex gap-2 flex-wrap">
          {availableExNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedExName(name)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[0.78rem] font-medium border transition-all",
                selectedExName === name ? "bg-accent/10 border-accent text-accent" : "border-border text-text-2 hover:border-accent/40"
              )}
            >
              {name}
            </button>
          ))}
          {availableExNames.length === 0 && (
            <p className="text-[0.78rem] text-text-muted">No exercises logged yet</p>
          )}
        </div>
      </div>

      {selectedExName && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="1RM / Max" value={`${progressData.maxWeight}kg`} icon="🏆" />
            {progressData.ratio !== null && (
              <StatCard label="1RM / BW" value={progressData.ratio.toFixed(2)} icon="⚖️" />
            )}
            <StatCard label="Avg Vol/Session" value={`${progressData.avgVol}kg`} icon="📊" />
            <StatCard label="Sessions" value={progressData.sessions} icon="📅" />
          </div>

          {/* Chart */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-[0.82rem] font-bold mb-4">{selectedExName} — Progress</h3>
            <ProgressChart data={progressData.points} />
          </div>
        </>
      )}
    </div>
  );
}
