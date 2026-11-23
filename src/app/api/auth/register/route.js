import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db = await getDb();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const now = new Date();

    const insertResult = await db.collection("users").insertOne({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: now,
      updatedAt: now,
    });

    const userId = insertResult.insertedId;
    const { token, expiresAt } = await createSession(userId);

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId.toString(),
        name: name.trim(),
        email: normalizedEmail,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
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
    console.error("Register error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

