"use client";
import { Workout, WorkoutExercise, ExerciseSet, DAY_COLORS, DAY_ICONS, COUNTRIES } from "@/lib/types";
import { fmtDate, formatVolume } from "@/lib/utils";

interface Props {
  workout: Workout;
  exercises: WorkoutExercise[];
  sets: ExerciseSet[];
  authorName?: string;
  onClick?: () => void;
}

export default function WorkoutCard({ workout, exercises, sets, authorName, onClick }: Props) {
  const exs = exercises.filter((e) => e.workout_id === workout.id);
  let totalVol = 0;
  let totalSets = 0;

  for (const ex of exs) {
    const ss = sets.filter((s) => s.exercise_id === ex.id);
    totalSets += ss.length;
    for (const s of ss) totalVol += (parseFloat(String(s.weight_kg)) + parseFloat(String(ex.barbell_weight))) * parseInt(String(s.reps), 10);
  }

  const dayTypeClass = workout.day_type === "Push" ? "b-push"
    : workout.day_type === "Pull" ? "b-pull"
    : workout.day_type === "Legs" ? "b-legs"
    : workout.day_type === "Arms" ? "b-arms"
    : "";

  const getFlag = (country: string | null) => {
    if (!country) return "";
    const m = country.match(/([\u{1F1E0}-\u{1F1FF}]{2})/u);
    if (m) return m[1];
    const c = COUNTRIES.find((ct) => ct.name === country);
    return c?.flag || "";
  };

  return (
    <div onClick={onClick} className="workout-card">
      {/* Header */}
      <div className="workout-card-top">
        <div>
          <div className="workout-card-date">{fmtDate(workout.date)}</div>
          {workout.gym && (
            <div className="workout-card-location">
              <span className="wc-flag">{getFlag(workout.country)}</span>
              <span className="wc-gym">{workout.gym}</span>
            </div>
          )}
        </div>
        <span className={`badge ${dayTypeClass}`}>
          <span style={{ color: DAY_COLORS[workout.day_type] }}>{DAY_ICONS[workout.day_type]}</span> {workout.day_type}
        </span>
      </div>

      {/* Exercises */}
      <div className="workout-card-exercises">
        {exs.map((ex) => {
          const ss = sets.filter((s) => s.exercise_id === ex.id);
          return (
            <div key={ex.id} className="ex-line">
              <span className="ex-name">
                {ex.exercise_name}
                {parseFloat(String(ex.barbell_weight)) > 0 && (
                  <span className="barbell-tag">+{ex.barbell_weight}kg bar</span>
                )}
              </span>
              <div className="ex-sets">
                {ss.map((s) => (
                  <span key={s.id} className="set-pill">
                    {s.weight_kg}<span className="set-unit">kg</span>×{s.reps}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="workout-card-summary">
        <span className="ws-item"><b>{exs.length}</b> exercises</span>
        <span className="ws-item"><b>{totalSets}</b> sets</span>
        <span className="ws-item"><b>{formatVolume(totalVol)}</b></span>
        {authorName && <span className="ws-author">{authorName}</span>}
      </div>
    </div>
  );
}
