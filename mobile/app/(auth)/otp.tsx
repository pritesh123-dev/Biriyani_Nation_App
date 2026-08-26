import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useApp } from '../../src/lib/store';
import { api, ApiError } from '../../src/lib/api';
import { GoldButton, BackButton, ErrorNote } from '../../src/components/ui';
import { C, F, R, S } from '../../src/theme';

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone: string; channel: string; resendIn: string }>();
  const { signIn, refreshConfig } = useApp();

  const phone = params.phone ?? '';
  const channelLabel = params.channel === 'sms' ? 'SMS' : 'WhatsApp';

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(Number(params.resendIn ?? 30));

  const inputRef = useRef<TextInput>(null);
  const submitted = useRef(false);

  // Resend countdown.
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = useCallback(async (value: string) => {
    if (value.length !== CODE_LENGTH || submitted.current) return;
    submitted.current = true;
    setVerifying(true);
    setError(null);

    try {
      const res = await api.verifyOtp(phone, value);
      await signIn(res.token, res.user);
      void refreshConfig();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/(tabs)');
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(err instanceof ApiError ? err.message : 'Could not verify that code.');
      setCode('');
      submitted.current = false;
      inputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  }, [phone, signIn, refreshConfig]);

  // Auto-submit the moment the sixth digit lands.
  const onChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(next);
    setError(null);
    if (next.length === CODE_LENGTH) void verify(next);
  };

  const resend = useCallback(async () => {
    if (seconds > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await api.requestOtp(phone, params.channel as 'sms' | 'whatsapp');
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
  }, [seconds, resending, phone, params.channel]);

  return (
    <KeyboardAvoidingView
      style={S.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{
        flex: 1, paddingTop: insets.top + 18,
        paddingHorizontal: 26, paddingBottom: insets.bottom + 26,
      }}>
        <BackButton onPress={() => router.back()} style={{ marginBottom: 26 }} />

        <Text style={{ fontFamily: F.serif, fontSize: 34, lineHeight: 36, color: C.text }}>
          Verify your{'\n'}number
        </Text>
        <Text style={[S.body, { marginTop: 10 }]}>
          A {CODE_LENGTH}-digit code was sent on {channelLabel} to{' '}
          <Text style={{ color: C.gold }}>+91 {formatPhone(phone)}</Text>
        </Text>

        {/* One hidden input drives six visible boxes — this is what lets
            iOS and Android autofill the SMS code in a single tap. */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{ flexDirection: 'row', gap: 9, marginTop: 30 }}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const filled = i < code.length;
            const isNext = i === code.length;
            return (
              <View
                key={i}
                style={{
                  flex: 1, height: 62, borderRadius: R.lg,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: C.card,
                  borderWidth: 1,
                  borderColor: isNext ? C.gold : filled ? C.goldLine50 : 'rgba(227,174,78,0.22)',
                }}
              >
                <Text style={{ fontFamily: F.serif, fontSize: 28, color: C.text }}>
                  {code[i] ?? ''}
                </Text>
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={onChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={CODE_LENGTH}
          autoFocus
          caretHidden
          style={{
            position: 'absolute', opacity: 0,
            height: 1, width: 1, top: -100,
          }}
        />

        <View style={[S.between, { marginTop: 16 }]}>
          <Text style={{ fontFamily: F.sans600, fontSize: 12, color: C.text45 }}>
            {seconds > 0
              ? `Resend in 0:${String(seconds).padStart(2, '0')}`
              : resending ? 'Sending…' : ''}
          </Text>
          <View style={[S.row, { gap: 16 }]}>
            {seconds <= 0 && !resending ? (
              <Pressable onPress={resend} hitSlop={8}>
                <Text style={{ fontFamily: F.sans700, fontSize: 12, color: C.gold }}>
                  Resend code
                </Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={{ fontFamily: F.sans700, fontSize: 12, color: C.text45 }}>
                Change number
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <ErrorNote message={error} />
        </View>

        <View style={{ flex: 1 }} />

        <GoldButton
          label="Verify & continue"
          onPress={() => verify(code)}
          disabled={code.length !== CODE_LENGTH}
          loading={verifying}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const formatPhone = (digits: string) =>
  digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
