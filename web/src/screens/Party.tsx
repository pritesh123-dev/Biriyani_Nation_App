import { useApp } from '../lib/store';
import { Loading } from '../components/ui';
import heroImg from '../assets/hero-biriyani.jpg';

export default function Party() {
  const { config } = useApp();
  if (!config) return <Loading />;

  const { party, store } = config;
  const waNumber = store.whatsapp.replace(/\D/g, '');

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px) 60px' }} className="rise">
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', height: 260, marginBottom: 28 }}>
        <img src={config.brand.heroImage || heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.75)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(11,9,6,.4),rgba(11,9,6,.85))' }} />
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
          <span className="eyebrow-gold">Catering</span>
          <div style={{ font: '400 clamp(28px,4vw,40px)/1.05 "Instrument Serif",serif', marginTop: 8, whiteSpace: 'pre-line' }}>
            {party.headline}
          </div>
        </div>
      </div>

      <p style={{ font: '500 13px/1.7 Manrope,sans-serif', color: 'var(--text-55)' }}>{party.blurb}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {party.packs.map((pack) => (
          <div key={pack.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13, flex: 'none', display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: 'rgba(227,174,78,.12)',
              border: '1px solid rgba(227,174,78,.28)', font: '400 17px "Instrument Serif",serif', color: 'var(--gold)',
            }}>
              {pack.guests}
            </div>
            <div>
              <div style={{ font: '700 13.5px Manrope,sans-serif' }}>{pack.name}</div>
              <div style={{ font: '500 11px/1.4 Manrope,sans-serif', color: 'var(--text-45)' }}>{pack.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24, padding: 24, borderRadius: 20, background: 'linear-gradient(150deg,rgba(227,174,78,.16),rgba(227,174,78,.03))',
        border: '1px solid rgba(227,174,78,.28)', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 460,
      }}>
        <div style={{ font: '400 22px/1.15 "Instrument Serif",serif' }}>Talk to us directly</div>
        <p style={{ margin: 0, font: '500 11.5px/1.6 Manrope,sans-serif', color: 'var(--text-55)' }}>
          Party orders are quoted by hand — message or call and we'll confirm the menu, timing and price the same day.
        </p>
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hi! I would like a quote for a party order.')}`}
          target="_blank" rel="noreferrer"
          style={{
            height: 52, borderRadius: 15, background: 'var(--whatsapp)', color: 'var(--whatsapp-fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, font: '800 13.5px Manrope,sans-serif',
          }}
        >
          WhatsApp {store.whatsapp}
        </a>
        <a href={`tel:${store.phone}`} className="ghost-btn" style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Call the kitchen
        </a>
        <span style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--text-35)', textAlign: 'center' }}>
          {store.openTime} – {store.closeTime}, all days · pickup and on-site catering
        </span>
      </div>
    </section>
  );
}
