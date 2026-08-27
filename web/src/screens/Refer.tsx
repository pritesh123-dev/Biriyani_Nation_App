import { useState } from 'react';
import { useApp } from '../lib/store';
import { Loading, rupees } from '../components/ui';

export default function Refer() {
  const { config, user } = useApp();
  const [copied, setCopied] = useState(false);

  if (!config || !user) return <Loading />;

  const { referral, brand } = config;
  const code = user.referralCode;
  const done = user.referralsCompleted ?? 0;
  const message = `Get ${rupees(referral.friendDiscount)} off your first biriyani at ${brand.name}. Use my code ${code}.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unsupported */ }
  };

  return (
    <section style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px) 60px', display: 'flex', flexDirection: 'column', gap: 20 }} className="rise">
      <div>
        <span className="eyebrow-gold">Refer &amp; earn</span>
        <h1 style={{ margin: '9px 0 0', font: '400 clamp(28px,3.5vw,36px)/1.05 "Instrument Serif",serif' }}>
          Give {rupees(referral.friendDiscount)}. Get {referral.referrerCoins} coins.
        </h1>
        <p style={{ margin: '11px 0 0', font: '500 12.5px/1.65 Manrope,sans-serif', color: 'var(--text-55)' }}>
          Your friend's first biriyani comes with {rupees(referral.friendDiscount)} off. When they collect it, {referral.referrerCoins} Biriyani Coins land in your wallet.
        </p>
      </div>

      <div className="card" style={{ padding: 20, borderStyle: 'dashed', borderColor: 'var(--gold-line-50)', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <span className="eyebrow">Your code</span>
        <span style={{ font: '400 34px "Instrument Serif",serif', letterSpacing: '5px', color: 'var(--gold-soft)' }}>{code}</span>
        <button
          onClick={copy}
          style={{
            height: 42, padding: '0 22px', borderRadius: 12, cursor: 'pointer',
            background: 'rgba(227,174,78,.12)', border: '1px solid rgba(227,174,78,.45)',
            color: 'var(--gold-soft)', font: '800 12px Manrope,sans-serif',
          }}
        >
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank" rel="noreferrer"
          style={{
            flex: 1, height: 50, borderRadius: 'var(--r-md)', background: 'var(--whatsapp)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'var(--whatsapp-fg)', font: '800 12.5px Manrope,sans-serif',
          }}
        >
          WhatsApp
        </a>
        <button
          onClick={() => navigator.share?.({ text: message }).catch(() => {})}
          className="ghost-btn"
          style={{ flex: 1, height: 50 }}
        >
          More options
        </button>
      </div>

      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="eyebrow">Your streak</span>
          <span style={{ font: '700 11px Manrope,sans-serif', color: 'var(--gold)' }}>{done} of {referral.milestoneCount} friends</span>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          {Array.from({ length: referral.milestoneCount }).map((_, i) => (
            <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < done ? 'var(--gold)' : 'rgba(246,238,225,.12)' }} />
          ))}
        </div>
        <span style={{ font: '500 11.5px/1.5 Manrope,sans-serif', color: 'var(--text-45)' }}>
          Refer {referral.milestoneCount} and we send {referral.milestoneReward}.
        </span>
      </div>
    </section>
  );
}
