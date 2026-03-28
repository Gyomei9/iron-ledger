import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    "SELECT * FROM physique_entries WHERE user_id = $1 ORDER BY date DESC",
    [session.userId]
  );
  return NextResponse.json({ entries: rows });
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entry = await req.json();
  await pool.query(
    `INSERT INTO physique_entries (user_id, date, weight, height, fat, protein, salt, water, smm, bfm, bmi, bfp, whr, water_rate, bmr, score, bio_age, bio, assessments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [
      session.userId, entry.date, entry.weight, entry.height,
      entry.fat, entry.protein, entry.salt, entry.water,
      entry.smm, entry.bfm, entry.bmi, entry.bfp, entry.whr, entry.water_rate,
      entry.bmr, entry.score, entry.bio_age,
      entry.bio ? JSON.stringify(entry.bio) : null,
      entry.assessments ? JSON.stringify(entry.assessments) : null,
    ]
  );
  return NextResponse.json({ ok: true });
}
