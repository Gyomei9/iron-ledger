import { ExerciseEntry, MuscleGroup } from "./types";

export const EXERCISE_DB: Record<MuscleGroup, ExerciseEntry[]> = {
  Chest: [
    { id: "bench", name: "Bench Press", v: [{ label: "Angle", opts: ["Flat", "Incline", "Decline"] }, { label: "Equipment", opts: ["Barbell", "Dumbbell"] }] },
    { id: "fly", name: "Fly", v: [{ label: "Angle", opts: ["Flat", "Incline"] }, { label: "Equipment", opts: ["Dumbbell", "Cable"] }] },
    { id: "chestpress", name: "Chest Press", v: [{ label: "Type", opts: ["Machine", "Plate-Loaded"] }] },
    { id: "pushup", name: "Push-Up", v: [{ label: "Type", opts: ["Standard", "Wide", "Diamond", "Decline"] }] },
    { id: "crossover", name: "Cable Crossover" },
    { id: "pullover", name: "Dumbbell Pullover" },
    { id: "dips_chest", name: "Dips (Chest)" },
  ],
  Shoulders: [
    { id: "ohp", name: "Shoulder Press", v: [{ label: "Equipment", opts: ["Barbell", "Dumbbell", "Machine"] }] },
    { id: "lateral", name: "Lateral Raise", v: [{ label: "Equipment", opts: ["Dumbbell", "Cable"] }] },
    { id: "frontraise", name: "Front Raise", v: [{ label: "Equipment", opts: ["Dumbbell", "Cable", "Plate"] }] },
    { id: "rearraise", name: "Rear Delt Fly", v: [{ label: "Equipment", opts: ["Dumbbell", "Cable", "Machine"] }] },
    { id: "upright", name: "Upright Row", v: [{ label: "Equipment", opts: ["Barbell", "Dumbbell", "Cable"] }] },
    { id: "facepull", name: "Face Pull" },
    { id: "arnoldpress", name: "Arnold Press" },
    { id: "shrug", name: "Shrug", v: [{ label: "Equipment", opts: ["Barbell", "Dumbbell"] }] },
  ],
  Triceps: [
    { id: "pushdown", name: "Tricep Pushdown", v: [{ label: "Grip", opts: ["Rope", "Bar", "V-Bar"] }] },
    { id: "overhead_tri", name: "Overhead Extension", v: [{ label: "Equipment", opts: ["Dumbbell", "Cable", "EZ-Bar"] }] },
    { id: "skullcrusher", name: "Skull Crusher", v: [{ label: "Equipment", opts: ["EZ-Bar", "Barbell", "Dumbbell"] }] },
    { id: "closegrip", name: "Close-Grip Bench Press" },
    { id: "kickback", name: "Tricep Kickback" },
    { id: "dips_tri", name: "Dips (Triceps)" },
  ],
  Back: [
    { id: "pullup", name: "Pull-Up", v: [{ label: "Grip", opts: ["Wide", "Neutral", "Close"] }] },
    { id: "chinup", name: "Chin-Up" },
    { id: "latpull", name: "Lat Pulldown", v: [{ label: "Grip", opts: ["Wide", "Close", "Neutral", "Reverse"] }] },
    { id: "row", name: "Row", v: [{ label: "Equipment", opts: ["Barbell", "Dumbbell", "Cable", "Machine", "T-Bar"] }] },
    { id: "deadlift", name: "Deadlift", v: [{ label: "Type", opts: ["Conventional", "Sumo"] }] },
    { id: "seatedrow", name: "Seated Cable Row", v: [{ label: "Grip", opts: ["Close", "Wide", "Neutral"] }] },
    { id: "hyperext", name: "Hyperextension" },
  ],
  Biceps: [
    { id: "curl", name: "Bicep Curl", v: [{ label: "Equipment", opts: ["Barbell", "Dumbbell", "EZ-Bar", "Cable"] }] },
    { id: "hammer", name: "Hammer Curl", v: [{ label: "Equipment", opts: ["Dumbbell", "Cable"] }] },
    { id: "preacher", name: "Preacher Curl", v: [{ label: "Equipment", opts: ["EZ-Bar", "Dumbbell", "Machine"] }] },
    { id: "concentration", name: "Concentration Curl" },
    { id: "inclinecurl", name: "Incline Dumbbell Curl" },
    { id: "spidercurl", name: "Spider Curl" },
  ],
  Forearms: [
    { id: "wristcurl", name: "Wrist Curl", v: [{ label: "Equipment", opts: ["Barbell", "Dumbbell"] }] },
    { id: "reversecurl", name: "Reverse Curl", v: [{ label: "Equipment", opts: ["Barbell", "EZ-Bar"] }] },
    { id: "farmerwalk", name: "Farmer's Walk" },
  ],
  Quads: [
    { id: "squat", name: "Squat", v: [{ label: "Type", opts: ["Back Squat", "Front Squat", "Hack Squat", "Goblet"] }] },
    { id: "legpress", name: "Leg Press" },
    { id: "legext", name: "Leg Extension" },
    { id: "lunge", name: "Lunge", v: [{ label: "Type", opts: ["Walking", "Reverse", "Bulgarian Split"] }] },
    { id: "stepup", name: "Step-Up" },
    { id: "sissy", name: "Sissy Squat" },
  ],
  Hamstrings: [
    { id: "rdl", name: "Romanian Deadlift", v: [{ label: "Equipment", opts: ["Barbell", "Dumbbell"] }] },
    { id: "legcurl", name: "Leg Curl", v: [{ label: "Type", opts: ["Lying", "Seated", "Standing"] }] },
    { id: "sldl", name: "Stiff-Leg Deadlift" },
    { id: "goodmorning", name: "Good Morning" },
    { id: "nordiccurl", name: "Nordic Curl" },
  ],
  Glutes: [
    { id: "hipthrust", name: "Hip Thrust", v: [{ label: "Equipment", opts: ["Barbell", "Machine"] }] },
    { id: "glutebridge", name: "Glute Bridge" },
    { id: "kickbackglute", name: "Cable Kickback" },
    { id: "clamshell", name: "Clamshell" },
  ],
  Calves: [
    { id: "calfraise", name: "Calf Raise", v: [{ label: "Type", opts: ["Standing", "Seated", "Leg Press"] }] },
    { id: "donkeycalf", name: "Donkey Calf Raise" },
  ],
  Adductors: [
    { id: "adductor", name: "Hip Adduction", v: [{ label: "Equipment", opts: ["Machine", "Cable"] }] },
    { id: "copenhagenplank", name: "Copenhagen Plank" },
  ],
  Abductors: [
    { id: "abductor", name: "Hip Abduction", v: [{ label: "Equipment", opts: ["Machine", "Band"] }] },
    { id: "clamshellband", name: "Banded Clamshell" },
  ],
};

const BARBELL_EXERCISES = [
  "Bench Press", "Close-Grip Bench Press", "Squat", "Deadlift",
  "Romanian Deadlift", "Stiff-Leg Deadlift", "Shoulder Press",
  "Barbell Row", "Good Morning", "Skull Crusher", "Upright Row",
  "Hip Thrust", "Wrist Curl", "Reverse Curl",
];

export function detectBarbellWeight(name: string): number {
  const lower = name.toLowerCase();
  if (lower.includes("dumbbell") || lower.includes("cable") || lower.includes("machine") || lower.includes("bodyweight")) return 0;
  if (lower.includes("barbell") || lower.includes("ez-bar")) return 20;
  for (const b of BARBELL_EXERCISES) {
    if (lower.includes(b.toLowerCase())) return 20;
  }
  return 0;
}

export const COMPOUND_LIFTS = [
  "Bench Press", "Close-Grip Bench Press", "Squat", "Deadlift",
  "Romanian Deadlift", "Stiff-Leg Deadlift", "Shoulder Press",
  "Row", "Dips", "Pull-Up", "Chin-Up", "Hip Thrust", "Leg Press",
];

export function buildExerciseName(base: string, variations: string[]): string {
  const parts = [...variations, base].filter(Boolean);
  return parts.join(" ");
}
