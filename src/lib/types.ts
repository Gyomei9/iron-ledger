export interface Profile {
  id: string;
  display_name: string;
  email: string;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  day_type: DayType;
  notes: string | null;
  gym: string | null;
  country: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  barbell_weight: number;
  exercise_order: number;
}

export interface ExerciseSet {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export type DayType = "Push" | "Pull" | "Legs" | "Arms";

export const DAY_TYPES: DayType[] = ["Push", "Pull", "Legs", "Arms"];

export const DAY_COLORS: Record<DayType, string> = {
  Push: "#ef4444",
  Pull: "#3b82f6",
  Legs: "#10b981",
  Arms: "#a855f7",
};

export const DAY_ICONS: Record<DayType, string> = {
  Push: "\u25B2",
  Pull: "\u25BC",
  Legs: "\u25C6",
  Arms: "\u25CF",
};

export const MUSCLE_COLORS: Record<string, string> = {
  Chest: "#ef4444", Shoulders: "#f97316", Triceps: "#f59e0b",
  Back: "#3b82f6", Biceps: "#6366f1", Forearms: "#8b5cf6",
  Quads: "#10b981", Hamstrings: "#14b8a6", Glutes: "#06b6d4",
  Calves: "#22d3ee", Adductors: "#34d399", Abductors: "#2dd4bf",
};

export const DEFAULT_GYMS: Gym[] = [
  { name: "Club Vita, DLF Park Place", country: "India \u{1F1EE}\u{1F1F3}" },
  { name: "Srauta Wellness, Sec-17 Fbd", country: "India \u{1F1EE}\u{1F1F3}" },
];

export type MuscleGroup =
  | "Chest" | "Shoulders" | "Triceps"
  | "Back" | "Biceps" | "Forearms"
  | "Quads" | "Hamstrings" | "Glutes" | "Calves" | "Adductors" | "Abductors";

export const DAY_TARGETS: Record<DayType, MuscleGroup[]> = {
  Push: ["Chest", "Shoulders", "Triceps"],
  Pull: ["Back", "Biceps", "Forearms"],
  Legs: ["Quads", "Hamstrings", "Glutes", "Calves", "Adductors", "Abductors"],
  Arms: ["Biceps", "Triceps", "Forearms"],
};

export interface ExerciseVariation {
  label: string;
  opts: string[];
}

export interface ExerciseEntry {
  id: string;
  name: string;
  v?: ExerciseVariation[];
}

export interface PhysiqueEntry {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  height: number | null;
  fat: number | null;
  protein: number | null;
  salt: number | null;
  water: number | null;
  smm: number | null;
  bfm: number | null;
  bmi: number | null;
  bfp: number | null;
  whr: number | null;
  water_rate: number | null;
  bmr: number | null;
  score: number | null;
  bio_age: number | null;
  bio: Record<string, Record<string, number>> | null;
  assessments: Record<string, string> | null;
}

export interface Gym {
  name: string;
  country: string;
}

export interface LogExercise {
  name: string;
  barbellWeight: number;
  sets: LogSet[];
}

export interface LogSet {
  weight: number;
  reps: number;
  done: boolean;
}

export type ThemeName =
  | "blue" | "indigo" | "emerald" | "rose" | "amber" | "slate"
  | "anthracite" | "midnight" | "iron" | "ember" | "abyss" | "onyx";

export interface ThemeOption {
  name: ThemeName;
  label: string;
  dark: boolean;
  preview: string;
}

export const THEMES: ThemeOption[] = [
  { name: "blue", label: "Blue", dark: false, preview: "#0056a0" },
  { name: "indigo", label: "Indigo", dark: false, preview: "#4f46e5" },
  { name: "emerald", label: "Emerald", dark: false, preview: "#059669" },
  { name: "rose", label: "Rose", dark: false, preview: "#e11d48" },
  { name: "amber", label: "Amber", dark: false, preview: "#d97706" },
  { name: "slate", label: "Slate", dark: false, preview: "#475569" },
  { name: "anthracite", label: "Anthracite", dark: true, preview: "#a1a1aa" },
  { name: "midnight", label: "Midnight", dark: true, preview: "#3b82f6" },
  { name: "iron", label: "Iron", dark: true, preview: "#c0c0c0" },
  { name: "ember", label: "Ember", dark: true, preview: "#e77c4a" },
  { name: "abyss", label: "Abyss", dark: true, preview: "#00b4d8" },
  { name: "onyx", label: "Onyx", dark: true, preview: "#8b5cf6" },
];

export const COUNTRIES = [
  { name: "India", flag: "🇮🇳" },
  { name: "USA", flag: "🇺🇸" },
  { name: "UK", flag: "🇬🇧" },
  { name: "UAE", flag: "🇦🇪" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Germany", flag: "🇩🇪" },
];
