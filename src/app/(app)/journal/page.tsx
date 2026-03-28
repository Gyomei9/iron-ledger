"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/ui/Modal";
import { DayType, DAY_TYPES, Workout } from "@/lib/types";
import { fmtDate, formatVolume, cn } from "@/lib/utils";
import FlagImg from "@/components/ui/FlagImg";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const DAY_BADGE_CLASS: Record<DayType, string> = {
  Push: "b-push",
  Pull: "b-pull",
  Legs: "b-legs",
  Arms: "b-arms",
};

export default function JournalPage() {
  const { user } = useAuth();
  const { workouts, exercises, sets, profiles, loadAll, loading } = useStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<DayType | "All">("All");
  const [detailId, setDetailId] = useState<string | null>(null);

  const myWorkouts = useMemo(
    () => workouts.filter((w) => w.user_id === user?.id),
    [workouts, user]
  );

  const filtered = useMemo(() => {
    const list = filter === "All" ? myWorkouts : myWorkouts.filter((w) => w.day_type === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [myWorkouts, filter]);

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
      const todayStr = today.toLocaleDateString("en-CA");
      let checkDate = new Date(todayStr + "T00:00:00");
      if (sortedDates[0] !== todayStr) checkDate.setDate(checkDate.getDate() - 1);
      for (const d of sortedDates) {
        const wd = new Date(d + "T00:00:00");
        const diff = Math.round((checkDate.getTime() - wd.getTime()) / 86400000);
        if (diff <= 2) {
          streak++;
          checkDate = new Date(wd);
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }
    }

    for (const w of myWorkouts) {
      if (w.date.startsWith(monthStr)) thisMonth++;
      const exs = exercises.filter((e) => e.workout_id === w.id);
      for (const ex of exs) {
        const ss = sets.filter((s) => s.exercise_id === ex.id);
        for (const s of ss) {
          totalVol += (parseFloat(String(s.weight_kg)) + parseFloat(String(ex.barbell_weight || 0))) * parseInt(String(s.reps));
        }
      }
    }

    return { total: myWorkouts.length, volume: (totalVol / 1000).toFixed(0) + "t", thisMonth, streak };
  }, [myWorkouts, exercises, sets]);

  // Group by month
  const grouped = useMemo(() => {
    const months: Record<string, Workout[]> = {};
    for (const w of filtered) {
      const key = w.date.substring(0, 7);
      if (!months[key]) months[key] = [];
      months[key].push(w);
    }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Object.keys(months)
      .sort()
      .reverse()
      .map((key) => {
        const [y, m] = key.split("-");
        const label = `${monthNames[parseInt(m) - 1]} ${y}`;
        return { label, workouts: months[key] };
      });
  }, [filtered]);

  const detailWorkout = workouts.find((w) => w.id === detailId);

  const deleteWorkout = async () => {
    if (!detailId) return;
    await fetch(`${BASE}/api/workouts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: detailId }),
    });
    setDetailId(null);
    toast("Workout deleted", "info");
    await loadAll();
  };

  const getOwnerName = (userId: string) => {
    const p = profiles.find((pr) => pr.id === userId);
    return p?.display_name || "?";
  };

  if (loading) return <div className="empty-state"><div className="empty-text">Loading...</div></div>;

  return (
    <div>
      {/* Journal Header */}
      <div className="journal-header">
        {/* Journal Stats */}
        <div className="journal-stats">
          {[
            { value: stats.total, label: "Sessions" },
            { value: stats.volume, label: "Lifetime" },
            { value: stats.thisMonth, label: "This Month" },
            { value: `${stats.streak}\uD83D\uDD25`, label: "Streak" },
          ].map((stat) => (
            <div key={stat.label} className="journal-stat">
              <span className="js-val">{stat.value}</span>
              <span className="js-lbl">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Filter */}
        <select
          className="form-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as DayType | "All")}
        >
          <option value="All">All Days</option>
          {DAY_TYPES.map((dt) => (
            <option key={dt} value={dt}>{dt}</option>
          ))}
        </select>
      </div>

      {/* Workout list */}
      {grouped.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <div className="empty-text">No workouts found</div>
        </div>
      )}

      {grouped.map(({ label, workouts: wks }) => (
        <div key={label} className="month-group">
          {/* Month group label */}
          <div className="month-group-label">
            {label}{" "}
            <span className="mg-count">
              {wks.length} session{wks.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Workout cards */}
          {wks.map((w) => {
            const exs = exercises.filter((e) => e.workout_id === w.id);
            let totalVol = 0;
            let totalSets = 0;
            const ownerName = getOwnerName(w.user_id);
            const gym = w.gym || "";


            return (
              <div
                key={w.id}
                onClick={() => setDetailId(w.id)}
                className="workout-card"
              >
                {/* Top row */}
                <div className="workout-card-top">
                  <div>
                    <div className="workout-card-date">
                      {fmtDate(w.date)}
                    </div>
                    {gym && (
                      <div className="workout-card-location">
                        <span className="wc-flag"><FlagImg country={w.country} size={14} /></span>
                        <span className="wc-gym">{gym}</span>
                      </div>
                    )}
                  </div>
                  <span className={cn("badge", DAY_BADGE_CLASS[w.day_type])}>
                    {w.day_type}
                  </span>
                </div>

                {/* Exercises */}
                <div className="workout-card-exercises">
                  {exs.length === 0 && (
                    <span className="empty-text">No exercises logged</span>
                  )}
                  {exs.map((ex) => {
                    const ss = sets.filter((s) => s.exercise_id === ex.id);
                    totalSets += ss.length;
                    return (
                      <div key={ex.id} className="ex-line">
                        <span className="ex-name">
                          {ex.exercise_name}
                          {parseFloat(String(ex.barbell_weight || 0)) > 0 && (
                            <span className="barbell-tag">
                              +{ex.barbell_weight}kg bar
                            </span>
                          )}
                        </span>
                        <div className="ex-sets">
                          {ss.map((s) => {
                            const wt = parseFloat(String(s.weight_kg)) + parseFloat(String(ex.barbell_weight || 0));
                            totalVol += wt * parseInt(String(s.reps));
                            return (
                              <span key={s.id} className="set-pill">
                                {s.weight_kg}<span className="set-unit">kg</span> &times; {s.reps}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary row */}
                <div className="workout-card-summary">
                  <div className="ws-item">
                    <b>{exs.length}</b> exercises
                  </div>
                  <div className="ws-item">
                    <b>{totalSets}</b> sets
                  </div>
                  <div className="ws-item">
                    <b>{totalVol.toLocaleString()}</b> kg volume
                  </div>
                  <span className="ws-author">
                    {ownerName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Detail modal */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={detailWorkout ? `${fmtDate(detailWorkout.date)} — ${detailWorkout.day_type} Day` : "Workout Detail"} wide>
        {detailWorkout && (
          <div>
            {/* Author */}
            <div className="ws-item">
              Logged by <b>{getOwnerName(detailWorkout.user_id)}</b>
            </div>

            {/* Notes */}
            {detailWorkout.notes && (
              <div className="empty-text">
                &ldquo;{detailWorkout.notes}&rdquo;
              </div>
            )}

            {/* Exercises with table format */}
            {exercises
              .filter((e) => e.workout_id === detailId)
              .map((ex) => {
                const ss = sets.filter((s) => s.exercise_id === ex.id);
                let vol = 0;
                return (
                  <div key={ex.id} className="month-group">
                    <div className="ex-name">
                      {ex.exercise_name}
                      {parseFloat(String(ex.barbell_weight || 0)) > 0 && (
                        <span className="barbell-tag">
                          +{ex.barbell_weight}kg bar
                        </span>
                      )}
                    </div>
                    <table className="tbl">
                      <thead>
                        <tr>
                          {["Set", "Weight", "Reps", "Volume"].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ss.map((s) => {
                          const wt = parseFloat(String(s.weight_kg)) + parseFloat(String(ex.barbell_weight || 0));
                          const v = wt * parseInt(String(s.reps));
                          vol += v;
                          return (
                            <tr key={s.id}>
                              <td>{s.set_number}</td>
                              <td>{s.weight_kg} kg</td>
                              <td>{s.reps}</td>
                              <td>{v} kg</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="ws-item">
                      Total volume: <b>{vol.toLocaleString()} kg</b>
                    </div>
                  </div>
                );
              })}

            {/* Footer buttons */}
            <div className="workout-card-summary">
              {detailWorkout.user_id === user?.id && (
                <button onClick={deleteWorkout} className="btn btn-danger btn-sm">
                  🗑 Delete Workout
                </button>
              )}
              <button onClick={() => setDetailId(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
