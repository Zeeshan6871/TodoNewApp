import { NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid attachment ID" }, { status: 400 });
    }

    const db = await getDb();
    const attachment = await db.collection("attachments").findOne({
      _id: new ObjectId(id),
    });

    if (!attachment || !attachment.data) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const buffer = Buffer.isBuffer(attachment.data)
      ? attachment.data
      : attachment.data.buffer
      ? Buffer.from(attachment.data.buffer)
      : Buffer.from(attachment.data);

    // Escape filename for Content-Disposition header
    const safeFilename = encodeURIComponent(attachment.originalName);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType || "application/octet-stream",
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("GET attachment file error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Invalid attachment ID" }, { status: 400 });
    }

    const db = await getDb();
    const attachmentId = new ObjectId(id);

    const attachment = await db.collection("attachments").findOne({
      _id: attachmentId,
      userId: new ObjectId(user.id),
    });

    if (!attachment) {
      return NextResponse.json({ success: false, error: "Attachment not found" }, { status: 404 });
    }

    await db.collection("attachments").deleteOne({ _id: attachmentId });

    // Decrement task attachment count
    await db.collection("tasks").updateOne(
      { _id: attachment.taskId },
      { $inc: { attachmentCount: -1 }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Attachment deleted" });
  } catch (error) {
    console.error("DELETE attachment error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

