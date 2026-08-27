import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section style={{ maxWidth: 480, margin: '0 auto', padding: '100px 20px', textAlign: 'center' }}>
      <div style={{ font: '400 60px "Instrument Serif",serif', color: 'var(--gold)' }}>404</div>
      <p style={{ font: '500 13px Manrope,sans-serif', color: 'var(--text-45)', margin: '10px 0 24px' }}>
        That page wandered off the menu.
      </p>
      <Link to="/" className="gold-btn" style={{ display: 'inline-flex', height: 48, padding: '0 24px' }}>
        Back to home
      </Link>
    </section>
  );
}
