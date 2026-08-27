import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { VegMark, Loading, rupees } from '../components/ui';
import heroImg from '../assets/hero-biriyani.jpg';

const STATS = [
  { n: '5', label: 'Biriyanis on the menu' },
  { n: '45', label: 'Minutes under dum' },
  { n: '4.7', label: 'Average rating' },
  { n: '2024', label: 'Cooking since' },
];

const PROCESS = [
  { n: '01', title: 'Marinated to order', sub: 'Nothing sits pre-cooked. Meat and rice go in only after your order lands.' },
  { n: '02', title: 'Sealed under dough', sub: 'The pot is closed with a dough seal so the steam never escapes for 45 minutes.' },
  { n: '03', title: 'Ready at the counter', sub: 'Collect it hot, straight from the handi, with your pickup code.' },
];

export default function Home() {
  const { config } = useApp();
  const navigate = useNavigate();

  if (!config) return <Loading label="Warming the handi…" />;

  const hero = config.dishes.find((d) => d.bestseller) ?? config.dishes[0];
  const picks = config.dishes.filter((d) => d.id !== hero?.id).slice(0, 4);

  return (
    <div className="rise">
      {/* Hero */}
      <section style={{
        maxWidth: 1240, margin: '0 auto',
        padding: 'clamp(26px,5vw,70px) clamp(16px,3vw,32px) clamp(24px,4vw,48px)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
        gap: 'clamp(24px,4vw,56px)', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(15px,2vw,23px)', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 26, height: 1, background: 'var(--gold)' }} />
            <span className="eyebrow-gold">{config.brand.established}</span>
          </div>
          <h1 style={{
            margin: 0, font: '400 clamp(38px,6.4vw,72px)/.98 "Instrument Serif",serif',
            letterSpacing: '.5px',
          }}>
            Dum-cooked biriyani,<br />sealed and <span style={{ color: 'var(--gold)' }}>collected hot</span>.
          </h1>
          <p style={{
            margin: 0, font: '500 clamp(13px,1.2vw,16px)/1.7 Manrope,sans-serif',
            color: 'var(--text-55)', maxWidth: '52ch',
          }}>
            {config.brand.tagline} Pickup only — no delivery fee, no waiting on a rider.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/menu" className="gold-btn" style={{ height: 54, padding: '0 26px' }}>
              Order now
            </Link>
            {config.party.enabled ? (
              <Link to="/party" className="ghost-btn" style={{ height: 54, padding: '0 24px', display: 'inline-flex', alignItems: 'center' }}>
                Plan a party
              </Link>
            ) : null}
          </div>

          <div style={{
            marginTop: 6, padding: '16px 18px', borderRadius: 18,
            background: 'var(--card-alt)', border: '1px solid var(--hair-soft)',
            display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: 4,
              background: config.openNow ? 'var(--veg)' : 'var(--non-veg)', flex: 'none',
            }} />
            <div style={{ font: '600 12px Manrope,sans-serif', color: 'var(--text-55)' }}>
              {config.openNow
                ? `Open now · ready in ${config.store.prepMinutes} min · ${config.store.addressLine1}`
                : `Closed · ${config.store.closedMessage || `opens at ${config.store.openTime}`}`}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', minWidth: 0 }}>
          <div style={{
            position: 'relative', borderRadius: 'clamp(20px,2.5vw,30px)', overflow: 'hidden',
            border: '1px solid rgba(227,174,78,.26)', boxShadow: '0 40px 90px rgba(0,0,0,.5)',
          }}>
            <img
              src={hero?.image || heroImg}
              alt={hero?.name ?? 'Signature biriyani'}
              style={{ width: '100%', height: 'clamp(320px,42vw,540px)', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg,rgba(11,9,6,.34) 0%,transparent 34%,rgba(11,9,6,.92) 92%)',
            }} />
            <div style={{
              position: 'absolute', top: 18, left: 18, display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 13px', borderRadius: 999, background: 'rgba(11,9,6,.62)',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(227,174,78,.4)',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--gold)' }} />
              <span style={{ font: '800 9.5px Manrope,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold-soft)' }}>
                Most loved
              </span>
            </div>
            {hero ? (
              <div style={{
                position: 'absolute', left: 'clamp(16px,2vw,26px)', right: 'clamp(16px,2vw,26px)',
                bottom: 'clamp(16px,2vw,26px)', display: 'flex', alignItems: 'flex-end',
                justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <VegMark veg={hero.veg} />
                    <span style={{ font: '700 9.5px Manrope,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-55)' }}>
                      Signature · {config.store.prepMinutes} min dum
                    </span>
                  </div>
                  <div style={{ font: '400 clamp(24px,3vw,36px)/1 "Instrument Serif",serif' }}>{hero.name}</div>
                  <div style={{ font: '600 12px Manrope,sans-serif', color: 'var(--text-55)' }}>
                    {hero.rating ? `★ ${hero.rating} · ` : ''}from {rupees(Math.min(...hero.packs.map((p) => p.price)))}
                  </div>
                </div>
                <button className="gold-btn" style={{ height: 48, padding: '0 22px' }} onClick={() => navigate(`/dish/${hero.id}`)}>
                  View dish
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid var(--hair-soft)', borderBottom: '1px solid var(--hair-soft)', background: 'rgba(21,17,11,.6)' }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: 'clamp(20px,2.5vw,30px) clamp(16px,3vw,32px)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 'clamp(16px,2vw,30px)',
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
              <span style={{ font: '400 clamp(24px,2.6vw,32px)/1 "Instrument Serif",serif', color: 'var(--gold-soft)' }}>{s.n}</span>
              <span style={{ font: '600 11px/1.4 Manrope,sans-serif', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-45)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Handi picks */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(34px,4.5vw,64px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0 }}>
            <span className="eyebrow-gold">Handi picks</span>
            <h2 style={{ margin: 0, font: '400 clamp(28px,3.8vw,44px)/1.03 "Instrument Serif",serif' }}>
              Four pots we can<br />barely keep up with.
            </h2>
          </div>
          <Link to="/menu" style={{ font: '800 12.5px Manrope,sans-serif', color: 'var(--gold)' }}>See the full menu ›</Link>
        </div>

        <div style={{
          marginTop: 'clamp(20px,2.6vw,32px)', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'clamp(14px,1.8vw,22px)',
        }}>
          {picks.map((d) => (
            <Link
              key={d.id}
              to={`/dish/${d.id}`}
              className="card"
              style={{ overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', color: 'var(--text)' }}
            >
              <div style={{ position: 'relative', height: 'clamp(150px,15vw,190px)', background: 'var(--well)' }}>
                {d.image ? (
                  <img src={d.image} alt={d.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', font: '400 24px "Instrument Serif",serif', color: 'rgba(227,174,78,.3)' }}>B</div>
                )}
              </div>
              <div style={{ padding: 15, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <VegMark veg={d.veg} />
                  <span style={{ font: '700 9px Manrope,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-45)' }}>
                    {d.veg ? 'Veg' : 'Non-veg'}
                  </span>
                  {d.rating ? (
                    <span style={{ font: '700 10px Manrope,sans-serif', color: 'var(--gold)', marginLeft: 'auto' }}>★ {d.rating}</span>
                  ) : null}
                </div>
                <div style={{ font: '400 20px/1.1 "Instrument Serif",serif' }}>{d.name}</div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ font: '800 14px Manrope,sans-serif', color: 'var(--gold-soft)' }}>
                    from {rupees(Math.min(...d.packs.map((p) => p.price)))}
                  </span>
                  <span style={{ font: '800 11.5px Manrope,sans-serif', color: 'var(--gold)' }}>View ›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Process */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(10px,2vw,26px) clamp(16px,3vw,32px) clamp(30px,4vw,56px)' }}>
        <div style={{
          padding: 'clamp(24px,3.5vw,48px)', borderRadius: 'clamp(20px,2.5vw,30px)',
          background: 'linear-gradient(140deg,rgba(227,174,78,.12),rgba(227,174,78,.02))',
          border: '1px solid rgba(227,174,78,.2)',
        }}>
          <span className="eyebrow-gold">Why it tastes different</span>
          <h2 style={{ margin: '10px 0 0', font: '400 clamp(28px,3.6vw,44px)/1.04 "Instrument Serif",serif', maxWidth: '20ch' }}>
            Nothing is pre-cooked. Ever.
          </h2>
          <div style={{
            marginTop: 'clamp(22px,3vw,36px)', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'clamp(18px,2.4vw,32px)',
          }}>
            {PROCESS.map((p) => (
              <div key={p.n} style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                <span style={{ font: '400 26px/1 "Instrument Serif",serif', color: 'var(--gold)' }}>{p.n}</span>
                <span style={{ font: '800 14px Manrope,sans-serif' }}>{p.title}</span>
                <span style={{ font: '500 12.5px/1.7 Manrope,sans-serif', color: 'var(--text-55)' }}>{p.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Party / Refer teasers */}
      <section style={{
        maxWidth: 1240, margin: '0 auto', padding: '0 clamp(16px,3vw,32px) clamp(36px,5vw,70px)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(16px,2.4vw,26px)',
      }}>
        {config.party.enabled ? (
          <Link to="/party" style={{
            position: 'relative', borderRadius: 22, overflow: 'hidden',
            border: '1px solid var(--hair)', minHeight: 230, color: 'var(--text)',
          }}>
            <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.7)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(11,9,6,.35),rgba(11,9,6,.85))' }} />
            <div style={{ position: 'relative', padding: 'clamp(20px,2.4vw,28px)', display: 'flex', flexDirection: 'column', gap: 9, height: '100%', justifyContent: 'flex-end' }}>
              <span className="eyebrow-gold">Party catering</span>
              <span style={{ font: '400 clamp(24px,2.8vw,34px)/1.04 "Instrument Serif",serif' }}>Host a party.<br />We bring the handi.</span>
              <span style={{ font: '700 12px Manrope,sans-serif', color: 'var(--gold-soft)' }}>Talk to the kitchen ›</span>
            </div>
          </Link>
        ) : null}
        {config.referral.enabled ? (
          <Link to="/refer" className="card" style={{
            padding: 'clamp(20px,2.4vw,28px)', borderStyle: 'dashed', borderColor: 'rgba(227,174,78,.45)',
            display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end',
            minHeight: 230, color: 'var(--text)',
          }}>
            <span className="eyebrow-gold">Refer &amp; earn</span>
            <span style={{ font: '400 clamp(24px,2.8vw,34px)/1.04 "Instrument Serif",serif' }}>
              Give {rupees(config.referral.friendDiscount)}.<br />Get {config.referral.referrerCoins} coins.
            </span>
            <span style={{ font: '500 12px/1.6 Manrope,sans-serif', color: 'var(--text-55)' }}>
              {config.pricing.coinsForFreeMini} Biriyani Coins is a free Mini biriyani.
            </span>
            <span style={{ font: '700 12px Manrope,sans-serif', color: 'var(--gold-soft)' }}>Get your code ›</span>
          </Link>
        ) : null}
      </section>
    </div>
  );
}
