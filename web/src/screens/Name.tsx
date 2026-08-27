import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { api, ApiError } from '../lib/api';
import { ErrorNote } from '../components/ui';

/**
 * Shown exactly once, right after a brand-new number verifies its first
 * OTP — this is what makes Login a pure sign-in rather than a sign-up
 * form every returning customer has to sit through. Skippable: a name is
 * nice to have on the account page, never required to order.
 */
export default function Name() {
  const navigate = useNavigate();
  const { signedIn, refreshUser } = useApp();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    navigate('/login', { replace: true });
    return null;
  }

  const finish = async () => {
    const trimmed = name.trim();
    if (!trimmed) { navigate('/', { replace: true }); return; }

    setSaving(true);
    setError(null);
    try {
      await api.updateMe({ displayName: trimmed });
      await refreshUser();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={{ maxWidth: 440, margin: '0 auto', padding: 'clamp(40px,6vw,90px) 20px', display: 'flex', flexDirection: 'column', gap: 20 }} className="rise">
      <div>
        <h1 style={{ margin: 0, font: '400 clamp(28px,4vw,36px)/1.05 "Instrument Serif",serif' }}>
          What should<br />we call you?
        </h1>
        <p style={{ margin: '10px 0 0', font: '500 13px/1.6 Manrope,sans-serif', color: 'var(--text-55)' }}>
          Shows up on your account page and order receipts. You can change it any time.
        </p>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ananya Mishra"
        autoComplete="name"
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') void finish(); }}
        style={{
          height: 56, borderRadius: 'var(--r-md)', padding: '0 16px',
          background: 'var(--card)', border: '1px solid var(--gold-line)',
          color: 'var(--text)', font: '600 16px Manrope,sans-serif', outline: 'none',
        }}
      />

      <ErrorNote message={error} />

      <button className="gold-btn" disabled={saving} onClick={finish}>
        {saving ? 'Saving…' : name.trim() ? 'Continue' : 'Skip for now'}
      </button>
    </section>
  );
}
