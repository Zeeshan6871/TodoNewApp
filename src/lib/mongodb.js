import { MongoClient, ObjectId } from "mongodb";

// Determine MongoDB URI
const DEFAULT_SOCKET_URI =
  "mongodb://" +
  encodeURIComponent(
    "/home/zeeshan/.gemini/antigravity/scratch/mongo-socket/mongodb-27018.sock"
  );
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27018";
const DB_NAME = process.env.MONGODB_DB || "todo_app";

let client;
let clientPromise;

// In serverless environments (Vercel), cache the client promise globally to reuse
// active connection pools across function invocations and prevent connection exhaustion.
if (!global._mongoClientPromise) {
  if (process.env.MONGODB_URI) {
    // Cloud / Production MongoDB (e.g. MongoDB Atlas)
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    global._mongoClientPromise = client.connect();
  } else {
    // Local development with TCP / UNIX socket fallback
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    global._mongoClientPromise = client.connect().catch((err) => {
      console.warn("Retrying with UNIX socket URI due to TCP error:", err.message);
      const fallbackClient = new MongoClient(DEFAULT_SOCKET_URI, {
        serverSelectionTimeoutMS: 2500,
      });
      return fallbackClient.connect();
    });
  }
}

clientPromise = global._mongoClientPromise;

/**
 * Returns the MongoDB database instance.
 */
export async function getDb() {
  const connectedClient = await clientPromise;
  return connectedClient.db(DB_NAME);
}

/**
 * Ensures indexes exist on startup.
 */
export async function ensureIndexes() {
  try {
    const db = await getDb();

    // Users
    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    // Sessions
    await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
    await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Tasks
    await db.collection("tasks").createIndex({ userId: 1, status: 1 });
    await db.collection("tasks").createIndex({ userId: 1, dueDate: 1 });
    await db.collection("tasks").createIndex({ reminderAt: 1, reminderDismissed: 1 });

    // Attachments
    await db.collection("attachments").createIndex({ taskId: 1 });
    await db.collection("attachments").createIndex({ userId: 1 });
  } catch (error) {
    console.warn("Index check note:", error.message);
  }
}

export { ObjectId };

