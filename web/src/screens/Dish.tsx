import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../lib/store';
import { VegMark, QtyStepper, EmptyState, rupees } from '../components/ui';
import heroImg from '../assets/hero-biriyani.jpg';

export default function Dish() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { config, dishById, addToCart } = useApp();
  const dish = dishById(id ?? '');

  const [packId, setPackId] = useState(() => dish?.packs[1]?.id ?? dish?.packs[0]?.id ?? '');
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const total = useMemo(() => {
    if (!dish || !config) return 0;
    const pack = dish.packs.find((p) => p.id === packId);
    if (!pack) return 0;
    const addonsSum = addonIds.reduce((s, aid) => s + (config.addons.find((a) => a.id === aid)?.price ?? 0), 0);
    return (pack.price + addonsSum) * qty;
  }, [dish, config, packId, addonIds, qty]);

  if (!dish || !config) {
    return (
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
        <EmptyState
          title="Dish not found"
          body="This dish may have come off the menu."
          actionLabel="Back to the menu"
          onAction={() => navigate('/menu')}
        />
      </section>
    );
  }

  const toggleAddon = (aid: string) =>
    setAddonIds((prev) => (prev.includes(aid) ? prev.filter((x) => x !== aid) : [...prev, aid]));

  const submit = () => {
    addToCart({ dishId: dish.id, packId, qty, addonIds });
    navigate('/cart');
  };

  return (
    <section style={{
      maxWidth: 980, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px) 100px',
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(24px,3.5vw,44px)',
    }} className="rise">
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--hair)', height: 'clamp(300px,32vw,440px)' }}>
        <img src={dish.image || heroImg} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <VegMark veg={dish.veg} />
          <span style={{ font: '700 9.5px Manrope,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-55)' }}>
            {dish.veg ? 'Pure veg' : 'Non-veg'}
          </span>
          {dish.rating ? <span style={{ font: '700 10px Manrope,sans-serif', color: 'var(--gold)' }}>★ {dish.rating}</span> : null}
        </div>

        <h1 style={{ margin: 0, font: '400 clamp(30px,3.5vw,42px)/1.05 "Instrument Serif",serif' }}>{dish.name}</h1>
        <p style={{ margin: 0, font: '500 13px/1.7 Manrope,sans-serif', color: 'var(--text-55)' }}>{dish.desc}</p>

        <div style={{ height: 1, background: 'var(--hair)', margin: '4px 0' }} />

        <span className="eyebrow">Choose your pack</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dish.packs.map((pack) => {
            const active = pack.id === packId;
            return (
              <button
                key={pack.id}
                onClick={() => setPackId(pack.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px',
                  borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(227,174,78,.12)' : 'var(--card)',
                  border: `1px solid ${active ? 'rgba(227,174,78,.6)' : 'var(--hair)'}`,
                  color: 'var(--text)',
                }}
              >
                <span style={{
                  width: 19, height: 19, borderRadius: 10, flex: 'none', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  border: `1.6px solid ${active ? 'var(--gold)' : 'rgba(246,238,225,.28)'}`,
                }}>
                  {active ? <span style={{ width: 9, height: 9, borderRadius: 5, background: 'var(--gold)' }} /> : null}
                </span>
                <span style={{ flex: 1 }}>
                  <div style={{ font: '800 14px Manrope,sans-serif' }}>{pack.label}</div>
                  <div style={{ font: '500 11px Manrope,sans-serif', color: 'var(--text-45)' }}>{pack.serves} · {pack.grams}</div>
                </span>
                <span style={{ font: '800 15px Manrope,sans-serif', color: 'var(--gold-soft)' }}>{rupees(pack.price)}</span>
              </button>
            );
          })}
        </div>

        {config.addons.length ? (
          <>
            <span className="eyebrow" style={{ marginTop: 6 }}>Make it a feast</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {config.addons.map((addon) => {
                const active = addonIds.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px',
                      borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left',
                      background: 'var(--card)', color: 'var(--text)',
                      border: `1px solid ${active ? 'rgba(227,174,78,.55)' : 'var(--hair)'}`,
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: 5, flex: 'none', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      border: `1.6px solid ${active ? 'var(--gold)' : 'rgba(246,238,225,.3)'}`,
                      background: active ? 'var(--gold)' : 'transparent',
                    }}>
                      {active ? <span style={{ font: '800 11px Manrope,sans-serif', color: 'var(--on-gold)' }}>✓</span> : null}
                    </span>
                    <span style={{ flex: 1, font: '700 13px Manrope,sans-serif' }}>{addon.name}</span>
                    <span style={{ font: '700 13px Manrope,sans-serif', color: 'var(--gold-soft)' }}>+{rupees(addon.price)}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        <div style={{
          position: 'sticky', bottom: 16, marginTop: 10, display: 'flex', gap: 12,
          padding: 14, borderRadius: 'var(--r-lg)', background: 'var(--surface)',
          border: '1px solid var(--hair)',
        }}>
          <QtyStepper qty={qty} onChange={(n) => setQty(Math.max(1, Math.min(20, n)))} />
          <button
            className="gold-btn"
            style={{ flex: 1 }}
            disabled={!config.openNow}
            onClick={submit}
          >
            {config.openNow ? `Add to cart · ${rupees(total)}` : 'Counter closed'}
          </button>
        </div>
      </div>
    </section>
  );
}
