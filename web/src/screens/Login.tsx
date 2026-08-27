import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { ErrorNote } from '../components/ui';

/**
 * Sign-in is one field: the mobile number. No password, no Google — the
 * OTP both registers and authenticates. A brand-new number is asked for
 * a name once, right after verification (see Name.tsx); a returning
 * number goes straight into the app. OTP always goes over WhatsApp — see
 * docs/OTP_SETUP.md for why SMS isn't offered here.
 */
export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');
  const valid = /^[6-9]\d{9}$/.test(digits);

  const submit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await api.requestOtp(digits, 'whatsapp');
      navigate('/verify', {
        state: { phone: digits, channel: res.channel, resendIn: res.resendInSeconds },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the code. Try again.');
    } finally {
      setSending(false);
    }
  }, [valid, sending, digits, navigate]);

  return (
    <section style={{ maxWidth: 440, margin: '0 auto', padding: 'clamp(40px,6vw,90px) 20px', display: 'flex', flexDirection: 'column', gap: 20 }} className="rise">
      <div>
        <span className="eyebrow-gold">Sign in</span>
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
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(null); }}
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

        <button type="submit" className="gold-btn" disabled={!valid || sending}>
          {sending ? 'Sending…' : 'Send code'}
        </button>

        <p style={{ margin: 0, font: '400 10.5px/1.6 Manrope,sans-serif', color: 'var(--text-30)', textAlign: 'center' }}>
          We only use your number to confirm orders. By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </section>
  );
}
