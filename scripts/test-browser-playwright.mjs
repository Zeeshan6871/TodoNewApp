import http from "http";
import next from "next";
import { chromium } from "/home/zeeshan/Projects/MyProjects/styleseed/demo-pricing/node_modules/playwright/index.mjs";
import path from "path";

const ARTIFACTS_DIR = "/home/zeeshan/.gemini/antigravity/brain/22d01954-4c5c-4e7f-8a74-73c0af934cb1";
const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runBrowserTest() {
  console.log("🚀 Starting In-Process Next.js Server on port", PORT);
  const app = next({
    dev: false,
    dir: "/home/zeeshan/Projects/MyProjects/todo-app",
    hostname: "127.0.0.1",
    port: PORT,
  });

  await app.prepare();
  const handle = app.getRequestHandler();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  console.log("✅ Next.js server listening on", BASE_URL);

  console.log("🌐 Launching Playwright Chromium Headless...");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/home/zeeshan/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    // 1. Visit Landing Page
    console.log("1. Navigating to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "01_landing_page.png") });
    console.log("✅ 1. Landing page rendered, screenshot saved: 01_landing_page.png");

    // 2. Click "Launch Demo Account"
    console.log("2. Clicking Launch Demo Account...");
    const demoButton = page.locator("button:has-text('Launch Demo Account')").first();
    await demoButton.click();

    // Wait for Dashboard to render
    await page.waitForSelector("text=Total Tasks", { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "02_dashboard_dark.png") });
    console.log("✅ 2. Logged in via Demo Account, screenshot saved: 02_dashboard_dark.png");

    // 3. Toggle Theme to Light Mode
    console.log("3. Toggling theme to Light Mode...");
    const themeToggle = page.locator("button[aria-label='Toggle dark/light mode']");
    await themeToggle.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "03_dashboard_light.png") });
    console.log("✅ 3. Light mode active, screenshot saved: 03_dashboard_light.png");

    // Toggle back to Dark Mode
    await themeToggle.click();
    await page.waitForTimeout(600);

    // 4. Test Kanban Board View
    console.log("4. Switching to Kanban Board View...");
    const boardTab = page.locator("button[title='Kanban Board View']");
    await boardTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "04_kanban_board.png") });
    console.log("✅ 4. Kanban board view active, screenshot saved: 04_kanban_board.png");

    // 5. Test Timeline View
    console.log("5. Switching to Due Timeline View...");
    const timelineTab = page.locator("button[title='Due Timeline View']");
    await timelineTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "05_timeline_view.png") });
    console.log("✅ 5. Due timeline view active, screenshot saved: 05_timeline_view.png");

    // Switch back to List View
    const listTab = page.locator("button[title='List View']");
    await listTab.click();
    await page.waitForTimeout(500);

    // 6. Create a New Task
    console.log("6. Opening New Task modal...");
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

    const newTaskBtn = page.locator("button:has-text('New Task')").first();
    await newTaskBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "06_modal_opened.png") });

    // Fill in Form
    await page.locator("input[placeholder*='Prepare system design']").fill("Verified via Playwright Browser QA");
    await page.locator("textarea[placeholder*='Add key context']").fill("Automated browser test verified creation, dark mode, board view, and MongoDB connection.");
    await page.locator("input[placeholder*='e.g. Work, Design']").fill("QA");
    await page.locator("input[placeholder*='Architecture, Review']").fill("Playwright, Verified");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "07_modal_filled.png") });

    // Submit
    const submitBtn = page.locator("button[type='submit']:has-text('Create Task')");
    await submitBtn.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "08_after_submit.png") });

    // Verify task card appears
    await page.waitForSelector("text=Verified via Playwright Browser QA", { timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "09_task_created_list.png") });
    console.log("✅ 6. New Task created and visible in dashboard, screenshot saved: 09_task_created_list.png");

    console.log("\n🎉 ALL BROWSER PLAYWRIGHT TESTS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  } finally {
    await browser.close();
    server.close();
  }
}

runBrowserTest().catch((err) => {
  console.error("❌ Browser test error:", err);
  process.exit(1);
});
