"use client";
import { Workout, WorkoutExercise, ExerciseSet, DAY_COLORS, DAY_ICONS } from "@/lib/types";
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
    for (const s of ss) totalVol += (s.weight_kg + ex.barbell_weight) * s.reps;
  }

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[0.78rem] font-semibold text-text-2">{fmtDate(workout.date)}</span>
          {workout.gym && (
            <span className="text-[0.68rem] text-text-muted">
              {workout.country} {workout.gym}
            </span>
          )}
        </div>
        <span
          className="px-2 py-0.5 rounded-pill text-[0.65rem] font-bold text-white"
          style={{ backgroundColor: DAY_COLORS[workout.day_type] }}
        >
          {DAY_ICONS[workout.day_type]} {workout.day_type}
        </span>
      </div>

      {/* Exercises */}
      <div className="space-y-2 mb-3">
        {exs.map((ex) => {
          const ss = sets.filter((s) => s.exercise_id === ex.id);
          return (
            <div key={ex.id}>
              <span className="text-[0.78rem] font-semibold">{ex.exercise_name}</span>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {ss.map((s) => (
                  <span
                    key={s.id}
                    className="px-1.5 py-0.5 bg-surface-2 border border-border rounded text-[0.65rem] font-medium text-text-2"
                  >
                    {s.weight_kg}×{s.reps}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 text-[0.68rem] text-text-muted font-medium border-t border-border pt-2">
        <span>{exs.length} exercises</span>
        <span>{totalSets} sets</span>
        <span>{formatVolume(totalVol)}</span>
        {authorName && <span className="ml-auto">{authorName}</span>}
      </div>
    </div>
  );
}
