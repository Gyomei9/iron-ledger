"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import StatCard from "@/components/ui/StatCard";
import VolumeChart from "@/components/charts/VolumeChart";
import FrequencyChart from "@/components/charts/FrequencyChart";
import { formatVolume, daysAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RANGES = ["1W", "2W", "1M", "3M", "All"] as const;
type Range = (typeof RANGES)[number];

const RANGE_DAYS: Record<Range, number> = {
  "1W": 7, "2W": 14, "1M": 30, "3M": 90, All: 9999,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { workouts, exercises, sets, loading } = useStore();
  const [range, setRange] = useState<Range>("1M");

  const cutoff = range === "All" ? "" : daysAgo(RANGE_DAYS[range]);

  const myWorkouts = useMemo(
    () => workouts.filter((w) => w.user_id === user?.id && (range === "All" || w.date >= cutoff)),
    [workouts, user, range, cutoff]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStr = weekStart.toLocaleDateString("en-CA");

    const thisWeek = myWorkouts.filter((w) => w.date >= weekStr).length;
    let totalVol = 0;
    const uniqueExNames = new Set<string>();

    for (const w of myWorkouts) {
      const exs = exercises.filter((e) => e.workout_id === w.id);
      for (const ex of exs) {
        uniqueExNames.add(ex.exercise_name);
        const ss = sets.filter((s) => s.exercise_id === ex.id);
        for (const s of ss) totalVol += (s.weight_kg + ex.barbell_weight) * s.reps;
      }
    }

    return {
      count: myWorkouts.length,
      thisWeek,
      volume: formatVolume(totalVol),
      uniqueEx: uniqueExNames.size,
    };
  }, [myWorkouts, exercises, sets]);

  const filteredExercises = useMemo(
    () => exercises.filter((e) => myWorkouts.some((w) => w.id === e.workout_id)),
    [exercises, myWorkouts]
  );
  const filteredSets = useMemo(
    () => sets.filter((s) => filteredExercises.some((e) => e.id === s.exercise_id)),
    [sets, filteredExercises]
  );

  if (loading) {
    return <div className="text-text-muted text-sm animate-pulse p-4">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Range filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "px-3 py-1.5 rounded-pill text-[0.72rem] font-semibold transition-all duration-200",
              range === r
                ? "bg-accent-grad text-[var(--btn-primary-text,#fff)] shadow-sm"
                : "bg-surface-2 text-text-2 hover:bg-surface-3"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Workouts" value={stats.count} icon="🏋️" />
        <StatCard label="This Week" value={stats.thisWeek} icon="📅" />
        <StatCard label="Total Volume" value={stats.volume} icon="💪" />
        <StatCard label="Exercises" value={stats.uniqueEx} icon="🎯" />
      </div>

      {/* Volume chart */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
        <h3 className="text-[0.82rem] font-bold mb-4">Volume by Day Type</h3>
        <VolumeChart workouts={myWorkouts} exercises={filteredExercises} sets={filteredSets} />
      </div>

      {/* Frequency chart */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
        <h3 className="text-[0.82rem] font-bold mb-4">Monthly Grind</h3>
        <FrequencyChart workouts={workouts.filter((w) => range === "All" || w.date >= cutoff)} />
      </div>
    </div>
  );
}
