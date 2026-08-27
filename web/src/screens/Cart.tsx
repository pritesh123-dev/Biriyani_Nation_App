import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { api, ApiError } from '../lib/api';
import { QtyStepper, EmptyState, ErrorNote, CoinDot, rupees } from '../components/ui';
import heroImg from '../assets/hero-biriyani.jpg';
import type { Quote } from '../lib/types';

export default function Cart() {
  const navigate = useNavigate();
  const { config, cart, setLineQty, dishById, signedIn } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [pricing, setPricing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promoCode = config?.pricing.promo?.active ? config.pricing.promo.code : undefined;
  const lines = useMemo(
    () => cart.map(({ dishId, packId, qty, addonIds }) => ({ dishId, packId, qty, addonIds })),
    [cart],
  );

  const reprice = useCallback(async () => {
    if (!signedIn || lines.length === 0) { setQuote(null); return; }
    setPricing(true);
    setError(null);
    try {
      const res = await api.quote(lines, promoCode);
      setQuote(res.quote);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not price your cart.');
      setQuote(null);
    } finally {
      setPricing(false);
    }
  }, [signedIn, lines, promoCode]);

  useEffect(() => { void reprice(); }, [reprice]);

  const empty = cart.length === 0;

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px) 60px' }} className="rise">
      <h1 style={{ margin: 0, font: '400 clamp(28px,3.5vw,36px)/1.05 "Instrument Serif",serif' }}>Your cart</h1>

      {empty ? (
        <EmptyState
          title="Nothing sealed yet"
          body="Pick a handi from the menu and we'll start the dum."
          actionLabel="Browse the menu"
          onAction={() => navigate('/menu')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
          {!signedIn ? (
            <div style={{
              padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'rgba(227,174,78,.1)',
              border: '1px solid var(--gold-line-50)', font: '600 12.5px Manrope,sans-serif', color: 'var(--gold-soft)',
            }}>
              <button onClick={() => navigate('/login')} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit', textDecoration: 'underline' }}>
                Sign in
              </button>{' '}to see your total and place the order.
            </div>
          ) : null}

          {cart.map((line) => {
            const dish = dishById(line.dishId);
            const pack = dish?.packs.find((p) => p.id === line.packId);
            if (!dish || !pack) return null;
            const addonTotal = line.addonIds.reduce((s, id) => s + (config?.addons.find((a) => a.id === id)?.price ?? 0), 0);
            const lineTotal = (pack.price + addonTotal) * line.qty;

            return (
              <div key={line.key} className="card" style={{ display: 'flex', gap: 13, padding: 14 }}>
                <img src={dish.image || heroImg} alt={dish.name} style={{ width: 66, height: 66, borderRadius: 13, objectFit: 'cover', flex: 'none' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                  <div style={{ font: '700 14px Manrope,sans-serif' }}>{dish.name}</div>
                  <div style={{ font: '500 11px Manrope,sans-serif', color: 'var(--text-45)' }}>
                    {pack.label} · {pack.serves.toLowerCase()}
                    {line.addonIds.length ? ` · +${line.addonIds.length} add-on${line.addonIds.length > 1 ? 's' : ''}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }}>
                    <QtyStepper qty={line.qty} onChange={(n) => setLineQty(line.key, n)} size="sm" />
                    <span style={{ font: '800 14px Manrope,sans-serif', color: 'var(--gold-soft)' }}>{rupees(lineTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <ErrorNote message={error} />

          {quote?.promoCode ? (
            <div style={{
              padding: '13px 16px', borderRadius: 'var(--r-lg)', border: '1px dashed rgba(227,174,78,.4)',
              background: 'rgba(227,174,78,.06)', font: '700 12.5px Manrope,sans-serif', color: 'var(--gold-soft)',
            }}>
              {quote.promoCode} applied — {rupees(quote.discount)} off
            </div>
          ) : null}

          {quote ? (
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
              <span className="eyebrow">Bill details</span>
              <BillRow label="Item total" value={rupees(quote.subtotal)} />
              {quote.discount > 0 ? <BillRow label={`${quote.promoCode} discount`} value={`−${rupees(quote.discount)}`} color="var(--veg)" /> : null}
              {quote.packagingFee > 0 ? <BillRow label="Packaging" value={rupees(quote.packagingFee)} /> : null}
              <BillRow label="Taxes & charges" value={rupees(quote.taxes)} />
              <BillRow label="Pickup" value="FREE" color="var(--veg)" />
              <div style={{ height: 1, background: 'var(--hair)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: '800 14px Manrope,sans-serif' }}>To pay</span>
                <span style={{ font: '800 20px Manrope,sans-serif', color: 'var(--gold-soft)' }}>{rupees(quote.total)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 11, background: 'rgba(227,174,78,.12)' }}>
                <CoinDot size={17} />
                <span style={{ font: '700 11.5px Manrope,sans-serif', color: 'var(--gold-soft)' }}>
                  You'll earn {quote.coinsEarned} Biriyani Coins on this order
                </span>
              </div>
            </div>
          ) : pricing ? (
            <div style={{ padding: 20, textAlign: 'center', font: '500 12px Manrope,sans-serif', color: 'var(--text-45)' }}>
              Working out your bill…
            </div>
          ) : null}

          {config ? (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px' }}>
              <div>
                <div style={{ font: '700 12.5px Manrope,sans-serif' }}>Pickup — {config.store.addressLine1}</div>
                <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--text-45)' }}>
                  Ready in {config.store.prepMinutes} min · show your code at the counter
                </div>
              </div>
            </div>
          ) : null}

          {quote ? (
            <button
              className="gold-btn"
              disabled={!config?.openNow || pricing}
              onClick={() => navigate('/checkout')}
            >
              {config?.openNow ? `Continue to checkout · ${rupees(quote.total)}` : 'Counter closed'}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function BillRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', font: '600 12.5px Manrope,sans-serif', color: color ?? 'var(--text-70)' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
