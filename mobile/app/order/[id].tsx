import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, Linking, AppState, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useApp } from '../../src/lib/store';
import { api, ApiError } from '../../src/lib/api';
import {
  GoldButton, GhostButton, Loading, EmptyState, CoinDot, Icon,
} from '../../src/components/ui';
import { C, F, R, S, rupees } from '../../src/theme';
import type { Order, OrderStatus } from '../../src/lib/types';

/**
 * There is no rider and no map — the customer collects. What they
 * actually need is the pickup code, how long until it is ready, and
 * where the counter is.
 */
const STEPS: { key: OrderStatus; label: string; blurb: string }[] = [
  { key: 'placed',    label: 'Order in',  blurb: 'The kitchen has your order.' },
  { key: 'cooking',   label: 'Dum on',    blurb: 'Sealed under dough and cooking.' },
  { key: 'ready',     label: 'Ready',     blurb: 'Waiting hot at the counter for you.' },
  { key: 'collected', label: 'Collected', blurb: 'Enjoy your biriyani.' },
];

const POLL_MS = 20_000;

export default function OrderScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useApp();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getOrder(String(id));
      setOrder(res.order);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load that order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // Poll while the order is live and the app is in the foreground. A
  // finished order stops polling so a phone left open costs nothing.
  useEffect(() => {
    const live = order && order.status !== 'collected' && order.status !== 'cancelled';

    const start = () => {
      if (timer.current || !live) return;
      timer.current = setInterval(() => { void load(); }, POLL_MS);
    };
    const stop = () => {
      if (timer.current) { clearInterval(timer.current); timer.current = null; }
    };

    start();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') { void load(); start(); } else stop();
    });

    return () => { stop(); sub.remove(); };
  }, [order, load]);

  if (loading) return <Loading label="Fetching your order…" />;

  if (!order) {
    return (
      <View style={[S.screen, { paddingTop: insets.top + 60 }]}>
        <EmptyState
          title="Order not found"
          body={error ?? 'We could not find that order.'}
          actionLabel="Back to home"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.key === order.status));
  const cancelled = order.status === 'cancelled';
  const collected = order.status === 'collected';
  const readyAt = new Date(order.readyAt);

  return (
    <View style={S.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor={C.gold}
          />
        }
      >
        {/* Headline */}
        <View style={{ alignItems: 'center', gap: 14, paddingTop: 8 }}>
          <View style={{
            width: 92, height: 92, borderRadius: 46,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: cancelled ? 'rgba(192,69,58,0.14)' : 'rgba(227,174,78,0.14)',
          }}>
            <Icon.check color={cancelled ? C.nonVeg : C.gold} size={42} />
          </View>
          <Text style={{
            fontFamily: F.serif, fontSize: 32, lineHeight: 35,
            color: C.text, textAlign: 'center',
          }}>
            {cancelled ? 'Order cancelled'
              : collected ? 'Collected —\nenjoy!'
              : order.status === 'ready' ? 'Ready for\npickup'
              : 'Your handi is\non the fire'}
          </Text>
          <Text style={[S.body, { textAlign: 'center', maxWidth: 280 }]}>
            Order <Text style={{ color: C.gold }}>{order.orderNumber}</Text>
            {cancelled ? ' was cancelled. Talk to the counter for a refund.'
              : collected ? ' is done. Thank you.'
              : order.status === 'ready' ? ' is waiting hot at the counter.'
              : ` will be ready around ${formatTime(readyAt)}.`}
          </Text>
        </View>

        {/* Pickup code — the single most important thing on this screen. */}
        {!cancelled && !collected ? (
          <View style={{
            alignItems: 'center', gap: 10, paddingVertical: 22,
            borderRadius: 22,
            backgroundColor: 'rgba(227,174,78,0.12)',
            borderWidth: 1, borderStyle: 'dashed', borderColor: C.goldLine50,
          }}>
            <Text style={S.eyebrow}>Show this at the counter</Text>
            <Text
              accessibilityLabel={`Pickup code ${order.pickupCode.split('').join(' ')}`}
              style={{
                fontFamily: F.serif, fontSize: 46, letterSpacing: 6, color: C.goldSoft,
              }}
            >
              {order.pickupCode}
            </Text>
            <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.text45 }}>
              {order.paymentStatus === 'paid'
                ? 'Paid'
                : order.paymentMethod === 'upi'
                  ? 'UPI payment pending — confirm at the counter'
                  : 'Pay when you collect'}
            </Text>
          </View>
        ) : null}

        {/* Progress */}
        {!cancelled ? (
          <View style={{
            padding: 18, borderRadius: R.xl, gap: 16,
            backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
          }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STEPS.map((step, i) => (
                <View key={step.key} style={{ flex: 1, gap: 7 }}>
                  <View style={{
                    height: 3, borderRadius: 2,
                    backgroundColor: i <= stepIndex ? C.gold : 'rgba(246,238,225,0.12)',
                  }} />
                  <Text style={{
                    fontFamily: F.sans700, fontSize: 9, letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: i <= stepIndex ? C.goldSoft : C.text35,
                  }}>
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={{ fontFamily: F.sans600, fontSize: 12.5, color: C.text70 }}>
              {STEPS[stepIndex]?.blurb}
            </Text>
          </View>
        ) : null}

        {/* Where to collect */}
        <View style={{
          padding: 16, borderRadius: R.xl, gap: 13,
          backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
        }}>
          <Text style={S.eyebrow}>Collect from</Text>
          <View style={[S.row, { gap: 13 }]}>
            <Icon.store color={C.gold} size={20} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: F.sans700, fontSize: 13, color: C.text }}>
                {order.pickup.name}
              </Text>
              <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16, color: C.text45 }}>
                {order.pickup.addressLine1}, {order.pickup.addressLine2}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ActionChip
              label="Open in Maps"
              onPress={() => Linking.openURL(order.pickup.mapsUrl).catch(() => {})}
            />
            <ActionChip
              label="Call the kitchen"
              onPress={() => Linking.openURL(`tel:${order.pickup.phone}`).catch(() => {})}
              icon={<Icon.phone color={C.gold} size={14} />}
            />
          </View>
        </View>

        {/* Items */}
        <View style={{
          padding: 16, borderRadius: R.xl, gap: 11,
          backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
        }}>
          <Text style={S.eyebrow}>Your order</Text>
          {order.quote.lines.map((line, i) => (
            <View key={i} style={S.between}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: F.sans600, fontSize: 12.5, color: C.text }}>
                  {line.dishName} × {line.qty}
                </Text>
                <Text style={{ fontFamily: F.sans, fontSize: 10.5, color: C.text45 }}>
                  {line.packLabel}
                  {line.addons.length ? ` · ${line.addons.map((a) => a.name).join(', ')}` : ''}
                </Text>
              </View>
              <Text style={{ fontFamily: F.sans600, fontSize: 12.5, color: C.text70 }}>
                {rupees(line.lineTotal)}
              </Text>
            </View>
          ))}

          {order.note ? (
            <Text style={{
              fontFamily: F.sans, fontSize: 11, lineHeight: 16,
              color: C.text45, fontStyle: 'italic',
            }}>
              Note: {order.note}
            </Text>
          ) : null}

          <View style={S.hairline} />
          <View style={[S.between, { alignItems: 'baseline' }]}>
            <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.text }}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'To pay'}
            </Text>
            <Text style={{ fontFamily: F.sans800, fontSize: 20, color: C.goldSoft }}>
              {rupees(order.quote.total)}
            </Text>
          </View>
        </View>

        {/* Coins */}
        {!cancelled ? (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 13,
            padding: 16, borderRadius: R.xl,
            backgroundColor: 'rgba(227,174,78,0.12)',
            borderWidth: 1, borderColor: 'rgba(227,174,78,0.30)',
          }}>
            <CoinDot size={38} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.goldSoft }}>
                {collected ? `+${order.quote.coinsEarned} Biriyani Coins` : `${order.quote.coinsEarned} coins on collection`}
              </Text>
              <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.text55 }}>
                Balance {user?.coins ?? 0} · credited when you pick up
              </Text>
            </View>
          </View>
        ) : null}

        <GoldButton label="Back to home" onPress={() => router.replace('/(tabs)')} />
        <GhostButton label="My orders" onPress={() => router.replace('/(tabs)/profile')} />
      </ScrollView>
    </View>
  );
}

function ActionChip({
  label, onPress, icon,
}: { label: string; onPress: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1, height: 42, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
        backgroundColor: 'rgba(227,174,78,0.12)',
        borderWidth: 1, borderColor: 'rgba(227,174,78,0.45)',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon}
      <Text style={{ fontFamily: F.sans800, fontSize: 11.5, color: C.goldSoft }}>
        {label}
      </Text>
    </Pressable>
  );
}

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
