import { NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB limit for Vercel Serverless payload compatibility

export async function POST(req, { params }) {
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

    const task = await db.collection("tasks").findOne({
      _id: taskId,
      userId: new ObjectId(user.id),
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${mimeType}. Allowed: PNG, JPG, WebP, SVG, PDF` },
        { status: 400 }
      );
    }

    const size = file.size;
    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds 4MB limit (${(size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const now = new Date();
    const insertResult = await db.collection("attachments").insertOne({
      taskId,
      userId: new ObjectId(user.id),
      originalName: file.name,
      mimeType,
      size,
      data: buffer,
      createdAt: now,
    });

    // Update attachmentCount on task
    await db.collection("tasks").updateOne(
      { _id: taskId },
      { $inc: { attachmentCount: 1 }, $set: { updatedAt: now } }
    );

    return NextResponse.json(
      {
        success: true,
        attachment: {
          id: insertResult.insertedId.toString(),
          originalName: file.name,
          mimeType,
          size,
          createdAt: now.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload attachment error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

