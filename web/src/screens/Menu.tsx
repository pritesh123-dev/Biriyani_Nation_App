import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../lib/store';
import { VegMark, Loading, rupees } from '../components/ui';

type Filter = 'All' | 'Veg' | 'Non-veg';

export default function Menu() {
  const { config } = useApp();
  const [filter, setFilter] = useState<Filter>('All');

  const dishes = useMemo(() => {
    if (!config) return [];
    return config.dishes.filter((d) => (filter === 'All' ? true : filter === 'Veg' ? d.veg : !d.veg));
  }, [config, filter]);

  if (!config) return <Loading />;

  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(24px,4vw,52px) clamp(16px,3vw,32px)' }} className="rise">
      <span className="eyebrow-gold">Menu</span>
      <h1 style={{ margin: '9px 0 0', font: '400 clamp(32px,4.5vw,52px)/1.03 "Instrument Serif",serif' }}>
        {config.dishes.length} biriyanis, cooked to order.
      </h1>
      <p style={{ margin: '10px 0 0', font: '500 13px Manrope,sans-serif', color: 'var(--text-45)' }}>
        Every pack is dum-cooked fresh — nothing sits pre-made.
      </p>

      <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
        {(['All', 'Veg', 'Non-veg'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              height: 36, padding: '0 17px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
              background: filter === f ? 'rgba(227,174,78,.16)' : 'transparent',
              border: `1px solid ${filter === f ? 'var(--gold-line-50)' : 'var(--border)'}`,
              color: filter === f ? 'var(--gold-soft)' : 'var(--text-55)',
              font: '800 12px Manrope,sans-serif',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{
        marginTop: 28, display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18,
      }}>
        {dishes.map((d) => {
          const from = Math.min(...d.packs.map((p) => p.price));
          return (
            <Link key={d.id} to={`/dish/${d.id}`} className="card" style={{
              overflow: 'hidden', color: 'var(--text)', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ height: 190, background: 'var(--well)', position: 'relative' }}>
                {d.image ? (
                  <img src={d.image} alt={d.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', font: '400 26px "Instrument Serif",serif', color: 'rgba(227,174,78,.3)' }}>B</div>
                )}
                {d.bestseller ? (
                  <span style={{
                    position: 'absolute', top: 12, left: 12, padding: '5px 10px', borderRadius: 999,
                    background: 'rgba(11,9,6,.7)', backdropFilter: 'blur(6px)',
                    font: '800 9px Manrope,sans-serif', letterSpacing: '.1em', color: 'var(--gold-soft)',
                  }}>
                    BESTSELLER
                  </span>
                ) : null}
              </div>
              <div style={{ padding: 17, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <VegMark veg={d.veg} />
                  <span style={{ font: '700 9px Manrope,sans-serif', letterSpacing: '.11em', textTransform: 'uppercase', color: 'var(--text-45)' }}>
                    {d.veg ? 'Veg' : 'Non-veg'}
                  </span>
                  {d.rating ? <span style={{ font: '700 10.5px Manrope,sans-serif', color: 'var(--gold)', marginLeft: 'auto' }}>★ {d.rating}</span> : null}
                </div>
                <div style={{ font: '400 21px/1.15 "Instrument Serif",serif' }}>{d.name}</div>
                <p style={{ margin: 0, font: '500 11.5px/1.5 Manrope,sans-serif', color: 'var(--text-45)', flex: 1 }}>{d.short}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ font: '800 15px Manrope,sans-serif', color: 'var(--gold-soft)' }}>from {rupees(from)}</span>
                  <span style={{ font: '800 11.5px Manrope,sans-serif', color: 'var(--gold)' }}>ADD ›</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {dishes.length === 0 ? (
        <p style={{ marginTop: 40, textAlign: 'center', font: '500 13px Manrope,sans-serif', color: 'var(--text-45)' }}>
          Nothing matches that filter today.
        </p>
      ) : null}
    </section>
  );
}
