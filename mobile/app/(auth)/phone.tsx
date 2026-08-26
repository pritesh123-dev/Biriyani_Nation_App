import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { useApp } from '../../src/lib/store';
import { api, ApiError } from '../../src/lib/api';
import { GoldButton, ErrorNote, Icon } from '../../src/components/ui';
import { C, F, R, S } from '../../src/theme';

const HERO = require('../../assets/hero-biriyani.jpg');

/**
 * Sign-in is one field: the mobile number. No name, no Google, no
 * password — the OTP both registers and authenticates, and the number is
 * the only identifier the kitchen ever needs.
 */
export default function PhoneScreen() {
  const { config } = useApp();
  const { height } = useWindowDimensions();

  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const digits = phone.replace(/\D/g, '');
  const valid = /^[6-9]\d{9}$/.test(digits);

  const submit = useCallback(async () => {
    if (!valid || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await api.requestOtp(digits, channel);
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
  }, [valid, sending, digits, channel]);

  const heroHeight = Math.min(404, Math.max(280, height * 0.44));
  const brand = config?.brand;

  return (
    <KeyboardAvoidingView
      style={S.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hero */}
        <View style={{ height: heroHeight }}>
          <Image
            source={brand?.heroImage ? { uri: brand.heroImage } : HERO}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
          <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <Defs>
              <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0"    stopColor={C.bg} stopOpacity="0.55" />
                <Stop offset="0.34" stopColor={C.bg} stopOpacity="0.10" />
                <Stop offset="0.82" stopColor="#100C07" stopOpacity="0.86" />
                <Stop offset="1"    stopColor="#100C07" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#scrim)" />
          </Svg>

          <View style={{
            position: 'absolute', left: 26, right: 26, bottom: 30, gap: 10,
          }}>
            <View style={[S.row, { gap: 8 }]}>
              <View style={{ width: 22, height: 1, backgroundColor: C.gold }} />
              <Text style={S.eyebrowGold}>
                {brand?.established ?? 'Est. 2024 · Bhubaneswar'}
              </Text>
            </View>
            <Text style={{
              fontFamily: F.serif, fontSize: 46, lineHeight: 46, color: C.text,
            }}>
              Biriyani{'\n'}<Text style={{ color: C.gold }}>Nation</Text>
            </Text>
            <Text style={[S.body, { maxWidth: 280 }]}>
              {brand?.tagline ?? 'Sealed with dough. Dum-cooked 45 minutes. Collected hot from our counter.'}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 26, paddingTop: 10, paddingBottom: 34, gap: 14 }}>
          <Text style={S.eyebrow}>Mobile number</Text>

          <Pressable
            onPress={() => inputRef.current?.focus()}
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
              ref={inputRef}
              value={formatPhone(phone)}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setError(null); }}
              placeholder="98765 43210"
              placeholderTextColor={C.text30}
              keyboardType="number-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              maxLength={11}          // 10 digits + the space we insert
              returnKeyType="go"
              onSubmitEditing={submit}
              autoFocus
              style={{
                flex: 1, fontFamily: F.sans600, fontSize: 16,
                color: C.text, letterSpacing: 1, padding: 0,
              }}
            />
          </Pressable>

          {/* Channel picker — only shown when the backend offers both. */}
          <View style={{
            flexDirection: 'row', gap: 4, padding: 4,
            borderRadius: R.md, backgroundColor: C.card,
            borderWidth: 1, borderColor: C.hair,
          }}>
            <ChannelTab
              label="WhatsApp"
              active={channel === 'whatsapp'}
              onPress={() => setChannel('whatsapp')}
              icon={<Icon.whatsapp color={channel === 'whatsapp' ? C.onGold : C.text45} size={15} />}
            />
            <ChannelTab
              label="SMS"
              active={channel === 'sms'}
              onPress={() => setChannel('sms')}
            />
          </View>

          <ErrorNote message={error} />

          <GoldButton
            label={sending ? 'Sending…' : 'Send code'}
            onPress={submit}
            disabled={!valid}
            loading={sending}
            style={{ marginTop: 2 }}
          />

          <Text style={{
            fontFamily: F.sans, fontSize: 10.5, lineHeight: 17,
            color: C.text30, textAlign: 'center', paddingHorizontal: 12,
          }}>
            We only use your number to confirm orders. By continuing you
            agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ChannelTab({
  label, active, onPress, icon,
}: {
  label: string; active: boolean; onPress: () => void; icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={{
        flex: 1, height: 40, borderRadius: 11,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
        backgroundColor: active ? C.goldBottom : 'transparent',
      }}
    >
      {icon}
      <Text style={{
        fontFamily: F.sans800, fontSize: 12.5,
        color: active ? C.onGold : C.text45,
      }}>
        {label}
      </Text>
    </Pressable>
  );
}

const formatPhone = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
