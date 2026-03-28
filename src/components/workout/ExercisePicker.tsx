"use client";
import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { EXERCISE_DB, buildExerciseName, detectBarbellWeight } from "@/lib/exercises";
import { MuscleGroup, ExerciseEntry, LogExercise } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  muscles: MuscleGroup[];
  onAdd: (exercise: LogExercise) => void;
}

export default function ExercisePicker({ open, onClose, muscles, onAdd }: Props) {
  const [selectedEx, setSelectedEx] = useState<ExerciseEntry | null>(null);
  const [varSelections, setVarSelections] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const available = useMemo(() => {
    const result: { muscle: MuscleGroup; exercises: ExerciseEntry[] }[] = [];
    for (const m of muscles) {
      if (EXERCISE_DB[m]) result.push({ muscle: m, exercises: EXERCISE_DB[m] });
    }
    return result;
  }, [muscles]);

  const reset = () => {
    setSelectedEx(null);
    setVarSelections([]);
    setCustomName("");
    setShowCustom(false);
  };

  const handlePickExercise = (ex: ExerciseEntry) => {
    if (!ex.v || ex.v.length === 0) {
      const name = ex.name;
      onAdd({ name, barbellWeight: detectBarbellWeight(name), sets: [{ weight: 0, reps: 0, done: false }] });
      reset();
      onClose();
    } else {
      setSelectedEx(ex);
      setVarSelections([]);
    }
  };

  const handlePickVariation = (stepIdx: number, opt: string) => {
    const next = [...varSelections];
    next[stepIdx] = opt;
    setVarSelections(next);

    if (selectedEx?.v && next.length === selectedEx.v.length && next.every(Boolean)) {
      const name = buildExerciseName(selectedEx.name, next);
      onAdd({ name, barbellWeight: detectBarbellWeight(name), sets: [{ weight: 0, reps: 0, done: false }] });
      reset();
      onClose();
    }
  };

  const handleCustom = () => {
    if (!customName.trim()) return;
    onAdd({ name: customName.trim(), barbellWeight: detectBarbellWeight(customName), sets: [{ weight: 0, reps: 0, done: false }] });
    reset();
    onClose();
  };

  const previewName = selectedEx
    ? buildExerciseName(selectedEx.name, varSelections.filter(Boolean))
    : "";

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Add Exercise" wide>
      {selectedEx && selectedEx.v ? (
        <div className="space-y-4">
          <div className="text-[0.78rem] text-text-2">
            Building: <span className="font-semibold text-text">{previewName || selectedEx.name}</span>
          </div>
          {selectedEx.v.map((v, stepIdx) => (
            <div key={v.label}>
              <div className="text-[0.72rem] font-semibold text-text-muted mb-2">{v.label}</div>
              <div className="flex flex-wrap gap-2">
                {v.opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handlePickVariation(stepIdx, opt)}
                    className={cn(
                      "px-3 py-1.5 rounded-pill text-[0.75rem] font-medium border transition-all",
                      varSelections[stepIdx] === opt
                        ? "bg-accent/15 border-accent text-accent"
                        : "border-border text-text-2 hover:border-accent/50"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={reset} className="text-[0.72rem] text-text-muted hover:text-text">
            ← Back to exercises
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {available.map(({ muscle, exercises }) => (
            <div key={muscle}>
              <div className="text-[0.7rem] font-bold uppercase tracking-wider text-text-muted mb-2">
                {muscle}
              </div>
              <div className="flex flex-wrap gap-2">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handlePickExercise(ex)}
                    className="px-3 py-1.5 rounded-lg text-[0.78rem] font-medium bg-surface-2 border border-border text-text hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-4">
            {showCustom ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Custom exercise name"
                  className="flex-1 px-3 py-2 text-[0.8rem] bg-surface-2 border border-border rounded-lg text-text"
                  onKeyDown={(e) => e.key === "Enter" && handleCustom()}
                  autoFocus
                />
                <button onClick={handleCustom} className="px-4 py-2 bg-accent-grad text-[var(--btn-primary-text,#fff)] rounded-lg text-[0.78rem] font-semibold">
                  Add
                </button>
              </div>
            ) : (
              <button onClick={() => setShowCustom(true)} className="text-[0.78rem] text-accent hover:underline">
                + Custom exercise
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
