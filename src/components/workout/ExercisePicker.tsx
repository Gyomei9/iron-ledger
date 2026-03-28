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
        <div>
          <div className="exercise-meta">
            Building: <span className="exercise-name">{previewName || selectedEx.name}</span>
          </div>
          {selectedEx.v.map((v, stepIdx) => (
            <div key={v.label} className="var-step">
              <div className="var-step-label">{v.label}</div>
              <div className="var-pills">
                {v.opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handlePickVariation(stepIdx, opt)}
                    className={cn("var-pill", varSelections[stepIdx] === opt && "active")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={reset} className="btn btn-secondary btn-sm" style={{ marginTop: "1rem" }}>
            ← Back to exercises
          </button>
        </div>
      ) : (
        <div>
          {available.map(({ muscle, exercises }) => (
            <div key={muscle} style={{ marginBottom: "1rem" }}>
              <div className="form-label">{muscle}</div>
              <div className="exercise-picker">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handlePickExercise(ex)}
                    className="exercise-pick"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="exercise-divider">
            {showCustom ? (
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Custom exercise name"
                    className="form-input"
                    onKeyDown={(e) => e.key === "Enter" && handleCustom()}
                    autoFocus
                  />
                </div>
                <button onClick={handleCustom} className="btn btn-primary">
                  Add
                </button>
              </div>
            ) : (
              <button onClick={() => setShowCustom(true)} className="btn btn-secondary btn-sm">
                + Custom exercise
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
