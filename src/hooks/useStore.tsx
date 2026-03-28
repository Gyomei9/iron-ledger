"use client";
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import type { Workout, WorkoutExercise, ExerciseSet, Profile } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface StoreData {
  workouts: Workout[];
  exercises: WorkoutExercise[];
  sets: ExerciseSet[];
  profiles: Profile[];
  loading: boolean;
}

interface StoreCtx extends StoreData {
  loadAll: () => Promise<void>;
  exercisesByWorkout: Map<string, WorkoutExercise[]>;
  setsByExercise: Map<string, ExerciseSet[]>;
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
      const res = await fetch(`${BASE}/api/data`);
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

  // O(1) lookup maps — rebuilt only when data changes
  const exercisesByWorkout = useMemo(() => {
    const map = new Map<string, WorkoutExercise[]>();
    for (const e of data.exercises) {
      const arr = map.get(e.workout_id);
      if (arr) arr.push(e);
      else map.set(e.workout_id, [e]);
    }
    return map;
  }, [data.exercises]);

  const setsByExercise = useMemo(() => {
    const map = new Map<string, ExerciseSet[]>();
    for (const s of data.sets) {
      const arr = map.get(s.exercise_id);
      if (arr) arr.push(s);
      else map.set(s.exercise_id, [s]);
    }
    return map;
  }, [data.sets]);

  const getWorkoutExercises = useCallback(
    (workoutId: string) => exercisesByWorkout.get(workoutId) || [],
    [exercisesByWorkout]
  );

  const getExerciseSets = useCallback(
    (exerciseId: string) => setsByExercise.get(exerciseId) || [],
    [setsByExercise]
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
      const exs = exercisesByWorkout.get(workoutId) || [];
      let vol = 0;
      for (const ex of exs) {
        const ss = setsByExercise.get(ex.id) || [];
        for (const s of ss) {
          vol += (s.weight_kg + ex.barbell_weight) * s.reps;
        }
      }
      return vol;
    },
    [exercisesByWorkout, setsByExercise]
  );

  return (
    <StoreContext.Provider
      value={{
        ...data,
        loadAll,
        exercisesByWorkout,
        setsByExercise,
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
