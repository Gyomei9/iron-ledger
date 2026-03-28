import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [workouts, exercises, sets, profiles] = await Promise.all([
    pool.query("SELECT * FROM workouts ORDER BY date DESC"),
    pool.query("SELECT * FROM workout_exercises ORDER BY exercise_order"),
    pool.query("SELECT * FROM exercise_sets ORDER BY set_number"),
    pool.query("SELECT id, display_name, email FROM profiles"),
  ]);

  // pg driver returns numeric columns as strings — cast them to numbers
  const exerciseRows = exercises.rows.map((e: Record<string, unknown>) => ({
    ...e,
    barbell_weight: parseFloat(String(e.barbell_weight || 0)),
    exercise_order: parseInt(String(e.exercise_order || 0)),
  }));

  const setRows = sets.rows.map((s: Record<string, unknown>) => ({
    ...s,
    weight_kg: parseFloat(String(s.weight_kg || 0)),
    reps: parseInt(String(s.reps || 0)),
    set_number: parseInt(String(s.set_number || 0)),
  }));

  // pg returns date columns as JS Date objects; frontend expects YYYY-MM-DD strings
  const workoutRows = workouts.rows.map((w: Record<string, unknown>) => ({
    ...w,
    date: w.date instanceof Date ? w.date.toISOString().split("T")[0] : w.date,
  }));

  return NextResponse.json({
    workouts: workoutRows,
    exercises: exerciseRows,
    sets: setRows,
    profiles: profiles.rows,
  });
}
