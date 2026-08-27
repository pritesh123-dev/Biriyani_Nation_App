import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { api, ApiError } from '../lib/api';
import { ErrorNote, rupees } from '../components/ui';
import type { Quote } from '../lib/types';

type Method = 'counter' | 'upi';

export default function Checkout() {
  const navigate = useNavigate();
  const { config, cart, clearCart, refreshUser } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [method, setMethod] = useState<Method>('counter');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(
    () => cart.map(({ dishId, packId, qty, addonIds }) => ({ dishId, packId, qty, addonIds })),
    [cart],
  );
  const promoCode = config?.pricing.promo?.active ? config.pricing.promo.code : undefined;

  useEffect(() => {
    if (!config) return;
    if (!config.payments.payAtCounter && config.payments.upi) setMethod('upi');
    if (!config.payments.upi && config.payments.payAtCounter) setMethod('counter');
  }, [config]);

  useEffect(() => {
    if (lines.length === 0) { navigate('/cart'); return; }
    (async () => {
      try {
        const res = await api.quote(lines, promoCode);
        setQuote(res.quote);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not price your order.');
      }
    })();
  }, [lines, promoCode, navigate]);

  const placeOrder = useCallback(async () => {
    if (placing || !quote) return;
    setPlacing(true);
    setError(null);
    try {
      const { order } = await api.createOrder({
        lines, promoCode, paymentMethod: method, note: note.trim() || undefined,
      });
      clearCart();
      void refreshUser();

      if (method === 'upi' && config?.payments.upiId) {
        const url =
          `upi://pay?pa=${encodeURIComponent(config.payments.upiId)}`
          + `&pn=${encodeURIComponent(config.payments.upiPayeeName)}`
          + `&am=${order.quote.total}&cu=INR&tn=${encodeURIComponent(order.orderNumber)}`;
        // A desktop browser has no UPI app to hand off to — only try on
        // something that plausibly does.
        if (/Android|iPhone/i.test(navigator.userAgent)) {
          window.location.href = url;
        }
      }

      navigate(`/order/${order.orderId}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not place your order.');
      setPlacing(false);
    }
  }, [placing, quote, lines, promoCode, method, note, clearCart, refreshUser, config, navigate]);

  if (!config) return null;

  return (
    <section style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px) 60px', display: 'flex', flexDirection: 'column', gap: 18 }} className="rise">
      <h1 style={{ margin: 0, font: '400 clamp(26px,3.5vw,32px)/1.05 "Instrument Serif",serif' }}>Checkout</h1>

      <div style={{
        padding: 20, borderRadius: 20, background: 'rgba(227,174,78,.12)',
        border: '1px solid rgba(227,174,78,.28)', display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <span className="eyebrow" style={{ color: 'var(--text-55)' }}>Amount payable</span>
        <span style={{ font: '400 40px/1 "Instrument Serif",serif', color: 'var(--gold-soft)' }}>
          {quote ? rupees(quote.total) : '—'}
        </span>
        <span style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--text-55)' }}>
          {quote?.itemCount ?? 0} items · pickup from {config.store.addressLine1}
        </span>
      </div>

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="eyebrow">Collect from</span>
        <div style={{ font: '700 13px Manrope,sans-serif' }}>{config.store.name}</div>
        <div style={{ font: '500 11px/1.5 Manrope,sans-serif', color: 'var(--text-45)' }}>
          {config.store.addressLine1}, {config.store.addressLine2}
        </div>
        <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--text-55)' }}>
          Ready about {config.store.prepMinutes} minutes after you order. We hold it hot for 30 minutes.
        </div>
        <a href={config.store.mapsUrl} target="_blank" rel="noreferrer" style={{ font: '700 11.5px Manrope,sans-serif', color: 'var(--gold)' }}>
          Open in Maps ›
        </a>
      </div>

      <span className="eyebrow">Pay using</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {config.payments.payAtCounter ? (
          <MethodRow active={method === 'counter'} onClick={() => setMethod('counter')} name="Pay at the counter" sub="Cash, card or UPI when you collect" />
        ) : null}
        {config.payments.upi ? (
          <MethodRow active={method === 'upi'} onClick={() => setMethod('upi')} name="Pay now by UPI" sub={config.payments.upiId} />
        ) : null}
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span className="eyebrow">Note for the kitchen (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          placeholder="Less spicy, extra raita…"
          rows={3}
          style={{
            borderRadius: 'var(--r-md)', padding: 14, background: 'var(--card)',
            border: '1px solid var(--hair)', color: 'var(--text)', font: '500 13px Manrope,sans-serif', resize: 'vertical',
          }}
        />
      </label>

      <ErrorNote message={error} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px',
        borderRadius: 'var(--r-md)', background: 'var(--card)', border: '1px solid var(--hair-soft)',
      }}>
        <span style={{ font: '600 10.5px Manrope,sans-serif', color: 'var(--text-45)' }}>
          No card details are stored. Refunds are handled at the counter within 48 hours.
        </span>
      </div>

      <button className="gold-btn" disabled={!config.openNow || !quote || placing} onClick={placeOrder}>
        {placing ? 'Placing order…'
          : !config.openNow ? 'Counter closed'
          : method === 'upi' ? `Pay ${quote ? rupees(quote.total) : ''} by UPI`
          : `Place order · ${quote ? rupees(quote.total) : ''}`}
      </button>
    </section>
  );
}

function MethodRow({ active, onClick, name, sub }: { active: boolean; onClick: () => void; name: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 13, padding: 16, borderRadius: 'var(--r-lg)',
        cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
        background: active ? 'rgba(227,174,78,.12)' : 'var(--card)',
        border: `1px solid ${active ? 'rgba(227,174,78,.6)' : 'var(--hair)'}`,
      }}
    >
      <span style={{ flex: 1 }}>
        <div style={{ font: '700 13.5px Manrope,sans-serif' }}>{name}</div>
        <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--text-45)' }}>{sub}</div>
      </span>
      <span style={{
        width: 19, height: 19, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.6px solid ${active ? 'var(--gold)' : 'rgba(246,238,225,.28)'}`,
      }}>
        {active ? <span style={{ width: 9, height: 9, borderRadius: 5, background: 'var(--gold)' }} /> : null}
      </span>
    </button>
  );
}
