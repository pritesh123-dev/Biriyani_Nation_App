import { Link, Outlet } from 'react-router-dom';
import { useApp } from '../lib/store';
import zayraLogo from '../assets/zayra-logo.png';

export default function Layout() {
  const { config } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* ── GLOBAL TOP NAV (Mobile Responsive, Clean Logo, No Location Badge) ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#ffffff',
        boxShadow: 'var(--shadow-nav)',
        height: 'clamp(68px, 8vw, 80px)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 clamp(14px, 3.5vw, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src={zayraLogo}
              alt="Zayra Biryani - Authentic Hyderabadi Dum"
              style={{
                height: 'clamp(42px, 5.5vw, 56px)',
                width: 'auto',
                maxWidth: 'clamp(150px, 30vw, 220px)',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>

          {/* Right Action Cluster — Responsive 50px pill buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 12px)', flexShrink: 0 }}>
            <a
              href="https://www.instagram.com/zayrabiryani/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outlined-green"
              style={{
                height: 38,
                padding: '0 clamp(10px, 2vw, 16px)',
                fontSize: 'clamp(12px, 1.5vw, 13.5px)',
                gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              </svg>
              <span className="nav-btn-text">Instagram</span>
            </a>

            <a
              href="https://www.youtube.com/@Zayra-Biryani"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-green"
              style={{
                height: 38,
                padding: '0 clamp(10px, 2vw, 16px)',
                fontSize: 'clamp(12px, 1.5vw, 13.5px)',
                gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
              </svg>
              <span className="nav-btn-text">YouTube</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>

      {/* ── HOUSE GREEN FOOTER ── */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                background: '#ffffff',
                padding: '8px 14px',
                borderRadius: 'var(--r-card)',
                display: 'inline-flex',
                maxWidth: 220,
              }}>
                <img
                  src={zayraLogo}
                  alt="Zayra Biryani"
                  style={{ height: 38, width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <span style={{
                font: '400 13.5px/1.5 var(--sans)',
                color: 'var(--text-white-soft)',
                display: 'block',
              }}>
                Authentic Dum-Cooked Handi · Bhubaneswar, Odisha
              </span>
            </div>

            {/* Social Links on Dark Green Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
