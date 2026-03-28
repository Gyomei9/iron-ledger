import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workout, exercises } = await req.json();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      "INSERT INTO workouts (id, user_id, date, day_type, notes, gym, country) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [workout.id, session.userId, workout.date, workout.day_type, workout.notes, workout.gym, workout.country]
    );

    for (const ex of exercises) {
      await client.query(
        "INSERT INTO workout_exercises (id, workout_id, exercise_name, barbell_weight, exercise_order) VALUES ($1, $2, $3, $4, $5)",
        [ex.id, workout.id, ex.exercise_name, ex.barbell_weight, ex.exercise_order]
      );

      for (const s of ex.sets) {
        await client.query(
          "INSERT INTO exercise_sets (id, exercise_id, set_number, weight_kg, reps) VALUES ($1, $2, $3, $4, $5)",
          [s.id, ex.id, s.set_number, s.weight_kg, s.reps]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  // Verify ownership
  const { rows } = await pool.query("SELECT user_id FROM workouts WHERE id = $1", [id]);
  if (rows.length === 0 || rows[0].user_id !== session.userId) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
  }

  await pool.query("DELETE FROM workouts WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
