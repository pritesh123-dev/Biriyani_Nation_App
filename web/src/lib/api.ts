import type { StoreConfig, Quote, Order, User, CartLineInput } from './types';

const BASE = import.meta.env.VITE_API_URL ?? '';
const TOKEN_KEY = 'bn.token';
const CONFIG_CACHE_KEY = 'bn.config.v1';

if (!BASE && import.meta.env.DEV) {
  console.warn('VITE_API_URL is not set — API calls will fail.');
}

// ─────────────────────────── token storage ───────────────────────────
// The browser has no Keychain/Keystore, so this is localStorage rather
// than the mobile app's SecureStore. That is a real, accepted trade-off
// of the web platform — the token is scoped to this origin only and
// never sent anywhere but this API, but a device-level compromise (e.g.
// another script on a shared/public machine) can read it. Fine for a
// low-value session token with a bounded lifetime; not fine for anything
// more sensitive.

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Safari private mode / storage-full: sign-in still works for this
    // page load, it just won't persist across a refresh.
  }
}

// ─────────────────────────────── client ───────────────────────────────

export class ApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, headers = {}, timeoutMs = 15000 } = opts;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError('Please sign in again.', 401);
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('That took too long. Check your connection and try again.', 0);
    }
    throw new ApiError('Cannot reach Zayra Biryani. Check your connection.', 0);
  }
  clearTimeout(timer);

  if (res.status === 304) return undefined as T;

  if (res.status === 401 && auth) {
    setToken(null);
    throw new ApiError('Your session expired. Please sign in again.', 401);
  }

  let payload: any = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { /* non-JSON error body */ }
  }

  if (!res.ok) {
    throw new ApiError(
      payload?.error ?? 'Something went wrong. Please try again.',
      res.status,
      payload?.retryAfter,
    );
  }

  return payload as T;
}

// ──────────────────────────── endpoints ────────────────────────────
// Same backend, same routes as the mobile app — this is the whole point
// of the PWA sharing infrastructure rather than duplicating it.

export const api = {
  checkPhone: (phone: string) =>
    request<{ exists: boolean }>(`/auth/check-phone?phone=${encodeURIComponent(phone)}`),

  requestOtp: (phone: string, channel?: 'sms' | 'whatsapp') =>
    request<{ sent: boolean; channel: string; phone: string; expiresInSeconds: number; resendInSeconds: number }>(
      '/auth/request-otp', { method: 'POST', body: { phone, channel } },
    ),

  verifyOtp: (phone: string, code: string, name?: string, referredBy?: string) =>
    request<{ token: string; user: User; admin: boolean }>(
      '/auth/verify-otp', { method: 'POST', body: { phone, code, name, referredBy } },
    ),

  getConfig: () => request<StoreConfig>('/config'),

  me: () => request<{ user: User }>('/me', { auth: true }),

  updateMe: (patch: { displayName?: string; marketingOptIn?: boolean }) =>
    request<{ user: User }>('/me', { method: 'PATCH', body: patch, auth: true }),

  deleteAccount: () =>
    request<{ deleted: boolean; ordersAnonymised: number }>('/me', { method: 'DELETE', auth: true }),

  quote: (lines: CartLineInput[], promoCode?: string) =>
    request<{ quote: Quote }>('/cart/quote', { method: 'POST', body: { lines, promoCode }, auth: true }),

  createOrder: (input: {
    lines: CartLineInput[];
    promoCode?: string;
    paymentMethod: 'counter' | 'upi';
    note?: string;
  }) => request<{ order: Order }>('/orders', { method: 'POST', body: input, auth: true }),

  listOrders: () =>
    request<{ orders: { orderId: string; orderNumber: string; status: string; total: number; summary: string; createdAt: string }[] }>(
      '/orders', { auth: true },
    ),

  getOrder: (orderId: string) =>
    request<{ order: Order }>(`/orders/${orderId}`, { auth: true }),
};

// ────────────────────────── config caching ──────────────────────────

export function loadCachedConfig(): StoreConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_CACHE_KEY);
    return raw ? (JSON.parse(raw) as StoreConfig) : null;
  } catch {
    return null;
  }
}

export function cacheConfig(config: StoreConfig): void {
  try {
    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}
