import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const db = await getDb();
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection("users").findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user._id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

