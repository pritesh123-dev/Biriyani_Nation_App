import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  ok, created, badRequest, unauthorized, forbidden, notFound, tooMany, serverError,
  parseBody, authenticate, normalisePhone, maskPhone,
} from '../lib/http.js';
import {
  ddb, TABLE, K, getItem, putItem, deleteItem, ttlIn,
  QueryCommand, UpdateCommand,
} from '../lib/db.js';
import {
  signToken, hashOtp, randomOtp, randomSalt, safeEqual, pickupCode,
} from '../lib/auth.js';
import { sendOtp, type Channel } from '../lib/otp-sender.js';
import { loadConfig, saveConfig, withMediaUrls, isOpenNow, type StoreConfig } from '../lib/config.js';
import { quoteCart, PricingError, type CartLineInput } from '../lib/pricing.js';

// ─────────────────────────── OTP policy ───────────────────────────
const OTP_TTL_SECONDS   = 5 * 60;
const OTP_MAX_ATTEMPTS  = 5;
const OTP_SENDS_PER_HOUR = 5;
const OTP_RESEND_COOLDOWN = 30;   // seconds between sends to one number

const ORDER_STATUSES = ['placed', 'cooking', 'ready', 'collected', 'cancelled'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path   = '/' + (event.pathParameters?.proxy ?? '').replace(/^\/+|\/+$/g, '');

  if (method === 'OPTIONS') return ok({});

  try {
    return await route(method, path, event);
  } catch (err) {
    // Log the detail for CloudWatch; never leak internals to the client.
    console.error('Unhandled error', { method, path, err });
    return serverError();
  }
};

async function route(
  method: string,
  path: string,
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  // ── Public ──
  if (method === 'GET'  && path === '/health')            return ok({ ok: true });
  if (method === 'GET'  && path === '/config')            return handleGetConfig(event);
  if (method === 'POST' && path === '/auth/request-otp')  return handleRequestOtp(event);
  if (method === 'POST' && path === '/auth/verify-otp')   return handleVerifyOtp(event);

  // ── Customer (requires a valid token) ──
  if (method === 'GET'   && path === '/me')          return withAuth(event, handleGetMe);
  if (method === 'PATCH' && path === '/me')          return withAuth(event, handleUpdateMe);
  if (method === 'DELETE' && path === '/me')         return withAuth(event, handleDeleteMe);
  if (method === 'POST'  && path === '/cart/quote')  return withAuth(event, handleQuote);
  if (method === 'POST'  && path === '/orders')      return withAuth(event, handleCreateOrder);
  if (method === 'GET'   && path === '/orders')      return withAuth(event, handleListOrders);

  const orderMatch = path.match(/^\/orders\/([A-Za-z0-9-]+)$/);
  if (method === 'GET' && orderMatch) {
    return withAuth(event, (e, claims) => handleGetOrder(e, claims, orderMatch[1]));
  }

  // ── Kitchen admin ──
  if (method === 'GET' && path === '/admin/orders')  return withAdmin(event, handleAdminListOrders);
  if (method === 'PUT' && path === '/admin/config')  return withAdmin(event, handleAdminSaveConfig);
  if (method === 'GET' && path === '/admin/customers') return withAdmin(event, handleAdminListCustomers);

  const adminStatus = path.match(/^\/admin\/orders\/([A-Za-z0-9-]+)\/status$/);
  if (method === 'POST' && adminStatus) {
    return withAdmin(event, (e) => handleAdminSetStatus(e, adminStatus[1]));
  }

  return notFound(`No route for ${method} ${path}`);
}

// ───────────────────────── auth wrappers ─────────────────────────

type AuthedHandler = (
  event: APIGatewayProxyEventV2,
  claims: { sub: string; admin?: boolean },
) => Promise<APIGatewayProxyResultV2>;

async function withAuth(event: APIGatewayProxyEventV2, fn: AuthedHandler) {
  const claims = await authenticate(event);
  if (!claims) return unauthorized();
  return fn(event, claims);
}

async function withAdmin(event: APIGatewayProxyEventV2, fn: AuthedHandler) {
  const claims = await authenticate(event);
  if (!claims) return unauthorized();
  if (!claims.admin) return forbidden('Kitchen staff only.');
  return fn(event, claims);
}

const adminPhones = () =>
  (process.env.ADMIN_PHONES ?? '').split(',').map((s) => s.trim()).filter(Boolean);

// ─────────────────────────── config ───────────────────────────

async function handleGetConfig(event: APIGatewayProxyEventV2) {
  const config = withMediaUrls(await loadConfig());
  const etag = `"v${config.version}"`;

  // A phone that already has this version gets a 304 and downloads nothing.
  if ((event.headers?.['if-none-match'] ?? event.headers?.['If-None-Match']) === etag) {
    return { statusCode: 304, headers: { ETag: etag } };
  }

  return ok(
    {
      ...config,
      openNow: isOpenNow(config),
      // Only ever expose the menu the customer can actually order.
      dishes: config.dishes
        .filter((d) => d.available)
        .sort((a, b) => a.sort - b.sort),
      addons: config.addons.filter((a) => a.available),
    },
    { ETag: etag, 'Cache-Control': 'public, max-age=60' },
  );
}

// ──────────────────────────── OTP ────────────────────────────

async function handleRequestOtp(event: APIGatewayProxyEventV2) {
  const body = parseBody<{ phone?: string; channel?: Channel }>(event);
  const phone = normalisePhone(body?.phone ?? '');
  if (!phone) return badRequest('Enter a valid 10-digit Indian mobile number.');

  const configured = (process.env.OTP_CHANNEL ?? 'whatsapp') as Channel | 'both';
  const channel: Channel =
    configured === 'both' ? (body?.channel === 'sms' ? 'sms' : 'whatsapp') : configured;

  // Throttle: at most N sends per rolling hour, plus a short resend cooldown.
  const hourWindow = new Date().toISOString().slice(0, 13);   // yyyy-mm-ddTHH
  const rateKey = K.rate(phone, hourWindow);
  const rate = await getItem<{ count: number; lastSentAt: number }>(rateKey);

  if (rate) {
    if (rate.count >= OTP_SENDS_PER_HOUR) {
      return tooMany('Too many codes requested. Try again in an hour.', 3600);
    }
    const since = Math.floor(Date.now() / 1000) - rate.lastSentAt;
    if (since < OTP_RESEND_COOLDOWN) {
      return tooMany('Hold on a moment before asking for another code.', OTP_RESEND_COOLDOWN - since);
    }
  }

  const code = randomOtp(6);
  const salt = randomSalt();

  await putItem({
    ...K.otp(phone),
    hash: hashOtp(phone, code, salt),
    salt,
    attempts: 0,
    channel,
    ttl: ttlIn(OTP_TTL_SECONDS),
  });

  try {
    await sendOtp(phone, code, channel);
  } catch (err) {
    console.error('OTP send failed', { phone: maskPhone(phone), channel, err });
    await deleteItem(K.otp(phone));
    return serverError('We could not send the code right now. Please try again.');
  }

  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: rateKey,
    UpdateExpression: 'ADD #c :one SET lastSentAt = :now, #t = :ttl',
    ExpressionAttributeNames: { '#c': 'count', '#t': 'ttl' },
    ExpressionAttributeValues: {
      ':one': 1,
      ':now': Math.floor(Date.now() / 1000),
      ':ttl': ttlIn(3600),
    },
  }));

  return ok({
    sent: true,
    channel,
    phone: maskPhone(phone),
    expiresInSeconds: OTP_TTL_SECONDS,
    resendInSeconds: OTP_RESEND_COOLDOWN,
  });
}

async function handleVerifyOtp(event: APIGatewayProxyEventV2) {
  const body = parseBody<{ phone?: string; code?: string; referredBy?: string; name?: string }>(event);
  const phone = normalisePhone(body?.phone ?? '');
  const code  = String(body?.code ?? '').replace(/\D/g, '');
  const name  = body?.name?.trim().slice(0, 60) || undefined;

  if (!phone) return badRequest('Enter a valid mobile number.');
  if (code.length !== 6) return badRequest('Enter the 6-digit code.');

  const challenge = await getItem<{
    hash: string; salt: string; attempts: number;
  }>(K.otp(phone));

  if (!challenge) return badRequest('That code has expired. Request a new one.');

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await deleteItem(K.otp(phone));
    return tooMany('Too many wrong attempts. Request a new code.');
  }

  if (!safeEqual(hashOtp(phone, code, challenge.salt), challenge.hash)) {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: K.otp(phone),
      UpdateExpression: 'ADD attempts :one',
      ExpressionAttributeValues: { ':one': 1 },
    }));
    const left = OTP_MAX_ATTEMPTS - challenge.attempts - 1;
    return badRequest(
      left > 0 ? `That code is not right. ${left} attempt${left === 1 ? '' : 's'} left.`
               : 'That code is not right. Request a new one.',
    );
  }

  // Correct — burn the challenge so the same code cannot be replayed.
  await deleteItem(K.otp(phone));

  const isAdmin = adminPhones().includes(phone);
  const user = await upsertUser(phone, body?.referredBy, name);
  const token = await signToken(phone, isAdmin);

  return ok({ token, user: publicUser(user), admin: isAdmin });
}

// ─────────────────────────── customer ───────────────────────────

interface UserRow {
  pk: string; sk: string;
  phone: string;
  displayName?: string;
  coins: number;
  orderCount: number;
  totalSpent: number;
  referralCode: string;
  referredBy?: string;
  referralsCompleted: number;
  createdAt: string;
  lastSeenAt: string;
  marketingOptIn: boolean;
}

/**
 * Registering *is* verifying: the first successful OTP creates the
 * customer row. That row is the "list" of registered customers — query it
 * from /admin/customers or export it from DynamoDB.
 *
 * `name` comes from the sign-up screen. It only ever fills a blank —
 * a returning customer who leaves the field empty (or whose keyboard
 * autofilled something odd) never has an already-set name overwritten.
 * Deliberate changes go through PATCH /me instead.
 */
async function upsertUser(phone: string, referredBy?: string, name?: string): Promise<UserRow> {
  const now = new Date().toISOString();
  const existing = await getItem<UserRow>(K.user(phone));

  if (existing) {
    if (name && !existing.displayName) {
      await ddb.send(new UpdateCommand({
        TableName: TABLE,
        Key: K.user(phone),
        UpdateExpression: 'SET lastSeenAt = :now, displayName = :name',
        ExpressionAttributeValues: { ':now': now, ':name': name },
      }));
      return { ...existing, lastSeenAt: now, displayName: name };
    }
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: K.user(phone),
      UpdateExpression: 'SET lastSeenAt = :now',
      ExpressionAttributeValues: { ':now': now },
    }));
    return { ...existing, lastSeenAt: now };
  }

  const row: UserRow = {
    ...K.user(phone),
    phone,
    ...(name ? { displayName: name } : {}),
    coins: 0,
    orderCount: 0,
    totalSpent: 0,
    referralCode: referralCodeFor(phone),
    ...(referredBy ? { referredBy: referredBy.trim().toUpperCase() } : {}),
    referralsCompleted: 0,
    createdAt: now,
    lastSeenAt: now,
    marketingOptIn: true,
    // gsi1 lets the kitchen list every customer who signed up on a day.
    gsi1pk: `CUSTOMERS#${now.slice(0, 10)}`,
    gsi1sk: `${now}#${phone}`,
  } as UserRow & { gsi1pk: string; gsi1sk: string };

  await putItem(row);
  return row;
}

/** Stable, shareable code derived from the number — no collisions to manage. */
function referralCodeFor(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-6);
  return `BN${digits}`;
}

const publicUser = (u: UserRow) => ({
  phone: u.phone,
  displayName: u.displayName ?? null,
  coins: u.coins,
  orderCount: u.orderCount,
  referralCode: u.referralCode,
  referralsCompleted: u.referralsCompleted ?? 0,
  memberSince: u.createdAt,
});

async function handleGetMe(_event: APIGatewayProxyEventV2, claims: { sub: string }) {
  const user = await getItem<UserRow>(K.user(claims.sub));
  if (!user) return notFound('We could not find your account.');
  return ok({ user: publicUser(user) });
}

async function handleUpdateMe(event: APIGatewayProxyEventV2, claims: { sub: string }) {
  const body = parseBody<{ displayName?: string; marketingOptIn?: boolean }>(event);
  if (!body) return badRequest('Nothing to update.');

  const sets: string[] = [];
  const values: Record<string, unknown> = {};

  if (typeof body.displayName === 'string') {
    const name = body.displayName.trim().slice(0, 60);
    sets.push('displayName = :n');
    values[':n'] = name;
  }
  if (typeof body.marketingOptIn === 'boolean') {
    sets.push('marketingOptIn = :m');
    values[':m'] = body.marketingOptIn;
  }
  if (!sets.length) return badRequest('Nothing to update.');

  const r = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: K.user(claims.sub),
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW',
  }));
  return ok({ user: publicUser(r.Attributes as UserRow) });
}

/**
 * Account deletion. Both app stores require this for any app with
 * accounts, and it is the right thing to do regardless.
 *
 * Orders are kept but unlinked from the person: the kitchen still needs
 * its books (and Indian tax rules require retaining sales records), while
 * nothing in them points back to a customer any more.
 */
async function handleDeleteMe(_event: APIGatewayProxyEventV2, claims: { sub: string }) {
  const phone = claims.sub;

  // Collect the customer's order pointer rows so we can drop them.
  const owned = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `USER#${phone}`, ':prefix': 'ORDER#' },
    ProjectionExpression: 'sk, orderId',
  }));

  const pointers = (owned.Items ?? []) as { sk: string; orderId: string }[];

  // Anonymise the orders themselves before removing the account, so an
  // interrupted deletion can never leave an order still naming a
  // customer whose profile is gone.
  for (const p of pointers) {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: K.order(p.orderId),
      UpdateExpression: 'SET phone = :anon',
      ExpressionAttributeValues: { ':anon': 'deleted' },
    })).catch(() => { /* order already gone */ });
  }

  for (const p of pointers) {
    await deleteItem({ pk: `USER#${phone}`, sk: p.sk });
  }

  await deleteItem(K.user(phone));
  await deleteItem(K.otp(phone));

  console.log('Account deleted', { phone: maskPhone(phone), orders: pointers.length });
  return ok({ deleted: true, ordersAnonymised: pointers.length });
}

async function handleQuote(event: APIGatewayProxyEventV2) {
  const body = parseBody<{ lines?: CartLineInput[]; promoCode?: string }>(event);
  const config = await loadConfig();
  try {
    return ok({ quote: quoteCart(config, body?.lines ?? [], body?.promoCode) });
  } catch (err) {
    if (err instanceof PricingError) return badRequest(err.message);
    throw err;
  }
}

// ──────────────────────────── orders ────────────────────────────

interface OrderRow {
  pk: string; sk: string;
  orderId: string;
  orderNumber: string;
  pickupCode: string;
  phone: string;
  status: OrderStatus;
  quote: ReturnType<typeof quoteCart>;
  paymentMethod: 'counter' | 'upi';
  paymentStatus: 'pending' | 'paid';
  note?: string;
  readyAt: string;
  createdAt: string;
  updatedAt: string;
  gsi1pk: string;
  gsi1sk: string;
}

async function handleCreateOrder(event: APIGatewayProxyEventV2, claims: { sub: string }) {
  const body = parseBody<{
    lines?: CartLineInput[];
    promoCode?: string;
    paymentMethod?: 'counter' | 'upi';
    note?: string;
  }>(event);

  const config = await loadConfig();

  if (!isOpenNow(config)) {
    return badRequest(config.store.closedMessage);
  }

  const paymentMethod = body?.paymentMethod === 'upi' ? 'upi' : 'counter';
  if (paymentMethod === 'counter' && !config.payments.payAtCounter) {
    return badRequest('Pay at counter is not available right now.');
  }
  if (paymentMethod === 'upi' && !config.payments.upi) {
    return badRequest('UPI payment is not available right now.');
  }

  let quote;
  try {
    quote = quoteCart(config, body?.lines ?? [], body?.promoCode);
  } catch (err) {
    if (err instanceof PricingError) return badRequest(err.message);
    throw err;
  }

  const now      = new Date();
  const nowIso   = now.toISOString();
  const day      = nowIso.slice(0, 10);
  const orderId  = cryptoRandomId();
  const number   = await nextOrderNumber(day);
  const readyAt  = new Date(now.getTime() + config.store.prepMinutes * 60_000).toISOString();

  const order: OrderRow = {
    ...K.order(orderId),
    orderId,
    orderNumber: number,
    pickupCode: pickupCode(),
    phone: claims.sub,
    status: 'placed',
    quote,
    paymentMethod,
    // Both paths start pending: counter pays on collection, and a UPI
    // intent is only confirmed when the kitchen sees the money land.
    paymentStatus: 'pending',
    ...(body?.note ? { note: String(body.note).slice(0, 200) } : {}),
    readyAt,
    createdAt: nowIso,
    updatedAt: nowIso,
    gsi1pk: `ORDERS#${day}`,
    gsi1sk: `${nowIso}#${orderId}`,
  };

  await putItem(order);

  // Pointer row so the customer's history is a single cheap query.
  await putItem({
    ...K.userOrder(claims.sub, nowIso),
    orderId,
    orderNumber: number,
    status: 'placed',
    total: quote.total,
    itemCount: quote.itemCount,
    summary: quote.lines.map((l) => `${l.dishName} × ${l.qty}`).join(', '),
    createdAt: nowIso,
  });

  // Coins are credited on collection, not on placement, so a cancelled
  // order never mints currency.
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: K.user(claims.sub),
    UpdateExpression: 'ADD orderCount :one SET lastSeenAt = :now',
    ExpressionAttributeValues: { ':one': 1, ':now': nowIso },
  }));

  return created({ order: publicOrder(order, config) });
}

function publicOrder(o: OrderRow, config: StoreConfig) {
  return {
    orderId: o.orderId,
    orderNumber: o.orderNumber,
    pickupCode: o.pickupCode,
    status: o.status,
    quote: o.quote,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    note: o.note ?? null,
    readyAt: o.readyAt,
    createdAt: o.createdAt,
    pickup: {
      name: config.store.name,
      addressLine1: config.store.addressLine1,
      addressLine2: config.store.addressLine2,
      mapsUrl: config.store.mapsUrl,
      phone: config.store.phone,
    },
  };
}

async function handleListOrders(_event: APIGatewayProxyEventV2, claims: { sub: string }) {
  const r = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `USER#${claims.sub}`, ':prefix': 'ORDER#' },
    ScanIndexForward: false,      // newest first
    Limit: 30,
  }));
  return ok({ orders: r.Items ?? [] });
}

async function handleGetOrder(
  _event: APIGatewayProxyEventV2,
  claims: { sub: string },
  orderId: string,
) {
  const order = await getItem<OrderRow>(K.order(orderId));
  if (!order) return notFound('We could not find that order.');
  // Never let one customer read another's order by guessing an id.
  if (order.phone !== claims.sub) return forbidden();

  const config = await loadConfig();
  return ok({ order: publicOrder(order, config) });
}

/** Human-friendly daily sequence: BN-0426-07 is the 7th order on 26 Apr. */
async function nextOrderNumber(day: string): Promise<string> {
  const r = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: K.counter(day),
    // One row per day, expiring after a week, so nothing accumulates.
    UpdateExpression: 'ADD seq :one SET #t = :ttl',
    ExpressionAttributeNames: { '#t': 'ttl' },
    ExpressionAttributeValues: { ':one': 1, ':ttl': ttlIn(7 * 24 * 3600) },
    ReturnValues: 'UPDATED_NEW',
  }));
  const seq = Number((r.Attributes as { seq?: number })?.seq ?? 1);
  return `BN-${day.slice(5).replace('-', '')}-${String(seq).padStart(2, '0')}`;
}

function cryptoRandomId(): string {
  return globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

// ───────────────────────── kitchen admin ─────────────────────────

async function handleAdminListOrders(event: APIGatewayProxyEventV2) {
  const day = event.queryStringParameters?.day ?? new Date().toISOString().slice(0, 10);
  const r = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'gsi1',
    KeyConditionExpression: 'gsi1pk = :pk',
    ExpressionAttributeValues: { ':pk': `ORDERS#${day}` },
    ScanIndexForward: false,
    Limit: 200,
  }));

  const orders = (r.Items ?? []) as OrderRow[];
  return ok({
    day,
    count: orders.length,
    revenue: orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.quote.total, 0),
    orders: orders.map((o) => ({
      orderId: o.orderId,
      orderNumber: o.orderNumber,
      pickupCode: o.pickupCode,
      phone: o.phone,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: o.quote.total,
      note: o.note ?? null,
      items: o.quote.lines.map((l) => ({
        name: l.dishName, pack: l.packLabel, qty: l.qty,
        addons: l.addons.map((a) => a.name),
      })),
      createdAt: o.createdAt,
      readyAt: o.readyAt,
    })),
  });
}

async function handleAdminSetStatus(event: APIGatewayProxyEventV2, orderId: string) {
  const body = parseBody<{ status?: string; paymentStatus?: string }>(event);
  const status = body?.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) {
    return badRequest(`Status must be one of: ${ORDER_STATUSES.join(', ')}.`);
  }

  const order = await getItem<OrderRow>(K.order(orderId));
  if (!order) return notFound('No such order.');

  const nowIso = new Date().toISOString();
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: K.order(orderId),
    UpdateExpression: 'SET #s = :s, updatedAt = :now'
      + (body?.paymentStatus ? ', paymentStatus = :ps' : ''),
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':s': status, ':now': nowIso,
      ...(body?.paymentStatus ? { ':ps': body.paymentStatus } : {}),
    },
  }));

  // Keep the customer's history row in step.
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: K.userOrder(order.phone, order.createdAt),
    UpdateExpression: 'SET #s = :s',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': status },
  }));

  // Collected is the moment value is real: credit coins and spend now.
  if (status === 'collected' && order.status !== 'collected') {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: K.user(order.phone),
      UpdateExpression: 'ADD coins :c, totalSpent :t',
      ExpressionAttributeValues: {
        ':c': order.quote.coinsEarned,
        ':t': order.quote.total,
      },
    }));
  }

  return ok({ orderId, status });
}

async function handleAdminSaveConfig(event: APIGatewayProxyEventV2) {
  const body = parseBody<StoreConfig>(event);
  if (!body || !Array.isArray(body.dishes)) {
    return badRequest('Send the full config object, including dishes.');
  }
  const saved = await saveConfig(body);
  return ok({ config: saved });
}

async function handleAdminListCustomers(event: APIGatewayProxyEventV2) {
  const day = event.queryStringParameters?.day;
  if (!day) {
    return badRequest('Pass ?day=YYYY-MM-DD to list customers who registered that day.');
  }
  const r = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'gsi1',
    KeyConditionExpression: 'gsi1pk = :pk',
    ExpressionAttributeValues: { ':pk': `CUSTOMERS#${day}` },
    ScanIndexForward: false,
    Limit: 500,
  }));
  const users = (r.Items ?? []) as UserRow[];
  return ok({
    day,
    count: users.length,
    customers: users.map((u) => ({
      phone: u.phone,
      displayName: u.displayName ?? null,
      coins: u.coins,
      orderCount: u.orderCount,
      totalSpent: u.totalSpent,
      marketingOptIn: u.marketingOptIn,
      createdAt: u.createdAt,
    })),
  });
}
