export interface Pack {
  id: string; label: string; serves: string; grams: string; price: number;
}

export interface Dish {
  id: string; name: string; veg: boolean; available: boolean;
  bestseller?: boolean; rating?: number;
  short: string; desc: string; image?: string;
  packs: Pack[]; sort: number;
}

export interface Addon {
  id: string; name: string; price: number; available: boolean;
}

export interface StoreConfig {
  version: number;
  updatedAt: string;
  openNow: boolean;
  brand: { name: string; tagline: string; established: string; heroImage?: string };
  store: {
    name: string; addressLine1: string; addressLine2: string; mapsUrl: string;
    phone: string; whatsapp: string; fssai: string;
    openTime: string; closeTime: string;
    prepMinutes: number; acceptingOrders: boolean; closedMessage: string;
  };
  dishes: Dish[];
  addons: Addon[];
  pricing: {
    taxPercent: number; packagingFee: number; coinsPerRupee: number;
    coinsForFreeMini: number; minOrder: number;
    promo: { code: string; amountOff: number; minSubtotal: number; active: boolean } | null;
  };
  payments: { payAtCounter: boolean; upi: boolean; upiId: string; upiPayeeName: string };
  referral: {
    enabled: boolean; friendDiscount: number; referrerCoins: number;
    milestoneCount: number; milestoneReward: string;
  };
  party: {
    enabled: boolean; headline: string; blurb: string;
    packs: { id: string; guests: string; name: string; sub: string }[];
  };
}

export interface User {
  phone: string;
  displayName: string | null;
  coins: number;
  orderCount: number;
  referralCode: string;
  referralsCompleted: number;
  memberSince: string;
}

export interface CartLineInput {
  dishId: string; packId: string; qty: number; addonIds?: string[];
}

/** A cart line held in app state, with a stable key for list rendering. */
export interface CartLine extends CartLineInput {
  key: string;
  addonIds: string[];
}

export interface PricedLine {
  dishId: string; dishName: string;
  packId: string; packLabel: string;
  qty: number; unitPrice: number;
  addons: { id: string; name: string; price: number }[];
  lineTotal: number;
}

export interface Quote {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  packagingFee: number;
  taxes: number;
  discount: number;
  promoCode: string | null;
  total: number;
  coinsEarned: number;
}

export type OrderStatus = 'placed' | 'cooking' | 'ready' | 'collected' | 'cancelled';

export interface Order {
  orderId: string;
  orderNumber: string;
  pickupCode: string;
  status: OrderStatus;
  quote: Quote;
  paymentMethod: 'counter' | 'upi';
  paymentStatus: 'pending' | 'paid';
  note: string | null;
  readyAt: string;
  createdAt: string;
  pickup: {
    name: string; addressLine1: string; addressLine2: string;
    mapsUrl: string; phone: string;
  };
}
