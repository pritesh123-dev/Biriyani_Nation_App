import React, {
  createContext, useContext, useState, useCallback, useEffect, useMemo, useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getToken, setToken, loadCachedConfig, cacheConfig, ApiError } from './api';
import type { StoreConfig, User, CartLine, Quote, Dish } from './types';

const CART_KEY = 'bn.cart.v1';

interface AppState {
  ready: boolean;
  config: StoreConfig | null;
  configError: string | null;
  user: User | null;
  signedIn: boolean;

  cart: CartLine[];
  cartCount: number;
  /** Locally computed total — good enough for the badge; the server prices the order. */
  cartEstimate: number;

  addToCart: (line: Omit<CartLine, 'key'>) => void;
  setLineQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;

  refreshConfig: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  dishById: (id: string) => Dish | undefined;
}

const Ctx = createContext<AppState | null>(null);

/**
 * Drops cart lines whose dish or pack is no longer on the menu.
 *
 * Without this, a dish going sold-out or being renamed leaves a row the
 * cart screen cannot render (so the customer never sees it) but that the
 * server still rejects — the whole cart becomes un-priceable with an
 * error about a dish they cannot find. Pruning on every config refresh
 * keeps the cart and the live menu in step.
 */
function pruneCart(cart: CartLine[], config: StoreConfig | null): CartLine[] {
  if (!config) return cart;
  return cart.filter((line) => {
    const dish = config.dishes.find((d) => d.id === line.dishId);
    return !!dish?.packs.some((p) => p.id === line.packId);
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);

  const cartLoaded = useRef(false);

  const refreshConfig = useCallback(async () => {
    try {
      const fresh = await api.getConfig();
      if (fresh) {
        setConfig(fresh);
        setConfigError(null);
        void cacheConfig(fresh);
      }
    } catch (err) {
      // A cached menu is far better than an error screen.
      setConfigError(err instanceof ApiError ? err.message : 'Could not load the menu.');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user: u } = await api.me();
      setUser(u);
      setSignedIn(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setSignedIn(false);
      }
    }
  }, []);

  // Boot: cached menu first (instant), then network, then session.
  useEffect(() => {
    (async () => {
      const [cached, token, savedCart] = await Promise.all([
        loadCachedConfig(),
        getToken(),
        AsyncStorage.getItem(CART_KEY),
      ]);

      if (cached) setConfig(cached);
      if (savedCart) {
        try { setCart(JSON.parse(savedCart) as CartLine[]); } catch { /* ignore */ }
      }
      cartLoaded.current = true;

      if (token) {
        setSignedIn(true);
        void refreshUser();
      }

      await refreshConfig();
      setReady(true);
    })();
  }, [refreshConfig, refreshUser]);

  // Reconcile the saved cart against the menu we just fetched.
  useEffect(() => {
    if (!cartLoaded.current || !config) return;
    setCart((prev) => {
      const next = pruneCart(prev, config);
      return next.length === prev.length ? prev : next;
    });
  }, [config]);

  // Persist the cart so closing the app does not lose an order in progress.
  useEffect(() => {
    if (!cartLoaded.current) return;
    void AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((line: Omit<CartLine, 'key'>) => {
    setCart((prev) => {
      // Same dish, same pack, same add-ons: bump the quantity instead of
      // stacking a duplicate row.
      const signature = `${line.dishId}|${line.packId}|${[...line.addonIds].sort().join(',')}`;
      const existing = prev.find(
        (l) => `${l.dishId}|${l.packId}|${[...l.addonIds].sort().join(',')}` === signature,
      );
      if (existing) {
        return prev.map((l) =>
          l.key === existing.key ? { ...l, qty: Math.min(20, l.qty + line.qty) } : l,
        );
      }
      return [...prev, { ...line, key: `${signature}|${Date.now()}` }];
    });
  }, []);

  const setLineQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(20, qty) } : l)),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const signIn = useCallback(async (token: string, u: User) => {
    await setToken(token);
    setUser(u);
    setSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await setToken(null);
    await AsyncStorage.removeItem(CART_KEY);
    setUser(null);
    setSignedIn(false);
    setCart([]);
  }, []);

  const dishById = useCallback(
    (id: string) => config?.dishes.find((d) => d.id === id),
    [config],
  );

  const { cartCount, cartEstimate } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const line of cart) {
      const dish = config?.dishes.find((d) => d.id === line.dishId);
      const pack = dish?.packs.find((p) => p.id === line.packId);
      if (!dish || !pack) continue;      // menu changed under a stale cart
      const addons = line.addonIds.reduce(
        (sum, id) => sum + (config?.addons.find((a) => a.id === id)?.price ?? 0), 0,
      );
      count += line.qty;
      total += (pack.price + addons) * line.qty;
    }
    return { cartCount: count, cartEstimate: total };
  }, [cart, config]);

  const value: AppState = {
    ready, config, configError, user, signedIn,
    cart, cartCount, cartEstimate,
    addToCart, setLineQty, removeLine, clearCart,
    refreshConfig, refreshUser, signIn, signOut, dishById,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export type { Quote };
