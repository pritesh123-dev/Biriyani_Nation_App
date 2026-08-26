import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useApp } from '../src/lib/store';
import { api, ApiError } from '../src/lib/api';
import { BackButton, GoldButton, ErrorNote, Icon } from '../src/components/ui';
import { C, F, R, S, rupees } from '../src/theme';
import type { Quote } from '../src/lib/types';

type Method = 'counter' | 'upi';

/**
 * Pickup-only checkout. Paying at the counter costs the kitchen nothing
 * in gateway fees, so it is the default; UPI is offered as a convenience
 * and can be switched off in remote config.
 */
export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { config, cart, clearCart, refreshUser } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [method, setMethod] = useState<Method>('counter');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(
    () => cart.map(({ dishId, packId, qty, addonIds }) => ({ dishId, packId, qty, addonIds })),
    [cart],
  );
  const promoCode = config?.pricing.promo?.active ? config.pricing.promo.code : undefined;

  useEffect(() => {
    if (!config) return;
    // Honour whichever methods the kitchen currently accepts.
    if (!config.payments.payAtCounter && config.payments.upi) setMethod('upi');
    if (!config.payments.upi && config.payments.payAtCounter) setMethod('counter');
  }, [config]);

  useEffect(() => {
    (async () => {
      if (lines.length === 0) return;
      try {
        const res = await api.quote(lines, promoCode);
        setQuote(res.quote);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not price your order.');
      }
    })();
  }, [lines, promoCode]);

  const placeOrder = useCallback(async () => {
    if (placing || !quote) return;
    setPlacing(true);
    setError(null);
    try {
      const { order } = await api.createOrder({
        lines,
        promoCode,
        paymentMethod: method,
        note: note.trim() || undefined,
      });

      clearCart();
      void refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      // For UPI we hand off to the user's UPI app with a prefilled intent.
      // The kitchen confirms receipt at the counter — no gateway, no fees.
      if (method === 'upi' && config?.payments.upiId) {
        const url =
          `upi://pay?pa=${encodeURIComponent(config.payments.upiId)}`
          + `&pn=${encodeURIComponent(config.payments.upiPayeeName)}`
          + `&am=${order.quote.total}`
          + `&cu=INR`
          + `&tn=${encodeURIComponent(order.orderNumber)}`;
        Linking.openURL(url).catch(() => { /* no UPI app installed */ });
      }

      router.replace(`/order/${order.orderId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not place your order.');
      setPlacing(false);
    }
  }, [placing, quote, lines, promoCode, method, note, clearCart, refreshUser, config]);

  if (!config) return null;

  return (
    <KeyboardAvoidingView
      style={S.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{
        paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <BackButton onPress={() => router.back()} />
        <Text style={{ fontFamily: F.serif, fontSize: 26, color: C.text }}>Checkout</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <View style={{
          padding: 20, borderRadius: 20, gap: 5,
          backgroundColor: 'rgba(227,174,78,0.12)',
          borderWidth: 1, borderColor: 'rgba(227,174,78,0.28)',
        }}>
          <Text style={[S.eyebrow, { color: C.text55 }]}>Amount payable</Text>
          <Text style={{ fontFamily: F.serif, fontSize: 40, color: C.goldSoft }}>
            {quote ? rupees(quote.total) : '—'}
          </Text>
          <Text style={{ fontFamily: F.sans, fontSize: 11.5, color: C.text55 }}>
            {quote?.itemCount ?? 0} items · pickup from {config.store.addressLine1}
          </Text>
        </View>

        {/* Pickup details */}
        <View style={{
          padding: 16, borderRadius: R.xl, gap: 12,
          backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
        }}>
          <Text style={S.eyebrow}>Collect from</Text>
          <View style={[S.row, { gap: 13 }]}>
            <Icon.store color={C.gold} size={20} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: F.sans700, fontSize: 13, color: C.text }}>
                {config.store.name}
              </Text>
              <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16, color: C.text45 }}>
                {config.store.addressLine1}, {config.store.addressLine2}
              </Text>
            </View>
          </View>
          <View style={[S.row, { gap: 13 }]}>
            <Icon.clock color={C.gold} size={20} />
            <Text style={{ flex: 1, fontFamily: F.sans, fontSize: 11.5, color: C.text55 }}>
              Ready about {config.store.prepMinutes} minutes after you order.
              We hold it hot for 30 minutes.
            </Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL(config.store.mapsUrl).catch(() => {})}
            style={{ alignSelf: 'flex-start' }}
          >
            <Text style={{ fontFamily: F.sans700, fontSize: 11.5, color: C.gold }}>
              Open in Maps ›
            </Text>
          </Pressable>
        </View>

        {/* Payment */}
        <Text style={S.eyebrow}>Pay using</Text>
        <View style={{ gap: 10 }}>
          {config.payments.payAtCounter ? (
            <MethodRow
              active={method === 'counter'}
              onPress={() => setMethod('counter')}
              icon="₹"
              iconBg="#22190F"
              iconFg={C.cream}
              name="Pay at the counter"
              sub="Cash, card or UPI when you collect"
            />
          ) : null}
          {config.payments.upi ? (
            <MethodRow
              active={method === 'upi'}
              onPress={() => setMethod('upi')}
              icon="U"
              iconBg="#1B2A1F"
              iconFg="#8FD3A6"
              name="Pay now by UPI"
              sub={config.payments.upiId}
            />
          ) : null}
        </View>

        {/* Note */}
        <View style={{ gap: 7 }}>
          <Text style={S.eyebrow}>Note for the kitchen (optional)</Text>
          <TextInput
            value={note}
            onChangeText={(t) => setNote(t.slice(0, 200))}
            placeholder="Less spicy, extra raita…"
            placeholderTextColor={C.text30}
            multiline
            style={{
              minHeight: 70, borderRadius: R.md, padding: 14,
              backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
              fontFamily: F.sans, fontSize: 13, color: C.text,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <ErrorNote message={error} />

        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 9,
          paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.md,
          backgroundColor: C.card, borderWidth: 1, borderColor: C.hairSoft,
        }}>
          <Icon.lock color={C.veg} size={16} />
          <Text style={{ flex: 1, fontFamily: F.sans600, fontSize: 10.5, color: C.text45 }}>
            No card details are stored. Refunds are handled at the counter within 48 hours.
          </Text>
        </View>
      </ScrollView>

      <View style={{
        paddingHorizontal: 20, paddingTop: 14,
        paddingBottom: insets.bottom + 14,
        backgroundColor: C.surface,
        borderTopWidth: 1, borderTopColor: C.hair,
      }}>
        <GoldButton
          label={
            !config.openNow ? 'Counter closed'
              : method === 'upi' ? `Pay ${quote ? rupees(quote.total) : ''} by UPI`
              : `Place order · ${quote ? rupees(quote.total) : ''}`
          }
          onPress={placeOrder}
          disabled={!config.openNow || !quote}
          loading={placing}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function MethodRow({
  active, onPress, icon, iconBg, iconFg, name, sub,
}: {
  active: boolean; onPress: () => void;
  icon: string; iconBg: string; iconFg: string;
  name: string; sub: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 13,
        padding: 16, borderRadius: R.lg,
        backgroundColor: active ? 'rgba(227,174,78,0.12)' : C.card,
        borderWidth: 1,
        borderColor: active ? 'rgba(227,174,78,0.60)' : 'rgba(246,238,225,0.10)',
      }}
    >
      <View style={{
        width: 36, height: 36, borderRadius: R.sm,
        alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg,
      }}>
        <Text style={{ fontFamily: F.sans800, fontSize: 13, color: iconFg }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: F.sans700, fontSize: 13.5, color: C.text }}>{name}</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 10.5, color: C.text45 }}>{sub}</Text>
      </View>
      <View style={{
        width: 19, height: 19, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.6, borderColor: active ? C.gold : 'rgba(246,238,225,0.28)',
      }}>
        {active ? (
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.gold }} />
        ) : null}
      </View>
    </Pressable>
  );
}
