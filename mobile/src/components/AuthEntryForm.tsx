import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';

import { api, ApiError } from '../lib/api';
import { GoldButton, ErrorNote } from './ui';
import { C, F, R, S } from '../theme';

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
export default function AuthEntryForm({ mode }: Props) {
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectHint, setRedirectHint] = useState<'signin' | 'signup' | null>(null);
  const phoneRef = useRef<TextInput>(null);

  const digits = phone.replace(/\D/g, '');
  const valid = /^[6-9]\d{9}$/.test(digits);
  const isSignup = mode === 'signup';

  const submit = useCallback(async () => {
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
      router.push({
        pathname: '/(auth)/otp',
        params: {
          phone: digits,
          channel: res.channel,
          resendIn: String(res.resendInSeconds ?? 30),
        },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the code. Try again.');
    } finally {
      setSending(false);
    }
  }, [valid, sending, digits, mode]);

  return (
    <View style={{ paddingHorizontal: 26, paddingTop: 10, paddingBottom: 34, gap: 14 }}>
      <Text style={S.eyebrow}>Mobile number</Text>

      <Pressable
        onPress={() => phoneRef.current?.focus()}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          height: 56, borderRadius: R.md, paddingHorizontal: 16,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: valid ? C.goldLine50 : C.goldLine,
        }}
      >
        <Text style={{ fontFamily: F.sans700, fontSize: 15, color: C.gold }}>+91</Text>
        <View style={{ width: 1, height: 22, backgroundColor: 'rgba(227,174,78,0.22)' }} />
        <TextInput
          ref={phoneRef}
          value={formatPhone(phone)}
          onChangeText={(t) => {
            setPhone(t.replace(/\D/g, '').slice(0, 10));
            setError(null);
            setRedirectHint(null);
          }}
          placeholder="98765 43210"
          placeholderTextColor={C.text30}
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={11}
          returnKeyType="go"
          onSubmitEditing={submit}
          autoFocus
          style={{
            flex: 1, fontFamily: F.sans600, fontSize: 16,
            color: C.text, letterSpacing: 1, padding: 0,
          }}
        />
      </Pressable>

      <ErrorNote message={error} />
      {redirectHint ? (
        <Pressable
          onPress={() => router.replace(redirectHint === 'signup' ? '/(auth)/signup' : '/(auth)/phone')}
          hitSlop={8}
        >
          <Text style={{ fontFamily: F.sans700, fontSize: 12.5, color: C.gold, textAlign: 'center' }}>
            {redirectHint === 'signup' ? 'Create an account instead ›' : 'Sign in instead ›'}
          </Text>
        </Pressable>
      ) : null}

      <GoldButton
        label={sending ? 'Sending…' : 'Send code'}
        onPress={submit}
        disabled={!valid}
        loading={sending}
        style={{ marginTop: 2 }}
      />

      <Text style={{
        fontFamily: F.sans600, fontSize: 12.5, textAlign: 'center', color: C.text45,
      }}>
        {isSignup ? (
          <>Already ordered with us?{' '}
            <Text
              onPress={() => router.replace('/(auth)/phone')}
              style={{ color: C.gold, fontFamily: F.sans700 }}
            >
              Sign in
            </Text>
          </>
        ) : (
          <>New here?{' '}
            <Text
              onPress={() => router.replace('/(auth)/signup')}
              style={{ color: C.gold, fontFamily: F.sans700 }}
            >
              Create an account
            </Text>
          </>
        )}
      </Text>

      <Text style={{
        fontFamily: F.sans, fontSize: 10.5, lineHeight: 17,
        color: C.text30, textAlign: 'center', paddingHorizontal: 12,
      }}>
        We text a one-time code on WhatsApp to confirm it's you. By
        continuing you agree to our Terms and Privacy Policy.
      </Text>
    </View>
  );
}

const formatPhone = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
