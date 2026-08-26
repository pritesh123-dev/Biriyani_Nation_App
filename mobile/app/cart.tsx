import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useApp } from '../src/lib/store';
import { api, ApiError } from '../src/lib/api';
import {
  BackButton, GoldButton, QtyStepper, EmptyState, ErrorNote, CoinDot, Icon,
} from '../src/components/ui';
import { C, F, R, S, rupees } from '../src/theme';
import type { Quote } from '../src/lib/types';

const HERO = require('../assets/hero-biriyani.jpg');

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { config, cart, setLineQty, dishById, signedIn } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [pricing, setPricing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promoCode = config?.pricing.promo?.active ? config.pricing.promo.code : undefined;

  // The server prices the cart — the client only ever shows the result.
  const lines = useMemo(
    () => cart.map(({ dishId, packId, qty, addonIds }) => ({ dishId, packId, qty, addonIds })),
    [cart],
  );

  const reprice = useCallback(async () => {
    if (!signedIn || lines.length === 0) { setQuote(null); return; }
    setPricing(true);
    setError(null);
    try {
      const res = await api.quote(lines, promoCode);
      setQuote(res.quote);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not price your cart.');
      setQuote(null);
    } finally {
      setPricing(false);
    }
  }, [signedIn, lines, promoCode]);

  useEffect(() => { void reprice(); }, [reprice]);

  const empty = cart.length === 0;

  return (
    <View style={S.screen}>
      <View style={{
        paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <BackButton onPress={() => router.back()} />
        <Text style={{ fontFamily: F.serif, fontSize: 26, color: C.text }}>Your cart</Text>
      </View>

      <ScrollView contentContainerStyle={{
        paddingHorizontal: 20, paddingBottom: 24, gap: 14,
      }}>
        {empty ? (
          <EmptyState
            title="Nothing sealed yet"
            body="Pick a handi from the menu and we'll start the dum."
            actionLabel="Browse the menu"
            onAction={() => router.replace('/(tabs)/menu')}
          />
        ) : (
          <>
            {cart.map((line) => {
              const dish = dishById(line.dishId);
              const pack = dish?.packs.find((p) => p.id === line.packId);
              if (!dish || !pack) return null;

              const addonTotal = line.addonIds.reduce(
                (sum, id) => sum + (config?.addons.find((a) => a.id === id)?.price ?? 0), 0,
              );
              const lineTotal = (pack.price + addonTotal) * line.qty;

              return (
                <View
                  key={line.key}
                  style={{
                    flexDirection: 'row', gap: 13, padding: 14, borderRadius: R.xl,
                    backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
                  }}
                >
                  <View style={{
                    width: 62, height: 62, borderRadius: 13,
                    overflow: 'hidden', backgroundColor: C.well,
                  }}>
                    <Image
                      source={dish.image ? { uri: dish.image } : HERO}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>

                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={{ fontFamily: F.sans700, fontSize: 13.5, lineHeight: 17, color: C.text }}>
                      {dish.name}
                    </Text>
                    <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.text45 }}>
                      {pack.label} · {pack.serves.toLowerCase()}
                      {line.addonIds.length
                        ? ` · +${line.addonIds.length} add-on${line.addonIds.length > 1 ? 's' : ''}`
                        : ''}
                    </Text>
                    <View style={[S.between, { marginTop: 3 }]}>
                      <QtyStepper
                        qty={line.qty}
                        onChange={(n) => setLineQty(line.key, n)}
                        tone="gold"
                      />
                      <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.goldSoft }}>
                        {rupees(lineTotal)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <ErrorNote message={error} />

            {/* Promo */}
            {quote?.promoCode ? (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingVertical: 14, paddingHorizontal: 16, borderRadius: R.lg,
                borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(227,174,78,0.40)',
                backgroundColor: 'rgba(227,174,78,0.06)',
              }}>
                <Text style={{ flex: 1, fontFamily: F.sans700, fontSize: 12.5, color: C.goldSoft }}>
                  {quote.promoCode} applied — {rupees(quote.discount)} off
                </Text>
              </View>
            ) : null}

            {/* Bill */}
            <View style={{
              padding: 16, borderRadius: R.xl, gap: 11,
              backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
            }}>
              <View style={S.between}>
                <Text style={S.eyebrow}>Bill details</Text>
                {pricing ? <ActivityIndicator size="small" color={C.gold} /> : null}
              </View>

              {quote ? (
                <>
                  <BillRow label="Item total" value={rupees(quote.subtotal)} />
                  {quote.discount > 0 ? (
                    <BillRow
                      label={`${quote.promoCode} discount`}
                      value={`−${rupees(quote.discount)}`}
                      color={C.veg}
                    />
                  ) : null}
                  {quote.packagingFee > 0 ? (
                    <BillRow label="Packaging" value={rupees(quote.packagingFee)} />
                  ) : null}
                  <BillRow label="Taxes & charges" value={rupees(quote.taxes)} />
                  <BillRow label="Pickup" value="FREE" color={C.veg} />

                  <View style={S.hairline} />

                  <View style={[S.between, { alignItems: 'baseline' }]}>
                    <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.text }}>
                      To pay
                    </Text>
                    <Text style={{ fontFamily: F.sans800, fontSize: 20, color: C.goldSoft }}>
                      {rupees(quote.total)}
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    paddingVertical: 9, paddingHorizontal: 12, borderRadius: 11,
                    backgroundColor: 'rgba(227,174,78,0.12)',
                  }}>
                    <CoinDot size={17} />
                    <Text style={{ fontFamily: F.sans700, fontSize: 11.5, color: C.goldSoft }}>
                      You'll earn {quote.coinsEarned} Biriyani Coins on this order
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={S.body}>
                  {pricing ? 'Working out your bill…' : 'We could not price this cart.'}
                </Text>
              )}
            </View>

            {/* Pickup point — replaces the delivery address block. */}
            {config ? (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 13,
                paddingVertical: 15, paddingHorizontal: 16, borderRadius: R.xl,
                backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
              }}>
                <Icon.store color={C.gold} size={19} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: F.sans700, fontSize: 12.5, color: C.text }}>
                    Pickup — {config.store.addressLine1}
                  </Text>
                  <Text style={{ fontFamily: F.sans, fontSize: 10.5, color: C.text45 }}>
                    Ready in {config.store.prepMinutes} min · show your code at the counter
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {!empty && quote ? (
        <View style={{
          paddingHorizontal: 20, paddingTop: 14,
          paddingBottom: insets.bottom + 14,
          flexDirection: 'row', alignItems: 'center', gap: 14,
          backgroundColor: C.surface,
          borderTopWidth: 1, borderTopColor: C.hair,
        }}>
          <View style={{ gap: 1 }}>
            <Text style={{ fontFamily: F.sans600, fontSize: 10.5, color: C.text45 }}>
              {quote.itemCount} item{quote.itemCount === 1 ? '' : 's'}
            </Text>
            <Text style={{ fontFamily: F.sans800, fontSize: 18, color: C.goldSoft }}>
              {rupees(quote.total)}
            </Text>
          </View>
          <GoldButton
            label={config?.openNow ? 'Continue ›' : 'Counter closed'}
            onPress={() => router.push('/checkout')}
            disabled={!config?.openNow || pricing}
            height={54}
            fontSize={14}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </View>
  );
}

function BillRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={S.between}>
      <Text style={{ fontFamily: F.sans600, fontSize: 12.5, color: color ?? C.text70 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: F.sans600, fontSize: 12.5, color: color ?? C.text70 }}>
        {value}
      </Text>
    </View>
  );
}
