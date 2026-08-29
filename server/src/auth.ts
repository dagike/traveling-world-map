import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { config, isProduction } from "./config.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_PATHS = new Set(["/api/login", "/api/health"]);
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SCRYPT_KEYLEN = 64;

function sign(data: string): string {
  return createHmac("sha256", config.tokenSecret).update(data).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Produces a `salt:hash` string for storing in ADMIN_PASSWORD_HASH. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

function verifyScryptHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

interface TokenPayload {
  role: "admin";
  exp: number;
}

/** Returns a signed token proving admin access, valid for TOKEN_TTL_MS. */
export function createToken(): string {
  const payload: TokenPayload = { role: "admin", exp: Date.now() + TOKEN_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  if (!safeEqual(signature, sign(encoded))) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as TokenPayload;
    return payload.role === "admin" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(password: unknown): boolean {
  if (typeof password !== "string" || password.length === 0) return false;
  if (config.adminPasswordHash) {
    return verifyScryptHash(password, config.adminPasswordHash);
  }
  if (!isProduction && config.devAdminPassword) {
    return safeEqual(password, config.devAdminPassword);
  }
  return false;
}

/** Blocks mutating `/api` requests unless a valid admin token is present. */
export async function adminGuard(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (SAFE_METHODS.has(req.method)) return;

  const path = (req.url ?? "").split("?")[0]!.replace(/\/+$/, "") || "/";
  if (!path.includes("/api/")) return;
  for (const publicPath of PUBLIC_PATHS) {
    if (path.endsWith(publicPath)) return;
  }

  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!verifyToken(token)) {
    req.log.warn({ path, method: req.method }, "adminGuard blocked request");
    await reply.code(401).send({ error: "admin authentication required" });
  }
}
