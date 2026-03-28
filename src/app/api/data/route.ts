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

  return NextResponse.json({
    workouts: workouts.rows,
    exercises: exercises.rows,
    sets: sets.rows,
    profiles: profiles.rows,
  });
}
