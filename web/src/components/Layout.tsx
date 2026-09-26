import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useApp } from '../lib/store';
import zayraLogo from '../assets/zayra-logo-clear.png';
import zayraLogoLight from '../assets/zayra-logo-light.png';
import { IconArrow, SOCIAL, BrandInstagram, BrandYoutube, BrandFacebook } from './icons';

export default function Layout() {
  const { config } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <Link to="/" className="nav-logo" aria-label="Zayra Biryani home">
            <img src={zayraLogo} alt="Zayra Biryani — Authentic Hyderabadi Dum" />
          </Link>

          <nav className="nav-links" aria-label="Sections">
            <a href="#craft">Our Craft</a>
            <a href="#menu">Menu</a>
            <a href="#story">Story</a>
            <a href="#community">Community</a>
          </nav>

          <div className="nav-actions">
            <a className="brand-btn" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
              <BrandInstagram size={22} />
            </a>
            <a className="brand-btn" href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" aria-label="Subscribe on YouTube">
              <BrandYoutube size={24} />
            </a>
            <a className="btn btn-emerald btn-sm" href="#invite">
              Get invite <IconArrow size={15} />
            </a>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-word" aria-hidden="true">Zayra</div>
        <div className="wrap" style={{ position: 'relative' }}>
          <div className="footer-top">
            <div>
              <img className="footer-logo" src={zayraLogoLight} alt="Zayra Biryani" />
              <p>Authentic Hyderabadi dum biryani, sealed in handis and slow-cooked in our Bhubaneswar kitchen.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><a href="#craft">Our craft</a></li>
                <li><a href="#menu">Launch menu</a></li>
                <li><a href="#story">Our story</a></li>
                <li><a href="#invite">Launch invite</a></li>
              </ul>
            </div>
            <div>
              <h4>Follow</h4>
              <ul>
                <li><a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><BrandInstagram size={18} /> Instagram</a></li>
                <li><a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><BrandYoutube size={20} /> YouTube</a></li>
                <li><a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><BrandFacebook size={18} /> Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {config?.brand.name ?? 'Zayra Biryani'}. All rights reserved.</span>
            <span className="gold">Opening soon · Bhubaneswar, Odisha</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
