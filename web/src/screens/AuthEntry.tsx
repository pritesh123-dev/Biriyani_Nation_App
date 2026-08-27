import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { ErrorNote } from '../components/ui';

interface Props {
  mode: 'signin' | 'signup';
}

/**
 * Sign in and sign up are the same form — a phone number — but check
 * opposite things before sending an OTP: sign-in refuses an unknown
 * number (with a link to sign up instead), sign-up refuses one that
 * already has an account (with a link to sign in instead). Catching
 * this before the OTP goes out is a better first message than sending a
 * code and only then discovering the mismatch.
 */
export default function AuthEntry({ mode }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { phone?: string } | null)?.phone ?? '';
  const [phone, setPhone] = useState(prefill);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectHint, setRedirectHint] = useState<'signin' | 'signup' | null>(null);

  const digits = phone.replace(/\D/g, '');
  const valid = /^[6-9]\d{9}$/.test(digits);

  const submit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    setError(null);
    setRedirectHint(null);

    try {
      const { exists } = await api.checkPhone(digits);

      if (mode === 'signin' && !exists) {
        setError("We couldn't find an account with that number.");
        setRedirectHint('signup');
        return;
      }
      if (mode === 'signup' && exists) {
        setError('You already have an account with that number.');
        setRedirectHint('signin');
        return;
      }

      const res = await api.requestOtp(digits, 'whatsapp');
      navigate('/verify', {
        state: { phone: digits, channel: res.channel, resendIn: res.resendInSeconds, mode },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the code. Try again.');
    } finally {
      setSending(false);
    }
  }, [valid, sending, digits, mode, navigate]);

  const isSignup = mode === 'signup';

  return (
    <section style={{ maxWidth: 440, margin: '0 auto', padding: 'clamp(40px,6vw,90px) 20px', display: 'flex', flexDirection: 'column', gap: 20 }} className="rise">
      <div>
        <span className="eyebrow-gold">{isSignup ? 'Sign up' : 'Sign in'}</span>
        <h1 style={{ margin: '10px 0 0', font: '400 clamp(28px,4vw,38px)/1.05 "Instrument Serif",serif' }}>
          Just your number.
        </h1>
        <p style={{ margin: '10px 0 0', font: '500 13px/1.6 Manrope,sans-serif', color: 'var(--text-55)' }}>
          No password. We WhatsApp you a code — that's your whole account.
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span className="eyebrow">Mobile number</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, height: 56,
            borderRadius: 'var(--r-md)', padding: '0 16px', background: 'var(--card)',
            border: `1px solid ${valid ? 'var(--gold-line-50)' : 'var(--gold-line)'}`,
          }}>
            <span style={{ font: '700 15px Manrope,sans-serif', color: 'var(--gold)' }}>+91</span>
            <span style={{ width: 1, height: 22, background: 'rgba(227,174,78,.22)' }} />
            <input
              value={digits}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(null); setRedirectHint(null); }}
              placeholder="98765 43210"
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              style={{
                flex: 1, border: 0, background: 'transparent', color: 'var(--text)',
                font: '600 16px Manrope,sans-serif', letterSpacing: '.06em', outline: 'none',
              }}
            />
          </div>
        </label>

        <ErrorNote message={error} />
        {redirectHint ? (
          <Link
            to={redirectHint === 'signup' ? '/signup' : '/login'}
            state={{ phone: digits }}
            style={{ font: '700 12.5px Manrope,sans-serif', color: 'var(--gold)', textAlign: 'center' }}
          >
            {redirectHint === 'signup' ? 'Create an account instead ›' : 'Sign in instead ›'}
          </Link>
        ) : null}

        <button type="submit" className="gold-btn" disabled={!valid || sending}>
          {sending ? 'Sending…' : 'Send code'}
        </button>

        <p style={{ margin: 0, font: '500 12px Manrope,sans-serif', color: 'var(--text-45)', textAlign: 'center' }}>
          {isSignup ? (
            <>Already ordered with us? <Link to="/login" style={{ color: 'var(--gold)' }}>Sign in</Link></>
          ) : (
            <>New here? <Link to="/signup" style={{ color: 'var(--gold)' }}>Create an account</Link></>
          )}
        </p>

        <p style={{ margin: 0, font: '400 10.5px/1.6 Manrope,sans-serif', color: 'var(--text-30)', textAlign: 'center' }}>
          We only use your number to confirm orders. By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </section>
  );
}
