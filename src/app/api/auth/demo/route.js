import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const db = await getDb();
    const demoEmail = "demo@taskflow.dev";

    let user = await db.collection("users").findOne({ email: demoEmail });

    if (!user) {
      const now = new Date();
      const insertUser = await db.collection("users").insertOne({
        name: "Alex Morgan",
        email: demoEmail,
        passwordHash: hashPassword("demo123456"),
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Morgan",
        createdAt: now,
        updatedAt: now,
      });

      user = {
        _id: insertUser.insertedId,
        name: "Alex Morgan",
        email: demoEmail,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Morgan",
      };

      // Seed realistic demo tasks
      const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const inTomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      await db.collection("tasks").insertMany([
        {
          userId: user._id,
          title: "Complete Q4 Product Roadmap & Architecture",
          description: "Finalize system architecture diagrams, review MongoDB storage indexing, and verify shadcn UI tokens.",
          status: "IN_PROGRESS",
          priority: "URGENT",
          category: "Work",
          tags: ["Engineering", "Roadmap"],
          dueDate: inTwoHours,
          reminderAt: inTwoHours,
          reminderOffsetMinutes: 0,
          reminderDismissed: false,
          attachmentCount: 1,
          createdAt: now,
          updatedAt: now,
        },
        {
          userId: user._id,
          title: "Review Design System & Dark Mode",
          description: "Audit light and dark color contrast, focus rings, and responsive layout across mobile and desktop views.",
          status: "PENDING",
          priority: "HIGH",
          category: "Design",
          tags: ["UI/UX", "Tailwind"],
          dueDate: inTomorrow,
          reminderAt: new Date(inTomorrow.getTime() - 15 * 60 * 1000),
          reminderOffsetMinutes: 15,
          reminderDismissed: false,
          attachmentCount: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          userId: user._id,
          title: "Setup MongoDB Automated Backup & Health Checks",
          description: "Configure nightly dump schedule and health check endpoints.",
          status: "COMPLETED",
          priority: "MEDIUM",
          category: "DevOps",
          tags: ["Database", "Maintenance"],
          dueDate: yesterday,
          reminderAt: null,
          reminderOffsetMinutes: null,
          reminderDismissed: true,
          attachmentCount: 0,
          createdAt: yesterday,
          updatedAt: now,
        },
      ]);
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
    console.error("Demo login error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

