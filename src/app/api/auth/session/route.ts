import { NextResponse } from "next/server";
import { getSession, clearSessionCookieHeader } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const { rows } = await pool.query(
    "SELECT id, display_name, email FROM profiles WHERE id = $1",
    [session.userId]
  );

  if (rows.length === 0) {
    const res = NextResponse.json({ user: null });
    res.headers.set("Set-Cookie", clearSessionCookieHeader());
    return res;
  }

  return NextResponse.json({ user: rows[0] });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  return res;
}
