import crypto from 'node:crypto';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});
const STAGE = process.env.STAGE ?? 'prod';

/**
 * SSM Parameter Store (Standard tier) is free, unlike Secrets Manager's
 * $0.40/secret/month. Values are cached for the life of the execution
 * environment so a warm Lambda never re-reads them.
 */
const cache = new Map<string, { value: string; at: number }>();
const CACHE_MS = 5 * 60 * 1000;

export async function getSecret(name: string): Promise<string> {
  const hit = cache.get(name);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

  const r = await ssm.send(new GetParameterCommand({
    Name: `/biriyani-nation/${STAGE}/${name}`,
    WithDecryption: true,
  }));
  const value = r.Parameter?.Value;
  if (!value) throw new Error(`Missing SSM parameter: ${name}`);
  cache.set(name, { value, at: Date.now() });
  return value;
}

// ───────────────────────────── JWT (HS256) ─────────────────────────────
// Hand-rolled rather than pulling in jsonwebtoken: it is ~40 lines of
// crypto we fully control, and it keeps the Lambda bundle tiny (faster
// cold starts, which is most of what a low-traffic app pays for).

const b64url = (buf: Buffer | string) =>
  Buffer.from(buf).toString('base64url');

export interface Claims {
  sub: string;        // phone in E.164
  admin?: boolean;
  iat: number;
  exp: number;
}

export async function signToken(phone: string, admin = false): Promise<string> {
  const secret = await getSecret('jwt-secret');
  const now = Math.floor(Date.now() / 1000);
  const claims: Claims = {
    sub: phone,
    ...(admin ? { admin: true } : {}),
    iat: now,
    exp: now + 60 * 60 * 24 * 90,   // 90 days: customers should not re-OTP often
  };
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify(claims));
  const sig = crypto.createHmac('sha256', secret)
    .update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

export async function verifyToken(token: string): Promise<Claims | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;

  const secret = await getSecret('jwt-secret');
  const expected = crypto.createHmac('sha256', secret)
    .update(`${header}.${payload}`).digest('base64url');

  // Length check first: timingSafeEqual throws on mismatched lengths.
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Claims;
    if (claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

// ───────────────────────────── OTP hashing ─────────────────────────────
// The code is never stored in plaintext. If someone reads the table they
// still cannot log in as a customer.

export function hashOtp(phone: string, code: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(`${phone}:${code}`).digest('hex');
}

export function randomOtp(digits = 6): string {
  // crypto.randomInt is uniform — Math.random() is not, and an OTP is a
  // credential.
  const min = 10 ** (digits - 1);
  const max = 10 ** digits;
  return String(crypto.randomInt(min, max));
}

export const randomSalt = () => crypto.randomBytes(16).toString('hex');

/** Constant-time compare for hex digests of equal length. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Short, unambiguous pickup code shown at the counter (no O/0/I/1). */
export function pickupCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.randomBytes(4))
    .map((b) => alphabet[b % alphabet.length])
    .join('');
}
