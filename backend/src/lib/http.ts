import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { verifyToken, type Claims } from './auth.js';

export type Res = APIGatewayProxyResultV2;

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

export const json = (
  statusCode: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): Res => ({
  statusCode,
  headers: { ...BASE_HEADERS, ...extraHeaders },
  body: JSON.stringify(body),
});

export const ok      = (body: unknown, headers?: Record<string, string>) => json(200, body, headers);
export const created = (body: unknown) => json(201, body);
export const badRequest  = (message: string) => json(400, { error: message });
export const unauthorized = (message = 'Not signed in') => json(401, { error: message });
export const forbidden    = (message = 'Not allowed') => json(403, { error: message });
export const notFound     = (message = 'Not found') => json(404, { error: message });
export const tooMany   = (message: string, retryAfter?: number) =>
  json(429, { error: message, retryAfter }, retryAfter ? { 'Retry-After': String(retryAfter) } : {});
export const serverError = (message = 'Something went wrong') => json(500, { error: message });

export function parseBody<T>(event: APIGatewayProxyEventV2): T | null {
  if (!event.body) return null;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Reads and verifies the bearer token. Returns null when absent or invalid. */
export async function authenticate(event: APIGatewayProxyEventV2): Promise<Claims | null> {
  const header = event.headers?.authorization ?? event.headers?.Authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return verifyToken(header.slice(7));
}

/**
 * Normalises an Indian mobile number to E.164 and rejects anything that
 * is not a plausible mobile. Doing this at the edge means the rest of the
 * system only ever sees one representation of a customer.
 */
export function normalisePhone(input: string, defaultCountry = '91'): string | null {
  const digits = String(input ?? '').replace(/\D/g, '');
  if (!digits) return null;

  let national = digits;
  if (digits.length > 10 && digits.startsWith(defaultCountry)) {
    national = digits.slice(defaultCountry.length);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    national = digits.slice(1);
  }

  // Indian mobile numbers are 10 digits starting 6–9.
  if (!/^[6-9]\d{9}$/.test(national)) return null;
  return `+${defaultCountry}${national}`;
}

/** +919876543210 -> 98765 43210, for display and logs. */
export const maskPhone = (e164: string) => {
  const n = e164.replace(/^\+91/, '');
  return n.length === 10 ? `${n.slice(0, 5)} ${n.slice(5)}` : e164;
};
