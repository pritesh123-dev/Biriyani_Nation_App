import { Link, Outlet } from 'react-router-dom';
import { useApp } from '../lib/store';

export default function Layout() {
  const { config } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* ── GLOBAL TOP NAV (Starbucks 3-Layer Shadow Standard) ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#ffffff',
        boxShadow: 'var(--shadow-nav)',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 clamp(16px, 3.5vw, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{
            font: '700 clamp(20px, 2.4vw, 24px)/1 var(--sans)',
            letterSpacing: '-0.02em',
            color: 'var(--green-house)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span>Zayra</span>
            <span style={{ color: 'var(--green-starbucks)' }}>Biryani</span>
          </Link>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              font: '700 12px/1 var(--sans)',
              letterSpacing: '-0.01em',
              color: 'var(--green-starbucks)',
              background: 'var(--green-light)',
              padding: '6px 14px',
              borderRadius: 'var(--r-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--green-accent)',
                animation: 'pulseDot 2s infinite',
              }} />
              Bhubaneswar
            </span>

            <a
              href="https://www.instagram.com/zayrabiryani/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outlined-green"
              style={{
                height: 38,
                padding: '0 16px',
                fontSize: 13.5,
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
              className="btn-primary-green"
              style={{
                height: 38,
                padding: '0 16px',
                fontSize: 13.5,
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

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>

      {/* ── HOUSE GREEN FOOTER (DESIGN.md Section 1 & 2 Standard) ── */}
      <footer style={{
        background: 'var(--green-house)',
        color: 'var(--text-white)',
        padding: 'clamp(40px, 6vw, 64px) clamp(16px, 3.5vw, 40px) 48px',
        marginTop: 'auto',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
            paddingBottom: 32,
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            <div>
              <span style={{
                font: '700 22px/1 var(--sans)',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                display: 'block',
              }}>
                Zayra <span style={{ color: 'var(--gold)' }}>Biryani</span>
              </span>
              <span style={{
                font: '400 14px/1.5 var(--sans)',
                color: 'var(--text-white-soft)',
                display: 'block',
                marginTop: 6,
              }}>
                Authentic Dum-Cooked Handi · Bhubaneswar, Odisha
              </span>
            </div>

            {/* Social Links on Dark Green Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <a
                href="https://www.instagram.com/zayrabiryani/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outlined-white"
                style={{ height: 38, padding: '0 18px', fontSize: 13 }}
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@Zayra-Biryani"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outlined-white"
                style={{ height: 38, padding: '0 18px', fontSize: 13 }}
              >
                YouTube
              </a>
              <a
                href="https://www.facebook.com/people/Zayra-Biryani/61594579809671/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outlined-white"
                style={{ height: 38, padding: '0 18px', fontSize: 13 }}
              >
                Facebook
              </a>
            </div>
          </div>

          <div style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            font: '400 13px/1.5 var(--sans)',
            color: 'var(--text-white-soft)',
          }}>
            <div>
              © {new Date().getFullYear()} {config?.brand.name ?? 'Zayra Biryani'}. All rights reserved.
            </div>
            <div style={{ color: 'var(--gold)' }}>
              Opening Soon for Counter Pickup & Pre-orders
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
