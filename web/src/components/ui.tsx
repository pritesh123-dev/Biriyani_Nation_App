import { rupees } from '../lib/format';

export function VegMark({ veg }: { veg: boolean }) {
  return (
    <span
      className="veg-mark"
      style={{ color: veg ? 'var(--veg)' : 'var(--non-veg)' }}
      aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}
      role="img"
    />
  );
}

export function CoinDot({ size = 20 }: { size?: number }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(180deg,var(--gold-top),var(--gold-bottom))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        font: `800 ${size * 0.5}px Manrope,sans-serif`, color: 'var(--on-gold)',
        flex: 'none',
      }}
    >
      B
    </span>
  );
}

export function CoinBadge({ coins }: { coins: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '7px 12px 7px 8px', borderRadius: 'var(--r-pill)',
      background: 'rgba(227,174,78,.13)', border: '1px solid rgba(227,174,78,.3)',
    }}>
      <CoinDot size={19} />
      <span style={{ font: '800 12.5px Manrope,sans-serif', color: 'var(--gold-soft)' }}>
        {coins}
      </span>
    </span>
  );
}

export function Pill({ text, tone = 'gold' }: { text: string; tone?: 'gold' | 'red' | 'muted' }) {
  const map = {
    gold: { bg: 'rgba(227,174,78,.16)', fg: 'var(--gold-soft)', border: 'rgba(227,174,78,.4)' },
    red: { bg: 'var(--non-veg-wash)', fg: '#E2857B', border: 'rgba(192,69,58,.4)' },
    muted: { bg: 'var(--card)', fg: 'var(--text-55)', border: 'var(--hair)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 11px', borderRadius: 'var(--r-pill)',
      background: map.bg, border: `1px solid ${map.border}`,
      font: '700 9.5px Manrope,sans-serif', letterSpacing: '.12em',
      textTransform: 'uppercase', color: map.fg,
    }}>
      {text}
    </span>
  );
}

export function QtyStepper({
  qty, onChange, size = 'md',
}: { qty: number; onChange: (n: number) => void; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 34 : 48;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: size === 'sm' ? 10 : 14,
      height: h, padding: '0 12px', borderRadius: 'var(--r-sm)',
      background: 'rgba(227,174,78,.1)', border: '1px solid rgba(227,174,78,.3)',
    }}>
      <button
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
        style={{
          border: 0, background: 'transparent', color: 'var(--gold)', cursor: 'pointer',
          font: `800 ${size === 'sm' ? 15 : 18}px Manrope,sans-serif`, lineHeight: 1, padding: 4,
        }}
      >
        −
      </button>
      <span style={{
        font: `800 ${size === 'sm' ? 12.5 : 14}px Manrope,sans-serif`,
        color: 'var(--gold-soft)', minWidth: 12, textAlign: 'center',
      }}>
        {qty}
      </span>
      <button
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
        style={{
          border: 0, background: 'transparent', color: 'var(--gold)', cursor: 'pointer',
          font: `800 ${size === 'sm' ? 15 : 18}px Manrope,sans-serif`, lineHeight: 1, padding: 4,
        }}
      >
        +
      </button>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '11px 14px', borderRadius: 'var(--r-md)',
      background: 'var(--non-veg-wash)', border: '1px solid rgba(192,69,58,.35)',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--non-veg)', flex: 'none' }} />
      <span style={{ font: '600 12px Manrope,sans-serif', color: '#E2857B' }}>{message}</span>
    </div>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div className="spin" style={{
        width: 42, height: 42, borderRadius: '50%',
        border: '3px solid rgba(227,174,78,.2)', borderTopColor: 'var(--gold)',
      }} />
      {label ? <div style={{ font: '400 18px "Instrument Serif",serif', color: 'var(--text-55)' }}>{label}</div> : null}
    </div>
  );
}

export function EmptyState({
  title, body, actionLabel, onAction,
}: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div style={{
      padding: '60px 10px', textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32, border: '1px dashed rgba(227,174,78,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '400 26px "Instrument Serif",serif', color: 'var(--gold)',
      }}>
        B
      </div>
      <div style={{ font: '400 22px "Instrument Serif",serif' }}>{title}</div>
      <p style={{ font: '500 12px/1.6 Manrope,sans-serif', color: 'var(--text-45)', maxWidth: 260, margin: 0 }}>
        {body}
      </p>
      {actionLabel && onAction ? (
        <button className="gold-btn" onClick={onAction} style={{ height: 46, padding: '0 24px', marginTop: 6 }}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export { rupees };
