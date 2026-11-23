# TaskFlow - Senior Full-Stack Todo & Task Application

> A senior-developer engineered Todo & Task Management platform featuring direct MongoDB attachment storage (images/PDFs), in-app Web Audio synthesizer reminder chimes, multi-view task dashboards (List, Kanban Board, Due Timeline), full user authentication (Login/Logout), and shadcn/ui with Dark & Light modes built in pure JavaScript.

---

## 🌟 Key Highlights

- **Pure JavaScript (No TypeScript)**: Clean, idiomatic ES6+ architecture with reusable components and clear separation of concerns.
- **MongoDB Direct Attachment Storage**: Images (`.png`, `.jpg`, `.webp`, `.svg`) and documents (`.pdf`) stored directly in MongoDB binary collections with zero disk dependency.
- **Embedded In-App Viewers**:
  - Image Lightbox with zoom, rotation, and download.
  - Native PDF Viewer Modal with embedded document iframe and download controls.
- **Smart Due Reminder System**:
  - Customizable reminder offsets (At due time, 5m before, 15m before, 1h before, 1d before).
  - Web Audio API synthesizer chime (2-tone melodic chord, 0 external audio files needed).
  - In-app toast notifications with "Snooze 5m" and "Dismiss" actions.
  - Real-time countdown / overdue badges with dynamic color alerts.
- **Task View Options**:
  - 📋 **List View**: Dense rows with status toggles, priority chips, tags, and attachment previews.
  - 📊 **Kanban Board View**: 3 workflow columns (To Do, In Progress, Completed) with item counts and quick move actions.
  - 📅 **Due Timeline View**: Time-bucketed view (Overdue, Due Today, Due This Week, Upcoming, No Due Date).
- **User Authentication & Session Management**:
  - User registration, login, and logout.
  - Native Node.js `crypto` (`scryptSync` password hashing and secure random session tokens).
  - One-Click **Demo Account** (`demo@taskflow.dev` / `demo123456`) pre-seeded with sample tasks and attachments.
- **shadcn/ui & Theme Support**:
  - Radix UI-inspired accessible primitives.
  - Seamless Dark and Light mode toggle with smooth CSS variable transitions and `localStorage` persistence.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js 18+ (tested on Node 24)
- MongoDB daemon running locally or a MongoDB Atlas URI

### 2. Configure Environment (`.env.local`)
Create a `.env.local` file (already configured for local development):
```env
MONGODB_URI=mongodb://127.0.0.1:27018
MONGODB_DB=todo_app
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Automated Testing
Run the comprehensive end-to-end integration test suite:
```bash
node scripts/test-e2e.mjs
```
Runs 13 automated tests covering:
1. Landing page render (HTTP 200)
2. Demo Account Login & session cookie assignment
3. Session persistence (`/api/auth/me`)
4. Task creation with due date and reminder
5. Image upload directly to MongoDB
6. PDF upload directly to MongoDB
7. Streaming PDF from MongoDB with correct MIME headers
8. Streaming Image from MongoDB
9. Active Due Reminder query check
10. Task completion status updates
11. Cascade deletion of task and attachments
12. User logout & cookie invalidation

# TodoNewApp
# TodoNewApp
# TodoNewApp
# TodoNewApp
# TodoNewApp
