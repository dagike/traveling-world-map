import { createHmac, timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { config } from "./config.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function sign(data: string): string {
  return createHmac("sha256", config.tokenSecret).update(data).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Returns a signed token proving admin access. */
export function createToken(): string {
  const payload = Buffer.from(JSON.stringify({ role: "admin", iat: Date.now() })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  return safeEqual(signature, sign(payload));
}

export function checkPassword(password: unknown): boolean {
  return typeof password === "string" && safeEqual(password, config.adminPassword);
}

/** Blocks mutating `/api` requests unless a valid admin token is present. */
export async function adminGuard(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (SAFE_METHODS.has(req.method)) return;
  if (!req.url.startsWith("/api/")) return;
  if (req.url === "/api/login") return;

  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!verifyToken(token)) {
    await reply.code(401).send({ error: "admin authentication required" });
  }
}
