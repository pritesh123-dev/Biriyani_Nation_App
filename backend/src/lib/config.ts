import { getItem, putItem, K } from './db.js';

/**
 * Everything a shop owner might want to change without shipping a new
 * build lives here: dish names, prices, photos, add-ons, opening hours,
 * the coin rate, even the store address and the "we are closed" switch.
 *
 * The app fetches this on launch and caches it. Edit it from the admin
 * endpoint (or the DynamoDB console) and every phone picks the change up
 * on next launch — no App Store review, no Play Store rollout.
 */

export interface Pack {
  id: string;
  label: string;
  serves: string;
  grams: string;
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  veg: boolean;
  available: boolean;
  bestseller?: boolean;
  rating?: number;
  short: string;
  desc: string;
  image?: string;          // absolute URL, or a key under the media CDN
  packs: Pack[];
  sort: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface StoreConfig {
  version: number;
  updatedAt: string;

  brand: {
    name: string;
    tagline: string;
    established: string;
    heroImage?: string;
  };

  store: {
    name: string;
    addressLine1: string;
    addressLine2: string;
    mapsUrl: string;
    phone: string;
    whatsapp: string;
    fssai: string;              // licence number, shown in-app as the law requires
    openTime: string;        // "11:00"
    closeTime: string;       // "23:00"
    prepMinutes: number;     // shown as "ready in N min"
    acceptingOrders: boolean;
    closedMessage: string;
  };

  dishes: Dish[];
  addons: Addon[];

  pricing: {
    taxPercent: number;
    packagingFee: number;
    coinsPerRupee: number;      // 0.1 => 1 coin per ₹10
    coinsForFreeMini: number;
    minOrder: number;
    promo: { code: string; amountOff: number; minSubtotal: number; active: boolean } | null;
  };

  payments: {
    payAtCounter: boolean;
    upi: boolean;
    upiId: string;
    upiPayeeName: string;
  };

  referral: {
    enabled: boolean;
    friendDiscount: number;
    referrerCoins: number;
    milestoneCount: number;
    milestoneReward: string;
  };

  party: {
    enabled: boolean;
    headline: string;
    blurb: string;
    packs: { id: string; guests: string; name: string; sub: string }[];
  };
}

export const DEFAULT_CONFIG: StoreConfig = {
  version: 1,
  updatedAt: new Date(0).toISOString(),

  brand: {
    name: 'Zayra Biryani',
    tagline: 'Sealed with dough. Dum-cooked 45 minutes. Collected hot from our counter.',
    established: 'Est. 2024 · Bhubaneswar',
  },

  store: {
    name: 'Zayra Biryani Kitchen',
    addressLine1: 'Plot 42, Patia Square',
    addressLine2: 'Bhubaneswar, Odisha 751024',
    mapsUrl: 'https://maps.google.com/?q=Patia+Square+Bhubaneswar',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    fssai: '',
    openTime: '11:00',
    closeTime: '23:00',
    prepMinutes: 25,
    acceptingOrders: true,
    closedMessage: 'The kitchen is resting. We open at 11 AM.',
  },

  dishes: [
    {
      id: 'chicken', name: 'Chicken Dum Biriyani', veg: false, available: true,
      bestseller: true, rating: 4.8, sort: 1,
      short: 'Kachi-style chicken, aged basmati, dough-sealed.',
      desc: 'Marinated overnight in hung curd and green chilli, layered raw with aged basmati, sealed under dough and dum-cooked for 45 minutes. Served with salan and raita.',
      packs: [
        { id: 'mini', label: 'Mini', serves: 'Serves 1', grams: '450 g', price: 249 },
        { id: 'regular', label: 'Regular', serves: 'Serves 2', grams: '800 g', price: 349 },
        { id: 'family', label: 'Family Pack', serves: 'Serves 4–5', grams: '1.8 kg', price: 499 },
      ],
    },
    {
      id: 'aloo', name: 'Aloo Dum Biriyani', veg: true, available: true,
      bestseller: true, rating: 4.6, sort: 2,
      short: 'Saffron-braised baby potatoes, fried onion.',
      desc: 'Baby potatoes braised in a saffron and mace gravy, layered with long-grain basmati, birista and mint. Our most-ordered vegetarian handi.',
      packs: [
        { id: 'mini', label: 'Mini', serves: 'Serves 1', grams: '450 g', price: 149 },
        { id: 'regular', label: 'Regular', serves: 'Serves 2', grams: '800 g', price: 199 },
        { id: 'family', label: 'Family Pack', serves: 'Serves 4–5', grams: '1.8 kg', price: 349 },
      ],
    },
    {
      id: 'paneer', name: 'Paneer Tikka Biriyani', veg: true, available: true,
      rating: 4.5, sort: 3,
      short: 'Charred paneer tikka, smoked rice.',
      desc: 'Malai paneer charred on the tandoor, folded into smoked basmati with cashew and kewra.',
      packs: [
        { id: 'mini', label: 'Mini', serves: 'Serves 1', grams: '450 g', price: 179 },
        { id: 'regular', label: 'Regular', serves: 'Serves 2', grams: '800 g', price: 259 },
        { id: 'family', label: 'Family Pack', serves: 'Serves 4–5', grams: '1.8 kg', price: 429 },
      ],
    },
    {
      id: 'egg', name: 'Egg Dum Biriyani', veg: false, available: true,
      rating: 4.4, sort: 4,
      short: 'Twin masala eggs, dum-finished.',
      desc: 'Whole eggs fried in a dark onion masala and dum-finished with the rice, so the yolk takes on the spice.',
      packs: [
        { id: 'mini', label: 'Mini', serves: 'Serves 1', grams: '450 g', price: 169 },
        { id: 'regular', label: 'Regular', serves: 'Serves 2', grams: '800 g', price: 229 },
        { id: 'family', label: 'Family Pack', serves: 'Serves 4–5', grams: '1.8 kg', price: 379 },
      ],
    },
    {
      id: 'mutton', name: 'Mutton Zafrani Biriyani', veg: false, available: true,
      rating: 4.9, sort: 5,
      short: 'Slow-cooked mutton, saffron milk.',
      desc: 'Shoulder mutton on the bone, cooked down for three hours, finished with saffron milk and rose water. Limited pots daily.',
      packs: [
        { id: 'mini', label: 'Mini', serves: 'Serves 1', grams: '450 g', price: 329 },
        { id: 'regular', label: 'Regular', serves: 'Serves 2', grams: '800 g', price: 449 },
        { id: 'family', label: 'Family Pack', serves: 'Serves 4–5', grams: '1.8 kg', price: 699 },
      ],
    },
  ],

  addons: [
    { id: 'raita',  name: 'Burani Raita',      price: 39, available: true },
    { id: 'salan',  name: 'Mirchi ka Salan',   price: 49, available: true },
    { id: 'meetha', name: 'Double ka Meetha',  price: 69, available: true },
  ],

  pricing: {
    taxPercent: 5,
    packagingFee: 0,
    coinsPerRupee: 0.1,
    coinsForFreeMini: 200,
    minOrder: 0,
    promo: { code: 'DUM50', amountOff: 50, minSubtotal: 300, active: true },
  },

  payments: {
    payAtCounter: true,
    upi: true,
    upiId: 'zayrabiryani@okaxis',
    upiPayeeName: 'Zayra Biryani',
  },

  referral: {
    enabled: true,
    friendDiscount: 100,
    referrerCoins: 150,
    milestoneCount: 5,
    milestoneReward: 'a Family Pack Chicken Dum on the house',
  },

  party: {
    enabled: true,
    headline: 'Host a party.\nWe cook the handi.',
    blurb: 'Birthdays, housewarmings, office lunches — we cook on site in copper handis and you collect straight from the pot. Tell us the headcount and the date; we will build the menu around it.',
    packs: [
      { id: 'p30',  guests: '30',   name: 'Get-together · 30 guests',   sub: '2 biriyanis, raita, salan, dessert' },
      { id: 'p60',  guests: '60',   name: 'Celebration · 60 guests',    sub: '3 biriyanis, kebab counter, dessert' },
      { id: 'p100', guests: '100',  name: 'Grand handi · 100+ guests',  sub: 'Live dum on site, server team, full menu' },
    ],
  },
};

/** Reads stored config, falling back to the defaults on a fresh stack. */
export async function loadConfig(): Promise<StoreConfig> {
  const row = await getItem<{ config: StoreConfig }>(K.config());
  if (!row?.config) return DEFAULT_CONFIG;
  // Merge so a config saved before a new field existed still boots.
  return { ...DEFAULT_CONFIG, ...row.config };
}

export async function saveConfig(config: StoreConfig): Promise<StoreConfig> {
  const next: StoreConfig = {
    ...config,
    version: (config.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  await putItem({ ...K.config(), config: next });
  return next;
}

/** Resolves bare S3 keys to CDN URLs so the admin can store either form. */
export function withMediaUrls(config: StoreConfig): StoreConfig {
  const base = process.env.MEDIA_BASE_URL ?? '';
  const abs = (v?: string) =>
    !v ? undefined : /^https?:\/\//.test(v) ? v : `${base}/${v.replace(/^\/+/, '')}`;

  return {
    ...config,
    brand: { ...config.brand, heroImage: abs(config.brand.heroImage) },
    dishes: config.dishes.map((d) => ({ ...d, image: abs(d.image) })),
  };
}

/** Is the counter open right now, in IST? */
export function isOpenNow(config: StoreConfig, now = new Date()): boolean {
  if (!config.store.acceptingOrders) return false;

  // Asia/Kolkata is UTC+5:30 year-round — no DST to worry about.
  const ist = new Date(now.getTime() + (5 * 60 + 30) * 60_000);
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const open  = toMinutes(config.store.openTime);
  const close = toMinutes(config.store.closeTime);

  // Handles a counter that closes after midnight (e.g. 11:00 → 02:00).
  return close > open
    ? minutes >= open && minutes < close
    : minutes >= open || minutes < close;
}
