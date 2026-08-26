import type { StoreConfig } from './config.js';

export interface CartLineInput {
  dishId: string;
  packId: string;
  qty: number;
  addonIds?: string[];
}

export interface PricedLine {
  dishId: string;
  dishName: string;
  packId: string;
  packLabel: string;
  qty: number;
  unitPrice: number;
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

export class PricingError extends Error {}

/**
 * Prices a cart from the *server's* copy of the menu. The client sends
 * ids and quantities only — never money — so a tampered app cannot buy a
 * mutton family pack for ₹1.
 */
export function quoteCart(
  config: StoreConfig,
  lines: CartLineInput[],
  promoCode?: string | null,
): Quote {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new PricingError('Your cart is empty.');
  }
  if (lines.length > 30) {
    throw new PricingError('That is more items than we can cook in one order.');
  }

  const priced: PricedLine[] = lines.map((line) => {
    const dish = config.dishes.find((d) => d.id === line.dishId);
    if (!dish) throw new PricingError(`We no longer serve that dish.`);
    if (!dish.available) throw new PricingError(`${dish.name} is sold out today.`);

    const pack = dish.packs.find((p) => p.id === line.packId);
    if (!pack) throw new PricingError(`That pack size is not available for ${dish.name}.`);

    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 20) {
      throw new PricingError('Choose between 1 and 20 of each item.');
    }

    const addons = (line.addonIds ?? []).map((id) => {
      const addon = config.addons.find((a) => a.id === id);
      if (!addon) throw new PricingError('That add-on is no longer on the menu.');
      if (!addon.available) throw new PricingError(`${addon.name} is finished for today.`);
      return { id: addon.id, name: addon.name, price: addon.price };
    });

    const unitPrice = pack.price + addons.reduce((sum, a) => sum + a.price, 0);

    return {
      dishId: dish.id, dishName: dish.name,
      packId: pack.id, packLabel: pack.label,
      qty, unitPrice, addons,
      lineTotal: unitPrice * qty,
    };
  });

  const subtotal   = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  const itemCount  = priced.reduce((sum, l) => sum + l.qty, 0);

  if (config.pricing.minOrder > 0 && subtotal < config.pricing.minOrder) {
    throw new PricingError(`Minimum order is ₹${config.pricing.minOrder}.`);
  }

  const promo = config.pricing.promo;
  let discount = 0;
  let appliedPromo: string | null = null;
  if (
    promo?.active &&
    promoCode &&
    promoCode.trim().toUpperCase() === promo.code.toUpperCase() &&
    subtotal >= promo.minSubtotal
  ) {
    discount = Math.min(promo.amountOff, subtotal);
    appliedPromo = promo.code;
  }

  const packagingFee = config.pricing.packagingFee;
  const taxable = Math.max(0, subtotal - discount);
  const taxes   = Math.round(taxable * (config.pricing.taxPercent / 100));
  const total   = Math.max(0, taxable + packagingFee + taxes);

  return {
    lines: priced,
    itemCount,
    subtotal,
    packagingFee,
    taxes,
    discount,
    promoCode: appliedPromo,
    total,
    coinsEarned: Math.floor(total * config.pricing.coinsPerRupee),
  };
}
