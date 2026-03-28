"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Workout, WorkoutExercise, ExerciseSet, Profile } from "@/lib/types";

interface StoreData {
  workouts: Workout[];
  exercises: WorkoutExercise[];
  sets: ExerciseSet[];
  profiles: Profile[];
  loading: boolean;
}

interface StoreCtx extends StoreData {
  loadAll: () => Promise<void>;
  getWorkoutExercises: (workoutId: string) => WorkoutExercise[];
  getExerciseSets: (exerciseId: string) => ExerciseSet[];
  getUserWorkouts: (userId: string) => Workout[];
  getProfile: (userId: string) => Profile | undefined;
  calcWorkoutVolume: (workoutId: string) => number;
}

const StoreContext = createContext<StoreCtx>({} as StoreCtx);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>({
    workouts: [],
    exercises: [],
    sets: [],
    profiles: [],
    loading: true,
  });

  const loadAll = useCallback(async () => {
    setData((d) => ({ ...d, loading: true }));
    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      setData({
        workouts: json.workouts ?? [],
        exercises: json.exercises ?? [],
        sets: json.sets ?? [],
        profiles: json.profiles ?? [],
        loading: false,
      });
    } catch {
      setData((d) => ({ ...d, loading: false }));
    }
  }, []);

  const getWorkoutExercises = useCallback(
    (workoutId: string) => data.exercises.filter((e) => e.workout_id === workoutId),
    [data.exercises]
  );

  const getExerciseSets = useCallback(
    (exerciseId: string) => data.sets.filter((s) => s.exercise_id === exerciseId),
    [data.sets]
  );

  const getUserWorkouts = useCallback(
    (userId: string) => data.workouts.filter((w) => w.user_id === userId),
    [data.workouts]
  );

  const getProfile = useCallback(
    (userId: string) => data.profiles.find((p) => p.id === userId),
    [data.profiles]
  );

  const calcWorkoutVolume = useCallback(
    (workoutId: string) => {
      const exs = data.exercises.filter((e) => e.workout_id === workoutId);
      let vol = 0;
      for (const ex of exs) {
        const sets = data.sets.filter((s) => s.exercise_id === ex.id);
        for (const s of sets) {
          vol += (s.weight_kg + ex.barbell_weight) * s.reps;
        }
      }
      return vol;
    },
    [data.exercises, data.sets]
  );

  return (
    <StoreContext.Provider
      value={{
        ...data,
        loadAll,
        getWorkoutExercises,
        getExerciseSets,
        getUserWorkouts,
        getProfile,
        calcWorkoutVolume,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
