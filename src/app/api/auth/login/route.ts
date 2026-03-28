import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, sessionCookieHeader } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  let email = username;
  if (!email.includes("@")) {
    const { rows } = await pool.query(
      "SELECT email FROM profiles WHERE LOWER(display_name) = LOWER($1)",
      [username]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    email = rows[0].email;
  }

  const { rows } = await pool.query(
    "SELECT id, display_name, email, password_hash FROM profiles WHERE LOWER(email) = LOWER($1)",
    [email]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
  });

  const res = NextResponse.json({
    user: { id: user.id, display_name: user.display_name, email: user.email },
  });
  res.headers.set("Set-Cookie", sessionCookieHeader(token));
  return res;
}
