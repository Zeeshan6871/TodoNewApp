import { NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 });
    }

    const db = await getDb();
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.id),
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const attachments = await db
      .collection("attachments")
      .find({ taskId: task._id }, { projection: { data: 0 } })
      .toArray();

    return NextResponse.json({
      success: true,
      task: {
        id: task._id.toString(),
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        category: task.category || "General",
        tags: task.tags || [],
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        reminderAt: task.reminderAt ? task.reminderAt.toISOString() : null,
        reminderOffsetMinutes: task.reminderOffsetMinutes ?? null,
        reminderDismissed: Boolean(task.reminderDismissed),
        attachmentCount: attachments.length,
        attachments: attachments.map((a) => ({
          id: a._id.toString(),
          originalName: a.originalName,
          mimeType: a.mimeType,
          size: a.size,
          createdAt: a.createdAt,
        })),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt ? task.updatedAt.toISOString() : task.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("GET task detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 });
    }

    const body = await req.json();
    const updateFields = { updatedAt: new Date() };

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json({ success: false, error: "Title cannot be empty" }, { status: 400 });
      }
      updateFields.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateFields.description = String(body.description).trim();
    }

    if (body.status !== undefined) {
      if (["PENDING", "IN_PROGRESS", "COMPLETED"].includes(body.status)) {
        updateFields.status = body.status;
      }
    }

    if (body.priority !== undefined) {
      if (["LOW", "MEDIUM", "HIGH", "URGENT"].includes(body.priority)) {
        updateFields.priority = body.priority;
      }
    }

    if (body.category !== undefined) {
      updateFields.category = String(body.category).trim() || "General";
    }

    if (body.tags !== undefined) {
      updateFields.tags = Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
    }

    if (body.reminderDismissed !== undefined) {
      updateFields.reminderDismissed = Boolean(body.reminderDismissed);
    }

    // Handle dueDate and reminder recalculation
    if (body.dueDate !== undefined || body.reminderOffsetMinutes !== undefined) {
      const db = await getDb();
      const currentTask = await db.collection("tasks").findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(user.id),
      });

      if (!currentTask) {
        return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
      }

      const effectiveDueDate =
        body.dueDate !== undefined
          ? body.dueDate
            ? new Date(body.dueDate)
            : null
          : currentTask.dueDate;

      const effectiveOffset =
        body.reminderOffsetMinutes !== undefined
          ? body.reminderOffsetMinutes !== null
            ? parseInt(body.reminderOffsetMinutes, 10)
            : null
          : currentTask.reminderOffsetMinutes;

      updateFields.dueDate = effectiveDueDate;
      updateFields.reminderOffsetMinutes = effectiveOffset;

      if (effectiveDueDate && effectiveOffset !== null && !isNaN(effectiveOffset)) {
        updateFields.reminderAt = new Date(effectiveDueDate.getTime() - effectiveOffset * 60 * 1000);
        updateFields.reminderDismissed = false; // Reset dismissal on date change
      } else if (effectiveDueDate && effectiveOffset === 0) {
        updateFields.reminderAt = effectiveDueDate;
        updateFields.reminderDismissed = false;
      } else {
        updateFields.reminderAt = null;
      }
    }

    const db = await getDb();
    const result = await db.collection("tasks").findOneAndUpdate(
      { _id: new ObjectId(id), userId: new ObjectId(user.id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task: {
        id: result._id.toString(),
        title: result.title,
        description: result.description || "",
        status: result.status,
        priority: result.priority,
        category: result.category || "General",
        tags: result.tags || [],
        dueDate: result.dueDate ? result.dueDate.toISOString() : null,
        reminderAt: result.reminderAt ? result.reminderAt.toISOString() : null,
        reminderOffsetMinutes: result.reminderOffsetMinutes ?? null,
        reminderDismissed: Boolean(result.reminderDismissed),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH task error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 });
    }

    const db = await getDb();
    const taskId = new ObjectId(id);

    // Delete task
    const taskResult = await db.collection("tasks").deleteOne({
      _id: taskId,
      userId: new ObjectId(user.id),
    });

    if (taskResult.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // Cascade delete attachments in MongoDB
    await db.collection("attachments").deleteMany({ taskId });

    return NextResponse.json({ success: true, message: "Task and attachments deleted" });
  } catch (error) {
    console.error("DELETE task error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

