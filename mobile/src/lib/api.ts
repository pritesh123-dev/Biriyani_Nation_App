import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoreConfig, Quote, Order, User, CartLineInput } from './types';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? '';
const TOKEN_KEY = 'bn.token';
const CONFIG_CACHE_KEY = 'bn.config.v1';

if (!BASE && __DEV__) {
  console.warn('EXPO_PUBLIC_API_URL is not set — API calls will fail.');
}

// ─────────────────────────── token storage ───────────────────────────
// SecureStore keeps the session token in the Keychain / Android Keystore,
// not in plain AsyncStorage.

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken !== null) return cachedToken;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  return cachedToken;
}

export async function setToken(token: string | null): Promise<void> {
  cachedToken = token;
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // A device with no secure hardware should not crash the sign-in flow.
  }
}

// ─────────────────────────────── client ───────────────────────────────

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly retryAfter?: number) {
    super(message);
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
    const token = await getToken();
    if (!token) throw new ApiError('Please sign in again.', 401);
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  // A phone on a weak connection should fail fast, not hang forever.
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
    await setToken(null);
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
// The menu is cached on device so the app opens instantly and still
// works when the network is slow. A fresh copy is fetched in the
// background on every launch.

export async function loadCachedConfig(): Promise<StoreConfig | null> {
  try {
    const raw = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
    return raw ? (JSON.parse(raw) as StoreConfig) : null;
  } catch {
    return null;
  }
}

export async function cacheConfig(config: StoreConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
  } catch { /* a full disk should not break ordering */ }
}
