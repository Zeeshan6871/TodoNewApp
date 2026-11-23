import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    return NextResponse.json({
      success: true,
      authenticated: Boolean(user),
      user: user || null,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ success: false, authenticated: false, user: null, error: error.message }, { status: 500 });
  }
}

