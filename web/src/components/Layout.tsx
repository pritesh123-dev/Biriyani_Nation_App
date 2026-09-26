import { Link, Outlet } from 'react-router-dom';
import { useApp } from '../lib/store';

export default function Layout() {
  const { config } = useApp();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(1200px 720px at 78% -12%, rgba(227,174,78,.12), transparent 62%), var(--bg)',
    }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(11,9,6,.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(227,174,78,.16)',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '14px clamp(16px,3vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link to="/" style={{
            font: '400 clamp(22px,2.6vw,30px)/1 "Instrument Serif",serif',
            color: 'var(--text)', letterSpacing: '.4px', whiteSpace: 'nowrap', flex: 'none',
          }}>
            Zayra<span style={{ color: 'var(--gold)' }}>Biryani</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              font: '700 11.5px/1 var(--sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
              background: 'rgba(227,174,78,0.1)',
              border: '1px solid rgba(227,174,78,0.25)',
              padding: '6px 12px',
              borderRadius: 'var(--r-pill)',
              display: 'none',
            }} className="location-pill-desktop">
              📍 Bhubaneswar
            </span>

            <a
              href="https://www.instagram.com/zayrabiryani/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                background: 'linear-gradient(135deg, rgba(225,48,108,0.15), rgba(131,58,180,0.15))',
                border: '1px solid rgba(225,48,108,0.35)',
                color: '#F48FB1',
                font: '700 12px Manrope,sans-serif',
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              </svg>
              Instagram
            </a>

            <a
              href="https://www.youtube.com/@Zayra-Biryani"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                background: 'rgba(255,0,0,0.12)',
                border: '1px solid rgba(255,0,0,0.3)',
                color: '#FF8A80',
                font: '700 12px Manrope,sans-serif',
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
              </svg>
              YouTube
            </a>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>

      <footer style={{
        borderTop: '1px solid var(--hair-soft)', padding: '28px clamp(16px,3vw,32px) 40px',
        textAlign: 'center', font: '500 12px Manrope,sans-serif', color: 'var(--text-45)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginBottom: 14, flexWrap: 'wrap' }}>
          <a
            href="https://www.instagram.com/zayrabiryani/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-70)', font: '600 12px Manrope,sans-serif', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            Instagram
          </a>
          <span style={{ color: 'var(--hair)' }}>•</span>
          <a
            href="https://www.youtube.com/@Zayra-Biryani"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-70)', font: '600 12px Manrope,sans-serif', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            YouTube
          </a>
          <span style={{ color: 'var(--hair)' }}>•</span>
          <a
            href="https://www.facebook.com/people/Zayra-Biryani/61594579809671/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-70)', font: '600 12px Manrope,sans-serif', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            Facebook
          </a>
        </div>
        <div>
          {config?.brand.name ?? 'Zayra Biryani'} · Bhubaneswar, Odisha · Opening Soon · Pickup only
        </div>
      </footer>
    </div>
  );
}
