import { NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const priority = searchParams.get("priority") || "ALL";
    const category = searchParams.get("category") || "ALL";
    const sort = searchParams.get("sort") || "created_desc";

    const db = await getDb();
    const query = { userId: new ObjectId(user.id) };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (priority && priority !== "ALL") {
      query.priority = priority;
    }

    if (category && category !== "ALL") {
      query.category = category;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { tags: { $in: [new RegExp(search.trim(), "i")] } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "created_asc") sortOptions = { createdAt: 1 };
    if (sort === "dueDate_asc") sortOptions = { dueDate: 1 };
    if (sort === "dueDate_desc") sortOptions = { dueDate: -1 };
    if (sort === "title_asc") sortOptions = { title: 1 };

    const tasks = await db.collection("tasks").find(query).sort(sortOptions).toArray();

    // Fetch attachments for these tasks (without the heavy raw data buffer)
    const taskIds = tasks.map((t) => t._id);
    const attachments = await db
      .collection("attachments")
      .find({ taskId: { $in: taskIds } }, { projection: { data: 0 } })
      .toArray();

    const attachmentMap = {};
    for (const att of attachments) {
      const tid = att.taskId.toString();
      if (!attachmentMap[tid]) attachmentMap[tid] = [];
      attachmentMap[tid].push({
        id: att._id.toString(),
        originalName: att.originalName,
        mimeType: att.mimeType,
        size: att.size,
        createdAt: att.createdAt,
      });
    }

    const formattedTasks = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      category: t.category || "General",
      tags: t.tags || [],
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      reminderAt: t.reminderAt ? t.reminderAt.toISOString() : null,
      reminderOffsetMinutes: t.reminderOffsetMinutes ?? null,
      reminderDismissed: Boolean(t.reminderDismissed),
      attachmentCount: attachmentMap[t._id.toString()]?.length || 0,
      attachments: attachmentMap[t._id.toString()] || [],
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt ? t.updatedAt.toISOString() : t.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, tasks: formattedTasks });
  } catch (error) {
    console.error("GET tasks error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description = "",
      status = "PENDING",
      priority = "MEDIUM",
      category = "General",
      tags = [],
      dueDate = null,
      reminderOffsetMinutes = null,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Task title is required" }, { status: 400 });
    }

    let parsedDueDate = null;
    let parsedReminderAt = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid due date format" }, { status: 400 });
      }

      if (reminderOffsetMinutes !== null && reminderOffsetMinutes !== undefined) {
        const offsetMs = parseInt(reminderOffsetMinutes, 10) * 60 * 1000;
        parsedReminderAt = new Date(parsedDueDate.getTime() - offsetMs);
      }
    }

    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const now = new Date();
    const db = await getDb();

    const insertResult = await db.collection("tasks").insertOne({
      userId: new ObjectId(user.id),
      title: title.trim(),
      description: description.trim(),
      status: ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status) ? status : "PENDING",
      priority: ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority) ? priority : "MEDIUM",
      category: category.trim() || "General",
      tags: cleanTags,
      dueDate: parsedDueDate,
      reminderAt: parsedReminderAt,
      reminderOffsetMinutes: reminderOffsetMinutes !== null ? parseInt(reminderOffsetMinutes, 10) : null,
      reminderDismissed: false,
      attachmentCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const newTask = {
      id: insertResult.insertedId.toString(),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category: category.trim() || "General",
      tags: cleanTags,
      dueDate: parsedDueDate ? parsedDueDate.toISOString() : null,
      reminderAt: parsedReminderAt ? parsedReminderAt.toISOString() : null,
      reminderOffsetMinutes: reminderOffsetMinutes !== null ? parseInt(reminderOffsetMinutes, 10) : null,
      reminderDismissed: false,
      attachmentCount: 0,
      attachments: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error("POST task error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

