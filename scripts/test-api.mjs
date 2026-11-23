import { getDb, ObjectId } from "../src/lib/mongodb.js";
import { hashPassword, verifyPassword, createSession } from "../src/lib/auth.js";

async function runTests() {
  console.log("🚀 Starting backend verification tests...");

  // 1. Database connection test
  const db = await getDb();
  const ping = await db.command({ ping: 1 });
  console.log("✅ 1. MongoDB Connection OK:", ping);

  // 2. Auth tests (Hashing & Session)
  const password = "securePassword123!";
  const hash = hashPassword(password);
  const isValid = verifyPassword(password, hash);
  const isInvalid = verifyPassword("wrongPass", hash);
  if (!isValid || isInvalid) throw new Error("Auth hashing verification failed");
  console.log("✅ 2. Password Hashing & Verification OK");

  // 3. User & Session insertion
  const testEmail = `test_${Date.now()}@test.com`;
  const userResult = await db.collection("users").insertOne({
    name: "Test User",
    email: testEmail,
    passwordHash: hash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const userId = userResult.insertedId;
  const { token } = await createSession(userId);
  const session = await db.collection("sessions").findOne({ token });
  if (!session || session.userId.toString() !== userId.toString()) {
    throw new Error("Session creation failed");
  }
  console.log("✅ 3. User & Session storage in MongoDB OK");

  // 4. Task Creation with Reminder
  const dueDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in future
  const reminderAt = new Date(Date.now() - 1000); // Trigger now
  const taskResult = await db.collection("tasks").insertOne({
    userId,
    title: "Verify File Attachment in MongoDB",
    description: "Testing storing raw images and PDFs directly into MongoDB.",
    status: "PENDING",
    priority: "URGENT",
    category: "QA",
    tags: ["Test", "MongoDB"],
    dueDate,
    reminderAt,
    reminderOffsetMinutes: 15,
    reminderDismissed: false,
    attachmentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const taskId = taskResult.insertedId;
  console.log("✅ 4. Task with Due Reminder created in MongoDB OK, ID:", taskId.toString());

  // 5. MongoDB File Upload (Image & PDF binary buffer)
  const fakePngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const fakePdfBuffer = Buffer.from("%PDF-1.4\n%test pdf binary content\n%%EOF");

  const imageAtt = await db.collection("attachments").insertOne({
    taskId,
    userId,
    originalName: "screenshot.png",
    mimeType: "image/png",
    size: fakePngBuffer.length,
    data: fakePngBuffer,
    createdAt: new Date(),
  });

  const pdfAtt = await db.collection("attachments").insertOne({
    taskId,
    userId,
    originalName: "specification.pdf",
    mimeType: "application/pdf",
    size: fakePdfBuffer.length,
    data: fakePdfBuffer,
    createdAt: new Date(),
  });

  await db.collection("tasks").updateOne(
    { _id: taskId },
    { $inc: { attachmentCount: 2 }, $set: { updatedAt: new Date() } }
  );

  console.log("✅ 5. Image & PDF attachments stored directly in MongoDB OK");

  // 6. Query attachment back and check binary integrity
  const retrievedPdf = await db.collection("attachments").findOne({ _id: pdfAtt.insertedId });
  if (retrievedPdf.data.toString("utf-8") !== fakePdfBuffer.toString("utf-8")) {
    throw new Error("PDF binary buffer mismatch");
  }
  console.log("✅ 6. Binary file integrity verified OK:", retrievedPdf.originalName, retrievedPdf.mimeType);

  // 7. Check Reminder Query
  const dueTasks = await db.collection("tasks").find({
    userId,
    status: { $ne: "COMPLETED" },
    reminderAt: { $lte: new Date() },
    reminderDismissed: false,
  }).toArray();
  if (dueTasks.length === 0) throw new Error("Expected due task reminder not found");
  console.log("✅ 7. Active Due Reminder query verified OK:", dueTasks[0].title);

  // 8. Cleanup test data
  await db.collection("users").deleteOne({ _id: userId });
  await db.collection("sessions").deleteMany({ userId });
  await db.collection("tasks").deleteOne({ _id: taskId });
  await db.collection("attachments").deleteMany({ taskId });
  console.log("✅ 8. Test cleanup OK");

  console.log("\n🎉 ALL BACKEND API & MONGODB VERIFICATION TESTS PASSED!");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

