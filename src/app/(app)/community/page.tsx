"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import WorkoutCard from "@/components/workout/WorkoutCard";
import { formatVolume, cn } from "@/lib/utils";

interface Badge {
  icon: string;
  label: string;
  desc: string;
}

function getBadges(sessionCount: number, totalVol: number, streak: number): Badge[] {
  const badges: Badge[] = [];
  if (sessionCount >= 5) badges.push({ icon: "🌱", label: "Getting Started", desc: "5+ sessions" });
  if (sessionCount >= 10) badges.push({ icon: "⚡", label: "Consistent", desc: "10+ sessions" });
  if (sessionCount >= 20) badges.push({ icon: "🔥", label: "Dedicated", desc: "20+ sessions" });
  if (totalVol >= 100000) badges.push({ icon: "🏅", label: "100t Club", desc: "100,000kg+ volume" });
  if (streak >= 5) badges.push({ icon: "💎", label: "Streak Master", desc: "5+ day streak" });
  return badges;
}

export default function CommunityPage() {
  const { profiles, workouts, exercises, sets, loading } = useStore();
  const [selectedUser, setSelectedUser] = useState<string>("");

  const activeUser = selectedUser || profiles[0]?.id || "";

  const userStats = useMemo(() => {
    const map: Record<string, { sessions: number; sets: number; volume: number; streak: number }> = {};
    for (const p of profiles) {
      const wks = workouts.filter((w) => w.user_id === p.id);
      let vol = 0;
      let setCount = 0;
      for (const w of wks) {
        const exs = exercises.filter((e) => e.workout_id === w.id);
        for (const ex of exs) {
          const ss = sets.filter((s) => s.exercise_id === ex.id);
          setCount += ss.length;
          for (const s of ss) vol += (s.weight_kg + ex.barbell_weight) * s.reps;
        }
      }
      // Simple streak calc
      const dates = [...new Set(wks.map((w) => w.date))].sort().reverse();
      let streak = 0;
      if (dates.length > 0) {
        const today = new Date();
        const last = new Date(dates[0] + "T00:00:00");
        if ((today.getTime() - last.getTime()) / 86400000 <= 1) {
          streak = 1;
          for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1] + "T00:00:00");
            const curr = new Date(dates[i] + "T00:00:00");
            if ((prev.getTime() - curr.getTime()) / 86400000 <= 1) streak++;
            else break;
          }
        }
      }
      map[p.id] = { sessions: wks.length, sets: setCount, volume: vol, streak };
    }
    return map;
  }, [profiles, workouts, exercises, sets]);

  const userWorkouts = useMemo(
    () => workouts.filter((w) => w.user_id === activeUser),
    [workouts, activeUser]
  );

  const st = userStats[activeUser];
  const profile = profiles.find((p) => p.id === activeUser);
  const badges = st ? getBadges(st.sessions, st.volume, st.streak) : [];

  if (loading) return <div className="text-text-muted text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* User tabs */}
      <div className="flex gap-2 flex-wrap">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedUser(p.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-[0.82rem] font-semibold border transition-all",
              activeUser === p.id
                ? "bg-accent/15 border-accent text-accent"
                : "border-border text-text-2 hover:border-accent/40"
            )}
          >
            {p.display_name}
          </button>
        ))}
      </div>

      {/* User header */}
      {profile && st && (
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-xl font-extrabold text-gradient mb-1">{profile.display_name}</h3>
          <div className="flex gap-4 text-[0.78rem] text-text-2 mb-3">
            <span>{st.sessions} sessions</span>
            <span>{st.sets} sets</span>
            <span>{formatVolume(st.volume)}</span>
          </div>
          {badges.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-2 border border-border rounded-pill text-[0.7rem] font-medium"
                  title={b.desc}
                >
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Workout feed */}
      <div className="space-y-3">
        {userWorkouts.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            exercises={exercises}
            sets={sets}
            authorName={profile?.display_name}
          />
        ))}
        {userWorkouts.length === 0 && (
          <div className="text-center text-text-muted text-sm py-12">No workouts yet</div>
        )}
      </div>
    </div>
  );
}
