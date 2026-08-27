import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { CoinBadge, rupees } from './ui';

const NAV_LINKS = [
  { to: '/menu', label: 'Menu' },
  { to: '/party', label: 'Party catering' },
  { to: '/refer', label: 'Refer' },
];

export default function Layout() {
  const { config, user, signedIn, cartCount, cartEstimate } = useApp();
  const navigate = useNavigate();

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
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '12px clamp(14px,3vw,32px) 0' }}>
          {/* Row 1: identity + actions — always a single line, never wraps. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{
              font: '400 clamp(19px,2.2vw,25px)/1 "Instrument Serif",serif',
              color: 'var(--text)', letterSpacing: '.3px', whiteSpace: 'nowrap', flex: 'none',
            }}>
              Biriyani<span style={{ color: 'var(--gold)' }}>Nation</span>
            </Link>

            <div style={{ flex: 1, minWidth: 0 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
              {signedIn ? (
                <button
                  onClick={() => navigate('/account')}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}
                >
                  <CoinBadge coins={user?.coins ?? 0} />
                </button>
              ) : (
                <>
                  <Link to="/login" className="ghost-btn" style={{
                    height: 38, padding: '0 13px', display: 'inline-flex',
                    alignItems: 'center', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap',
                  }}>
                    Sign in
                  </Link>
                  <Link to="/signup" style={{
                    height: 38, padding: '0 13px', display: 'inline-flex',
                    alignItems: 'center', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap',
                    borderRadius: 'var(--r-lg)', border: '1px solid var(--gold-line-50)',
                    color: 'var(--gold-soft)',
                  }}>
                    Sign up
                  </Link>
                </>
              )}
              <Link
                to="/cart"
                className="gold-btn"
                style={{ height: 38, padding: '0 14px', font: '800 12px Manrope,sans-serif', whiteSpace: 'nowrap' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--on-gold)" strokeWidth={2}>
                  <path d="M5 7h14l-1.4 12H6.4z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
                Cart {cartCount > 0 ? `· ${rupees(cartEstimate)}` : ''}
              </Link>
            </div>
          </div>

          {/* Row 2: section nav — scrolls horizontally on narrow screens
              instead of wrapping into a cluttered second/third line. */}
          <nav className="header-nav-scroll" style={{
            display: 'flex', alignItems: 'center', gap: 'clamp(14px,2vw,24px)',
            overflowX: 'auto', marginTop: 10, paddingBottom: 11,
          }}>
            {NAV_LINKS.filter((l) =>
              l.to === '/party' ? config?.party.enabled !== false
                : l.to === '/refer' ? config?.referral.enabled !== false
                : true,
            ).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                style={({ isActive }) => ({
                  padding: '3px 0', font: '600 13px Manrope,sans-serif', flex: 'none',
                  whiteSpace: 'nowrap',
                  color: isActive ? 'var(--gold)' : 'var(--text-70)',
                  borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                })}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>

      <footer style={{
        borderTop: '1px solid var(--hair-soft)', padding: '28px clamp(16px,3vw,32px) 40px',
        textAlign: 'center', font: '500 11px Manrope,sans-serif', color: 'var(--text-30)',
      }}>
        {config?.brand.name ?? 'BiriyaniNation'} · {config?.store.addressLine1} · pickup only
      </footer>
    </div>
  );
}
