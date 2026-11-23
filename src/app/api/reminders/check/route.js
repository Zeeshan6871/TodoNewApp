import { NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, reminders: [] });
    }

    const db = await getDb();
    const now = new Date();

    // Query tasks whose reminder time has arrived, not completed, and not dismissed
    const dueTasks = await db
      .collection("tasks")
      .find({
        userId: new ObjectId(user.id),
        status: { $ne: "COMPLETED" },
        reminderAt: { $lte: now, $ne: null },
        reminderDismissed: false,
      })
      .sort({ reminderAt: -1 })
      .limit(10)
      .toArray();

    const reminders = dueTasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      priority: t.priority,
      category: t.category,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      reminderAt: t.reminderAt.toISOString(),
      isOverdue: t.dueDate ? new Date(t.dueDate) < now : false,
    }));

    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error("Check reminders error:", error);
    return NextResponse.json({ success: false, reminders: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, action, snoozeMinutes = 5 } = body;

    if (!taskId || !ObjectId.isValid(taskId)) {
      return NextResponse.json({ success: false, error: "Valid taskId is required" }, { status: 400 });
    }

    const db = await getDb();
    const taskObjectId = new ObjectId(taskId);

    if (action === "snooze") {
      const newReminderAt = new Date(Date.now() + snoozeMinutes * 60 * 1000);
      await db.collection("tasks").updateOne(
        { _id: taskObjectId, userId: new ObjectId(user.id) },
        { $set: { reminderAt: newReminderAt, reminderDismissed: false, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, message: `Snoozed for ${snoozeMinutes} minutes` });
    }

    // Default action: dismiss
    await db.collection("tasks").updateOne(
      { _id: taskObjectId, userId: new ObjectId(user.id) },
      { $set: { reminderDismissed: true, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Reminder dismissed" });
  } catch (error) {
    console.error("POST reminders action error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

