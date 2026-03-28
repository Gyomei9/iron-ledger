import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, sessionCookieHeader } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { displayName, email, password, code } = await req.json();

  if (code !== (process.env.REGISTRATION_CODE || "MyWorkoutPal")) {
    return NextResponse.json({ error: "Invalid registration code" }, { status: 403 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await pool.query("SELECT id FROM profiles WHERE LOWER(email) = LOWER($1)", [email]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    "INSERT INTO profiles (display_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, display_name, email",
    [displayName, email, hash]
  );

  const user = rows[0];
  const token = signToken({ userId: user.id, email: user.email, displayName: user.display_name });

  const res = NextResponse.json({ user: { id: user.id, display_name: user.display_name, email: user.email } });
  res.headers.set("Set-Cookie", sessionCookieHeader(token));
  return res;
}
