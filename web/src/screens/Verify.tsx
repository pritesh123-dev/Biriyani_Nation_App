import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useApp } from '../lib/store';
import { ErrorNote } from '../components/ui';

interface NavState {
  phone: string; name?: string; channel: string; resendIn: number;
}

const CODE_LENGTH = 6;

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, refreshConfig } = useApp();
  const state = location.state as NavState | null;

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(state?.resendIn ?? 30);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (!state?.phone) navigate('/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = useCallback(async (value: string) => {
    if (!state || value.length !== CODE_LENGTH || submitted.current) return;
    submitted.current = true;
    setVerifying(true);
    setError(null);
    try {
      const res = await api.verifyOtp(state.phone, value, state.name);
      signIn(res.token, res.user);
      void refreshConfig();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not verify that code.');
      setCode('');
      submitted.current = false;
      inputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  }, [state, signIn, refreshConfig, navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(next);
    setError(null);
    if (next.length === CODE_LENGTH) void verify(next);
  };

  const resend = useCallback(async () => {
    if (!state || seconds > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await api.requestOtp(state.phone, state.channel as 'sms' | 'whatsapp');
      setSeconds(res.resendInSeconds ?? 30);
      setCode('');
      submitted.current = false;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not resend the code.';
      setError(msg);
      if (err instanceof ApiError && err.retryAfter) setSeconds(err.retryAfter);
    } finally {
      setResending(false);
    }
  }, [state, seconds, resending]);

  if (!state?.phone) return null;

  const formatted = state.phone.length === 10 ? `${state.phone.slice(0, 5)} ${state.phone.slice(5)}` : state.phone;

  return (
    <section style={{ maxWidth: 440, margin: '0 auto', padding: 'clamp(40px,6vw,90px) 20px', display: 'flex', flexDirection: 'column', gap: 20 }} className="rise">
      <div>
        <h1 style={{ margin: 0, font: '400 clamp(28px,4vw,36px)/1.05 "Instrument Serif",serif' }}>
          Verify your<br />number
        </h1>
        <p style={{ margin: '10px 0 0', font: '500 13px/1.6 Manrope,sans-serif', color: 'var(--text-55)' }}>
          A {CODE_LENGTH}-digit code was sent on {state.channel === 'sms' ? 'SMS' : 'WhatsApp'} to{' '}
          <span style={{ color: 'var(--gold)' }}>+91 {formatted}</span>
        </p>
      </div>

      <div style={{ position: 'relative' }} onClick={() => inputRef.current?.focus()}>
        <div style={{ display: 'flex', gap: 9 }}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const filled = i < code.length;
            const isNext = i === code.length;
            return (
              <div key={i} style={{
                flex: 1, height: 62, borderRadius: 'var(--r-lg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', background: 'var(--card)',
                border: `1px solid ${isNext ? 'var(--gold)' : filled ? 'var(--gold-line-50)' : 'rgba(227,174,78,.22)'}`,
                font: '400 28px "Instrument Serif",serif', cursor: 'text',
              }}>
                {code[i] ?? ''}
              </div>
            );
          })}
        </div>
        <input
          ref={inputRef}
          value={code}
          onChange={onChange}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          style={{ position: 'absolute', inset: 0, opacity: 0, border: 0 }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ font: '600 12px Manrope,sans-serif', color: 'var(--text-45)' }}>
          {seconds > 0 ? `Resend in 0:${String(seconds).padStart(2, '0')}` : resending ? 'Sending…' : ''}
        </span>
        <div style={{ display: 'flex', gap: 16 }}>
          {seconds <= 0 && !resending ? (
            <button onClick={resend} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '700 12px Manrope,sans-serif', color: 'var(--gold)' }}>
              Resend code
            </button>
          ) : null}
          <button onClick={() => navigate('/login')} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '700 12px Manrope,sans-serif', color: 'var(--text-45)' }}>
            Change number
          </button>
        </div>
      </div>

      <ErrorNote message={error} />

      <button className="gold-btn" onClick={() => verify(code)} disabled={code.length !== CODE_LENGTH || verifying}>
        {verifying ? 'Verifying…' : 'Verify & continue'}
      </button>
    </section>
  );
}
