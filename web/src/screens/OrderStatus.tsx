import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useApp } from '../lib/store';
import { Loading, EmptyState, CoinDot, rupees } from '../components/ui';
import type { Order, OrderStatus as Status } from '../lib/types';

const STEPS: { key: Status; label: string; blurb: string }[] = [
  { key: 'placed', label: 'Order in', blurb: 'The kitchen has your order.' },
  { key: 'cooking', label: 'Dum on', blurb: 'Sealed under dough and cooking.' },
  { key: 'ready', label: 'Ready', blurb: 'Waiting hot at the counter for you.' },
  { key: 'collected', label: 'Collected', blurb: 'Enjoy your biriyani.' },
];

const POLL_MS = 20_000;

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getOrder(id ?? '');
      setOrder(res.order);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load that order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const live = order && order.status !== 'collected' && order.status !== 'cancelled';
    if (!live) return;
    timer.current = setInterval(() => { void load(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [order, load]);

  if (loading) return <Loading label="Fetching your order…" />;

  if (!order) {
    return (
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
        <EmptyState title="Order not found" body={error ?? 'We could not find that order.'} actionLabel="Back to home" onAction={() => navigate('/')} />
      </section>
    );
  }

  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.key === order.status));
  const cancelled = order.status === 'cancelled';
  const collected = order.status === 'collected';
  const readyAt = new Date(order.readyAt);

  return (
    <section style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px) 60px', display: 'flex', flexDirection: 'column', gap: 18 }} className="rise">
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 84, height: 84, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: cancelled ? 'var(--non-veg-wash)' : 'rgba(227,174,78,.14)',
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={cancelled ? 'var(--non-veg)' : 'var(--gold)'} strokeWidth={2.2} strokeLinecap="round">
            <path d="M4.5 12.5l5 5 10-11" />
          </svg>
        </div>
        <h1 style={{ margin: 0, font: '400 30px/1.1 "Instrument Serif",serif' }}>
          {cancelled ? 'Order cancelled' : collected ? 'Collected — enjoy!' : order.status === 'ready' ? 'Ready for pickup' : 'Your handi is on the fire'}
        </h1>
        <p style={{ margin: 0, font: '500 13px/1.6 Manrope,sans-serif', color: 'var(--text-55)', maxWidth: 320 }}>
          Order <span style={{ color: 'var(--gold)' }}>{order.orderNumber}</span>
          {cancelled ? ' was cancelled. Talk to the counter for a refund.'
            : collected ? ' is done. Thank you.'
            : order.status === 'ready' ? ' is waiting hot at the counter.'
            : ` will be ready around ${readyAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}.`}
        </p>
      </div>

      {!cancelled && !collected ? (
        <div style={{
          textAlign: 'center', padding: '22px 0', borderRadius: 22, background: 'rgba(227,174,78,.12)',
          border: '1px dashed var(--gold-line-50)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
        }}>
          <span className="eyebrow">Show this at the counter</span>
          <span style={{ font: '400 44px "Instrument Serif",serif', letterSpacing: '6px', color: 'var(--gold-soft)' }}>
            {order.pickupCode}
          </span>
          <span style={{ font: '500 11px Manrope,sans-serif', color: 'var(--text-45)' }}>
            {order.paymentMethod === 'counter' ? 'Pay when you collect' : order.paymentStatus === 'paid' ? 'Paid' : 'Confirm UPI payment at the counter'}
          </span>
        </div>
      ) : null}

      {!cancelled ? (
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((step, i) => (
              <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ height: 3, borderRadius: 2, background: i <= stepIndex ? 'var(--gold)' : 'rgba(246,238,225,.12)' }} />
                <span style={{ font: '700 9px Manrope,sans-serif', letterSpacing: '.06em', textTransform: 'uppercase', color: i <= stepIndex ? 'var(--gold-soft)' : 'var(--text-35)' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <span style={{ font: '600 12.5px Manrope,sans-serif', color: 'var(--text-70)' }}>{STEPS[stepIndex]?.blurb}</span>
        </div>
      ) : null}

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="eyebrow">Collect from</span>
        <div style={{ font: '700 13px Manrope,sans-serif' }}>{order.pickup.name}</div>
        <div style={{ font: '500 11px/1.5 Manrope,sans-serif', color: 'var(--text-45)' }}>{order.pickup.addressLine1}, {order.pickup.addressLine2}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={order.pickup.mapsUrl} target="_blank" rel="noreferrer" className="ghost-btn" style={{ flex: 1, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: '800 11.5px Manrope,sans-serif' }}>
            Open in Maps
          </a>
          <a href={`tel:${order.pickup.phone}`} className="ghost-btn" style={{ flex: 1, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: '800 11.5px Manrope,sans-serif' }}>
            Call the kitchen
          </a>
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
        <span className="eyebrow">Your order</span>
        {order.quote.lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <div style={{ font: '600 12.5px Manrope,sans-serif' }}>{line.dishName} × {line.qty}</div>
              <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--text-45)' }}>
                {line.packLabel}{line.addons.length ? ` · ${line.addons.map((a) => a.name).join(', ')}` : ''}
              </div>
            </span>
            <span style={{ font: '600 12.5px Manrope,sans-serif', color: 'var(--text-70)' }}>{rupees(line.lineTotal)}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'var(--hair)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ font: '800 14px Manrope,sans-serif' }}>{order.paymentStatus === 'paid' ? 'Paid' : 'To pay'}</span>
          <span style={{ font: '800 20px Manrope,sans-serif', color: 'var(--gold-soft)' }}>{rupees(order.quote.total)}</span>
        </div>
      </div>

      {!cancelled ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 13, padding: 16, borderRadius: 'var(--r-xl)',
          background: 'rgba(227,174,78,.12)', border: '1px solid rgba(227,174,78,.3)',
        }}>
          <CoinDot size={36} />
          <span>
            <div style={{ font: '800 14px Manrope,sans-serif', color: 'var(--gold-soft)' }}>
              {collected ? `+${order.quote.coinsEarned} Biriyani Coins` : `${order.quote.coinsEarned} coins on collection`}
            </div>
            <div style={{ font: '500 11px Manrope,sans-serif', color: 'var(--text-55)' }}>Balance {user?.coins ?? 0}</div>
          </span>
        </div>
      ) : null}

      <button className="gold-btn" onClick={() => navigate('/')}>Back to home</button>
    </section>
  );
}
