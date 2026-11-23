import http from "http";
import assert from "assert";
import next from "next";

async function runE2E() {
  console.log("🚀 Starting Programmatic Next.js Server & End-to-End HTTP Tests...");

  const app = next({
    dev: false,
    dir: "/home/zeeshan/Projects/MyProjects/todo-app",
    hostname: "127.0.0.1",
    port: 3009,
  });

  await app.prepare();
  const handle = app.getRequestHandler();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => server.listen(3009, "127.0.0.1", resolve));
  const BASE_URL = "http://127.0.0.1:3009";
  console.log("✅ Next.js server listening on", BASE_URL);

  try {
    let cookie = "";

    // 1. Landing Page Test
    const pageRes = await fetch(`${BASE_URL}/`);
    assert.strictEqual(pageRes.status, 200, "Landing page should return 200");
    const pageHtml = await pageRes.text();
    assert(pageHtml.includes("TaskFlow"), "Landing page should contain TaskFlow branding");
    console.log("✅ 1. Landing page loaded successfully (HTTP 200)");

    // 2. Demo Login Test
    const demoRes = await fetch(`${BASE_URL}/api/auth/demo`, { method: "POST" });
    assert.strictEqual(demoRes.status, 200, "Demo login should return 200");
    const demoData = await demoRes.json();
    assert(demoData.success, "Demo login success should be true");
    assert(demoData.user.email, "Demo user should have email");

    const setCookie = demoRes.headers.get("set-cookie");
    assert(setCookie, "Response should set session_token cookie");
    cookie = setCookie.split(";")[0];
    console.log("✅ 2. Demo Account Login OK:", demoData.user.name, `(${demoData.user.email})`);

    // 3. /api/auth/me Verification
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookie },
    });
    const meData = await meRes.json();
    assert(meData.success && meData.authenticated, "Session should be authenticated");
    assert.strictEqual(meData.user.email, demoData.user.email);
    console.log("✅ 3. Session persistence verified via /api/auth/me");

    // 4. Fetch Tasks
    const tasksRes = await fetch(`${BASE_URL}/api/tasks`, {
      headers: { Cookie: cookie },
    });
    const tasksData = await tasksRes.json();
    assert(tasksData.success, "Fetch tasks should succeed");
    console.log("✅ 4. Loaded existing user tasks count:", tasksData.tasks.length);

    // 5. Create a new Task with Due Date and 15m Reminder
    const dueDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future
    const newTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: "Senior Architectural Review & Verification",
        description: "Perform end-to-end audit of attachments in MongoDB and audio reminder notifications.",
        priority: "URGENT",
        category: "Engineering",
        tags: ["Senior", "MongoDB", "Shadcn"],
        dueDate: dueDate.toISOString(),
        reminderOffsetMinutes: 15,
      }),
    });
    assert.strictEqual(newTaskRes.status, 201, "Task creation should return 201");
    const newTaskData = await newTaskRes.json();
    const createdTaskId = newTaskData.task.id;
    console.log("✅ 5. Created new task with due date & reminder:", createdTaskId);

    // 6. Upload an Image directly into MongoDB
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const imageBlob = new Blob([pngHeader], { type: "image/png" });
    const imageFormData = new FormData();
    imageFormData.append("file", imageBlob, "architecture-diagram.png");

    const imageUploadRes = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}/attachments`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: imageFormData,
    });
    assert.strictEqual(imageUploadRes.status, 201, "Image upload should return 201");
    const imageUploadData = await imageUploadRes.json();
    const imageAttId = imageUploadData.attachment.id;
    console.log("✅ 6. Image attachment stored directly into MongoDB:", imageUploadData.attachment.originalName);

    // 7. Upload a PDF directly into MongoDB
    const pdfContent = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF");
    const pdfBlob = new Blob([pdfContent], { type: "application/pdf" });
    const pdfFormData = new FormData();
    pdfFormData.append("file", pdfBlob, "api-specification.pdf");

    const pdfUploadRes = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}/attachments`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: pdfFormData,
    });
    assert.strictEqual(pdfUploadRes.status, 201, "PDF upload should return 201");
    const pdfUploadData = await pdfUploadRes.json();
    const pdfAttId = pdfUploadData.attachment.id;
    console.log("✅ 7. PDF attachment stored directly into MongoDB:", pdfUploadData.attachment.originalName);

    // 8. Stream PDF directly from MongoDB and verify Content-Type header
    const getPdfRes = await fetch(`${BASE_URL}/api/attachments/${pdfAttId}`);
    assert.strictEqual(getPdfRes.status, 200, "Attachment retrieval should return 200");
    assert.strictEqual(getPdfRes.headers.get("content-type"), "application/pdf", "MIME type must match");
    const pdfBuffer = await getPdfRes.arrayBuffer();
    assert.strictEqual(pdfBuffer.byteLength, pdfContent.length, "Byte length must match");
    console.log("✅ 8. Streamed PDF from MongoDB with correct headers (application/pdf, length:", pdfBuffer.byteLength, ")");

    // 9. Stream Image directly from MongoDB and verify Content-Type header
    const getImageRes = await fetch(`${BASE_URL}/api/attachments/${imageAttId}`);
    assert.strictEqual(getImageRes.status, 200, "Attachment retrieval should return 200");
    assert.strictEqual(getImageRes.headers.get("content-type"), "image/png", "MIME type must match");
    console.log("✅ 9. Streamed Image from MongoDB with correct headers (image/png)");

    // 10. Check Active Due Reminders
    const remindersRes = await fetch(`${BASE_URL}/api/reminders/check`, {
      headers: { Cookie: cookie },
    });
    const remindersData = await remindersRes.json();
    assert(remindersData.success, "Reminders check should succeed");
    const foundReminder = remindersData.reminders.find((r) => r.id === createdTaskId);
    assert(foundReminder, "Created task should be present in active due reminders");
    console.log("✅ 10. Active Due Reminder detected for task:", foundReminder.title);

    // 11. Update Task Status to COMPLETED
    const updateRes = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    const updateData = await updateRes.json();
    assert(updateData.success && updateData.task.status === "COMPLETED");
    console.log("✅ 11. Task status updated to COMPLETED");

    // 12. Delete Task and Verify Cascade Cleanup
    const deleteRes = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    const deleteData = await deleteRes.json();
    assert(deleteData.success, "Delete should succeed");

    const getDeletedPdfRes = await fetch(`${BASE_URL}/api/attachments/${pdfAttId}`);
    assert.strictEqual(getDeletedPdfRes.status, 404, "Cascade deleted attachment must return 404");
    console.log("✅ 12. Cascade deletion of MongoDB attachments verified OK");

    // 13. Logout Test
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    assert.strictEqual(logoutRes.status, 200);
    console.log("✅ 13. User Logout verified OK");

    console.log("\n🎉 ALL 13 END-TO-END HTTP INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
  } finally {
    server.close();
  }
  process.exit(0);
}

runE2E().catch((err) => {
  console.error("❌ E2E Test failed:", err);
  process.exit(1);
});
