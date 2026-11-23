import crypto from "crypto";
import { getDb, ObjectId } from "./Cloud.js";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_EXPIRY_DAYS = 7;

/**
 * Hashes a plaintext password using crypto.scrypt.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored salt:hash string.
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Creates a new session in Cloud for the given user.
 */
export async function createSession(userId) {
  const db = await getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.collection("sessions").insertOne({
    userId: new ObjectId(userId),
    token,
    expiresAt,
    createdAt: new Date(),
  });

  return { token, expiresAt };
}

/**
 * Extracts session token from incoming request Cookie header.
 */
export function getSessionTokenFromRequest(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Retrieves the authenticated user from the database given a request.
 */
export async function getAuthenticatedUser(req) {
  const token = getSessionTokenFromRequest(req);
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection("sessions").findOne({
    token,
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const user = await db.collection("users").findOne(
    { _id: session.userId },
    { projection: { passwordHash: 0 } }
  );

  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

/**
 * Invalidate a session (logout).
 */
export async function deleteSession(token) {
  if (!token) return;
  const db = await getDb();
  await db.collection("sessions").deleteOne({ token });
}

export { SESSION_COOKIE_NAME };
