import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { api, ApiError } from '../lib/api';
import { Loading, CoinDot, ErrorNote, rupees } from '../components/ui';

interface OrderSummary {
  orderId: string; orderNumber: string; status: string; total: number; summary: string; createdAt: string;
}

export default function Account() {
  const navigate = useNavigate();
  const { config, user, refreshUser, signOut } = useApp();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.listOrders();
      setOrders(res.orders as OrderSummary[]);
    } catch { /* not worth an error screen */ }
  }, []);

  useEffect(() => { void loadOrders(); void refreshUser(); }, [loadOrders, refreshUser]);

  if (!config || !user) return <Loading />;

  const coins = user.coins;
  const target = config.pricing.coinsForFreeMini;
  const pct = Math.min(100, Math.round((coins / target) * 100));
  const toGo = Math.max(0, target - coins);

  const startEdit = () => { setName(user.displayName ?? ''); setNameError(null); setEditingName(true); };

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setNameError('Enter a name.'); return; }
    setSavingName(true);
    setNameError(null);
    try {
      await api.updateMe({ displayName: trimmed });
      await refreshUser();
      setEditingName(false);
    } catch (err) {
      setNameError(err instanceof ApiError ? err.message : 'Could not save your name.');
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = () => {
    if (!confirm('Sign out? You will need to verify your number again to order.')) return;
    signOut();
    navigate('/login');
  };

  const handleDelete = async () => {
    if (!confirm('Delete your account? Your profile, coins and order history will be removed. This cannot be undone.')) return;
    try { await api.deleteAccount(); } catch { /* sign out locally regardless */ }
    signOut();
    navigate('/');
  };

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px) 60px', display: 'flex', flexDirection: 'column', gap: 18 }} className="rise">
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 30, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--chip)', border: '1px solid rgba(227,174,78,.35)',
          font: '400 22px "Instrument Serif",serif', color: 'var(--gold)',
        }}>
          {initials(user.displayName, user.phone)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                style={{
                  height: 40, borderRadius: 10, padding: '0 12px', background: 'var(--card)',
                  border: '1px solid var(--gold-line)', color: 'var(--text)', font: '600 15px Manrope,sans-serif',
                }}
              />
              <button className="gold-btn" style={{ height: 40, padding: '0 16px' }} disabled={savingName} onClick={saveName}>
                {savingName ? 'Saving…' : 'Save'}
              </button>
              <button className="ghost-btn" style={{ height: 40, padding: '0 14px' }} onClick={() => setEditingName(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ font: '400 25px "Instrument Serif",serif' }}>{user.displayName || 'Add your name'}</div>
              <button onClick={startEdit} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '700 10.5px Manrope,sans-serif', color: 'var(--gold)' }}>
                Edit
              </button>
            </div>
          )}
          <div style={{ font: '600 11.5px Manrope,sans-serif', color: 'var(--text-45)' }}>
            {formatPhone(user.phone)} · {user.orderCount} order{user.orderCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>
      <ErrorNote message={nameError} />

      <div style={{
        padding: 20, borderRadius: 22, background: 'linear-gradient(150deg,rgba(227,174,78,.2),rgba(227,174,78,.03))',
        border: '1px solid rgba(227,174,78,.3)', display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span>
            <span className="eyebrow" style={{ display: 'block' }}>Biriyani Coins</span>
            <span style={{ font: '400 42px "Instrument Serif",serif', color: 'var(--gold-soft)' }}>{coins}</span>
          </span>
          <CoinDot size={44} />
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(11,9,6,.5)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold-bottom)' }} />
        </div>
        <span style={{ font: '600 11px Manrope,sans-serif', color: 'var(--text-55)' }}>
          {toGo > 0 ? `${toGo} coins to go for a free Mini biriyani` : 'A free Mini biriyani is yours — ask at the counter'}
        </span>
      </div>

      <span className="eyebrow">Recent orders</span>
      {orders.length === 0 ? (
        <p style={{ margin: 0, font: '500 13px Manrope,sans-serif', color: 'var(--text-45)' }}>
          No orders yet. Your first handi is waiting on the menu.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.slice(0, 10).map((o) => (
            <button
              key={o.orderId}
              onClick={() => navigate(`/order/${o.orderId}`)}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '700 12.5px Manrope,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.summary}</div>
                <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--text-45)' }}>{formatDate(o.createdAt)} · {o.orderNumber}</div>
              </span>
              <span style={{ textAlign: 'right' }}>
                <div style={{ font: '800 12.5px Manrope,sans-serif', color: 'var(--gold-soft)' }}>{rupees(o.total)}</div>
                <StatusTag status={o.status} />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <SettingRow label="Call the kitchen" value={config.store.phone} href={`tel:${config.store.phone}`} />
        <SettingRow label="Where to collect" value={config.store.addressLine1} href={config.store.mapsUrl} />
        <SettingRow label="Opening hours" value={`${config.store.openTime} – ${config.store.closeTime}`} />
        {config.store.fssai ? <SettingRow label="FSSAI licence" value={config.store.fssai} /> : null}
        <SettingRow label="Sign out" value="" onClick={handleSignOut} />
        <SettingRow label="Delete my account" value="" danger onClick={handleDelete} last />
      </div>
    </section>
  );
}

function SettingRow({
  label, value, href, onClick, danger, last,
}: { label: string; value: string; href?: string; onClick?: () => void; danger?: boolean; last?: boolean }) {
  const content = (
    <>
      <span style={{ font: '600 12.5px Manrope,sans-serif', color: danger ? 'var(--non-veg)' : 'var(--text-85)' }}>{label}</span>
      <span style={{ font: '600 11.5px Manrope,sans-serif', color: 'var(--text-35)' }}>{value}</span>
    </>
  );
  const style: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '15px 16px', borderBottom: last ? 'none' : '1px solid rgba(246,238,225,.05)',
    cursor: href || onClick ? 'pointer' : 'default', background: 'transparent', border: 0, width: '100%',
    textAlign: 'left', color: 'inherit', font: 'inherit',
  };
  if (href) return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={style}>{content}</a>;
  return <button onClick={onClick} style={style}>{content}</button>;
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    placed: { label: 'Placed', color: 'var(--gold)' },
    cooking: { label: 'Cooking', color: 'var(--gold)' },
    ready: { label: 'Ready', color: 'var(--veg)' },
    collected: { label: 'Collected', color: 'var(--text-35)' },
    cancelled: { label: 'Cancelled', color: 'var(--non-veg)' },
  };
  const tag = map[status] ?? { label: status, color: 'var(--text-35)' };
  return <div style={{ font: '700 9.5px Manrope,sans-serif', color: tag.color }}>{tag.label}</div>;
}

const initials = (name: string | null, phone: string) => {
  if (name?.trim()) return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return phone.slice(-2);
};
const formatPhone = (e164: string) => {
  const n = e164.replace(/^\+91/, '');
  return n.length === 10 ? `+91 ${n.slice(0, 5)} ${n.slice(5)}` : e164;
};
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
