"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { useToast } from "@/hooks/useToast";
import WorkoutCard from "@/components/workout/WorkoutCard";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/ui/StatCard";
import { DayType, DAY_TYPES, DAY_COLORS, Workout } from "@/lib/types";
import { getMonthKey, formatVolume, fmtDate, cn } from "@/lib/utils";

export default function JournalPage() {
  const { user } = useAuth();
  const { workouts, exercises, sets, loadAll, loading } = useStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<DayType | "All">("All");
  const [detailId, setDetailId] = useState<string | null>(null);

  const myWorkouts = useMemo(
    () => workouts.filter((w) => w.user_id === user?.id),
    [workouts, user]
  );

  const filtered = useMemo(
    () => filter === "All" ? myWorkouts : myWorkouts.filter((w) => w.day_type === filter),
    [myWorkouts, filter]
  );

  // Stats
  const stats = useMemo(() => {
    let totalVol = 0;
    const now = new Date();
    const monthStr = now.toLocaleDateString("en-CA").slice(0, 7);
    let thisMonth = 0;
    let streak = 0;

    const sortedDates = [...new Set(myWorkouts.map((w) => w.date))].sort().reverse();
    if (sortedDates.length > 0) {
      const today = new Date();
      const check = new Date(sortedDates[0] + "T00:00:00");
      const diffDays = Math.floor((today.getTime() - check.getTime()) / 86400000);
      if (diffDays <= 1) {
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1] + "T00:00:00");
          const curr = new Date(sortedDates[i] + "T00:00:00");
          if ((prev.getTime() - curr.getTime()) / 86400000 <= 1) streak++;
          else break;
        }
      }
    }

    for (const w of myWorkouts) {
      if (w.date.startsWith(monthStr)) thisMonth++;
      const exs = exercises.filter((e) => e.workout_id === w.id);
      for (const ex of exs) {
        const ss = sets.filter((s) => s.exercise_id === ex.id);
        for (const s of ss) totalVol += (s.weight_kg + ex.barbell_weight) * s.reps;
      }
    }

    return { total: myWorkouts.length, volume: formatVolume(totalVol), thisMonth, streak };
  }, [myWorkouts, exercises, sets]);

  // Group by month
  const grouped = useMemo(() => {
    const map: Record<string, Workout[]> = {};
    for (const w of filtered) {
      const key = getMonthKey(w.date);
      if (!map[key]) map[key] = [];
      map[key].push(w);
    }
    return Object.entries(map);
  }, [filtered]);

  const detailWorkout = workouts.find((w) => w.id === detailId);

  const deleteWorkout = async () => {
    if (!detailId) return;
    await fetch("/api/workouts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: detailId }),
    });
    setDetailId(null);
    toast("Workout deleted", "info");
    await loadAll();
  };

  if (loading) return <div className="text-text-muted text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Sessions" value={stats.total} icon="📖" />
        <StatCard label="Lifetime Volume" value={stats.volume} icon="💪" />
        <StatCard label="This Month" value={stats.thisMonth} icon="📅" />
        <StatCard label="Streak" value={`${stats.streak}d`} icon="🔥" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter("All")}
          className={cn(
            "px-3 py-1.5 rounded-pill text-[0.72rem] font-semibold transition-all",
            filter === "All" ? "bg-accent-grad text-[var(--btn-primary-text,#fff)]" : "bg-surface-2 text-text-2"
          )}
        >
          All
        </button>
        {DAY_TYPES.map((dt) => (
          <button
            key={dt}
            onClick={() => setFilter(dt)}
            className={cn(
              "px-3 py-1.5 rounded-pill text-[0.72rem] font-semibold transition-all",
              filter === dt ? "text-white" : "bg-surface-2 text-text-2"
            )}
            style={filter === dt ? { backgroundColor: DAY_COLORS[dt] } : {}}
          >
            {dt}
          </button>
        ))}
      </div>

      {/* Workout list */}
      {grouped.map(([month, wks]) => (
        <div key={month}>
          <h3 className="text-[0.78rem] font-bold text-text-muted mb-3">{month}</h3>
          <div className="space-y-3">
            {wks.map((w) => (
              <WorkoutCard
                key={w.id}
                workout={w}
                exercises={exercises}
                sets={sets}
                onClick={() => setDetailId(w.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center text-text-muted text-sm py-12">No workouts found</div>
      )}

      {/* Detail modal */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Workout Detail" wide>
        {detailWorkout && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[0.82rem]">
              <span className="font-semibold">{fmtDate(detailWorkout.date)}</span>
              <span
                className="px-2 py-0.5 rounded-pill text-[0.65rem] font-bold text-white"
                style={{ backgroundColor: DAY_COLORS[detailWorkout.day_type] }}
              >
                {detailWorkout.day_type}
              </span>
            </div>
            {detailWorkout.notes && (
              <p className="text-[0.78rem] text-text-2 italic">{detailWorkout.notes}</p>
            )}
            {exercises
              .filter((e) => e.workout_id === detailId)
              .map((ex) => {
                const ss = sets.filter((s) => s.exercise_id === ex.id);
                const vol = ss.reduce((a, s) => a + (s.weight_kg + ex.barbell_weight) * s.reps, 0);
                return (
                  <div key={ex.id} className="bg-surface-2 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.82rem] font-bold">{ex.exercise_name}</span>
                      <span className="text-[0.68rem] text-text-muted">{formatVolume(vol)}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {ss.map((s) => (
                        <span key={s.id} className="px-2 py-1 bg-surface border border-border rounded text-[0.72rem] font-medium">
                          {s.weight_kg}kg × {s.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            {detailWorkout.user_id === user?.id && (
              <button
                onClick={deleteWorkout}
                className="text-[0.75rem] text-danger hover:underline"
              >
                Delete this workout
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
