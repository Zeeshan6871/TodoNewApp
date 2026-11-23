import { NextResponse } from "next/server";
import { deleteSession, getSessionTokenFromRequest, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req) {
  try {
    const token = getSessionTokenFromRequest(req);
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

