"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/ui/Modal";
import { DayType, DAY_ICONS, DAY_COLORS, COUNTRIES, Workout } from "@/lib/types";
import { fmtDate, formatVolume, cn, extractFlag } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const DAY_BADGE_CLASS: Record<DayType, string> = {
  Push: "b-push",
  Pull: "b-pull",
  Legs: "b-legs",
  Arms: "b-arms",
};

interface Badge {
  icon: string;
  label: string;
  desc: string;
}

function getBadges(sessionCount: number, totalVol: number, streak: number): Badge[] {
  const badges: Badge[] = [];
  if (sessionCount >= 20) badges.push({ icon: "\u{1F525}", label: "Dedicated", desc: "20+ sessions" });
  if (sessionCount >= 10) badges.push({ icon: "\u26A1", label: "Consistent", desc: "10+ sessions" });
  if (sessionCount >= 5) badges.push({ icon: "\u{1F331}", label: "Getting Started", desc: "5+ sessions" });
  if (totalVol >= 100000) badges.push({ icon: "\u{1F3C5}", label: "100t Club", desc: "100,000kg+ volume" });
  if (streak >= 5) badges.push({ icon: "\u{1F48E}", label: "Streak Master", desc: `${streak} day streak` });
  return badges;
}

export default function CommunityPage() {
  const { profiles, workouts, exercises, sets, loading } = useStore();
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [detailId, setDetailId] = useState<string | null>(null);

  // Default to the OTHER user (not current user), or current user if alone
  const defaultUser = useMemo(() => {
    if (profiles.length === 0) return "";
    if (profiles.length === 1) return profiles[0].id;
    const other = profiles.find((p) => p.id !== currentUser?.id);
    return other ? other.id : profiles[0].id;
  }, [profiles, currentUser]);

  const activeUser = selectedUser || defaultUser;

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
          for (const s of ss) {
            vol += (parseFloat(String(s.weight_kg)) + parseFloat(String(ex.barbell_weight || 0))) * parseInt(String(s.reps));
          }
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
    () =>
      workouts
        .filter((w) => w.user_id === activeUser)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [workouts, activeUser]
  );

  const st = userStats[activeUser];
  const profile = profiles.find((p) => p.id === activeUser);
  const displayName = profile?.display_name || "?";
  const badges = st ? getBadges(st.sessions, st.volume, st.streak) : [];

  const detailWorkout = workouts.find((w) => w.id === detailId);

  const getOwnerName = (userId: string) => {
    const p = profiles.find((pr) => pr.id === userId);
    return p?.display_name || "?";
  };

  // extractFlag is imported from utils

  if (loading) return <div className="empty-state"><div className="empty-text">Loading...</div></div>;

  return (
    <div>
      {/* User tabs */}
      <div className="user-tabs">
        {profiles.map((p) => {
          const isActive = activeUser === p.id;
          const name = p?.display_name || "?";
          return (
            <button
              key={p.id}
              onClick={() => setSelectedUser(p.id)}
              className={cn("user-tab", isActive && "active")}
            >
              <span className="community-avatar">
                {name.charAt(0).toUpperCase()}
              </span>
              {name}
            </button>
          );
        })}
      </div>

      {/* User header */}
      {profile && st && (
        <div className="community-user-header">
          <div className="community-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="community-user-info">
            <div className="cu-name">{displayName}</div>
            <div className="cu-sub">
              {st.sessions} sessions &middot; {st.sets} sets &middot; {formatVolume(st.volume)} volume
            </div>
            {badges.length > 0 && (
              <div className="cu-badges">
                {badges.map((b) => (
                  <span key={b.label} title={b.desc} className="cu-badge">
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workout feed */}
      {userWorkouts.map((w) => {
        const exs = exercises.filter((e) => e.workout_id === w.id);
        let totalVol = 0;
        let totalSets = 0;
        const gym = w.gym || "";
        const flag = extractFlag(w.country);

        return (
          <div
            key={w.id}
            onClick={() => setDetailId(w.id)}
            className="workout-card"
          >
            {/* Top row */}
            <div className="workout-card-top">
              <div>
                <div className="workout-card-date">{fmtDate(w.date)}</div>
                {gym && (
                  <div className="workout-card-location">
                    <span className="wc-flag">{flag}</span>
                    <span className="wc-gym">{gym}</span>
                  </div>
                )}
              </div>
              <span className={cn("badge", DAY_BADGE_CLASS[w.day_type])}>
                <span style={{ marginRight: "0.3rem" }}>{DAY_ICONS[w.day_type]}</span>{w.day_type}
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
                {displayName}
              </span>
            </div>
          </div>
        );
      })}

      {userWorkouts.length === 0 && (
        <div className="empty-state">
          <div className="empty-text">No workouts yet</div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={detailWorkout ? `${fmtDate(detailWorkout.date)} — ${detailWorkout.day_type} Day` : "Workout Detail"} wide>
        {detailWorkout && (
          <div>
            <div className="ws-item">
              Logged by <b>{getOwnerName(detailWorkout.user_id)}</b>
            </div>

            {detailWorkout.notes && (
              <div className="empty-text">
                &ldquo;{detailWorkout.notes}&rdquo;
              </div>
            )}

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

            <div className="workout-card-summary">
              {detailWorkout.user_id === currentUser?.id && (
                <button onClick={() => {
                  const doDelete = async () => {
                    if (!detailId) return;
                    await fetch(`${BASE}/api/workouts`, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: detailId }),
                    });
                    setDetailId(null);
                  };
                  doDelete();
                }} className="btn btn-danger btn-sm">
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
