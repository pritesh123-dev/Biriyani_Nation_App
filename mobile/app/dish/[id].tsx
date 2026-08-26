import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { useApp } from '../../src/lib/store';
import {
  BackButton, GoldButton, VegMark, QtyStepper, EmptyState,
} from '../../src/components/ui';
import { C, F, R, S, rupees } from '../../src/theme';

const HERO = require('../../assets/hero-biriyani.jpg');

export default function DishScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { config, dishById, addToCart } = useApp();

  const dish = dishById(String(id));
  // Default to the middle pack — the "Regular" most people want.
  const [packId, setPackId] = useState(() => dish?.packs[1]?.id ?? dish?.packs[0]?.id ?? '');
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const total = useMemo(() => {
    if (!dish || !config) return 0;
    const pack = dish.packs.find((p) => p.id === packId);
    if (!pack) return 0;
    const addons = addonIds.reduce(
      (sum, aid) => sum + (config.addons.find((a) => a.id === aid)?.price ?? 0), 0,
    );
    return (pack.price + addons) * qty;
  }, [dish, config, packId, addonIds, qty]);

  if (!dish || !config) {
    return (
      <View style={[S.screen, { paddingTop: insets.top + 60 }]}>
        <EmptyState
          title="Dish not found"
          body="This dish may have come off the menu. Have a look at what we are cooking today."
          actionLabel="Back to the menu"
          onAction={() => router.replace('/(tabs)/menu')}
        />
      </View>
    );
  }

  const toggleAddon = (aid: string) =>
    setAddonIds((prev) =>
      prev.includes(aid) ? prev.filter((x) => x !== aid) : [...prev, aid],
    );

  const submit = () => {
    addToCart({ dishId: dish.id, packId, qty, addonIds });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/cart');
  };

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} bounces={false}>
        {/* Photo */}
        <View style={{ height: 322, backgroundColor: C.well }}>
          <Image
            source={dish.image ? { uri: dish.image } : HERO}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
          <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <Defs>
              <LinearGradient id="dishScrim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0"   stopColor={C.bg} stopOpacity="0.50" />
                <Stop offset="0.4" stopColor={C.bg} stopOpacity="0" />
                <Stop offset="1"   stopColor="#100C07" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#dishScrim)" />
          </Svg>
          <BackButton
            onPress={() => router.back()}
            style={{
              position: 'absolute', top: insets.top + 8, left: 18,
              backgroundColor: 'rgba(11,9,6,0.65)', borderColor: 'transparent',
            }}
          />
        </View>

        <View style={{
          paddingHorizontal: 22, marginTop: -40, gap: 14,
        }}>
          <View style={[S.row, { gap: 8 }]}>
            <VegMark veg={dish.veg} size={12} />
            <Text style={{
              fontFamily: F.sans700, fontSize: 9.5, letterSpacing: 1.3,
              textTransform: 'uppercase', color: C.text55,
            }}>
              {dish.veg ? 'Pure veg' : 'Non-veg'}
            </Text>
            {dish.rating ? (
              <Text style={{ fontFamily: F.sans700, fontSize: 10, color: C.gold }}>
                ★ {dish.rating}
              </Text>
            ) : null}
          </View>

          <Text style={{ fontFamily: F.serif, fontSize: 32, lineHeight: 34, color: C.text }}>
            {dish.name}
          </Text>
          <Text style={{ fontFamily: F.sans, fontSize: 12.5, lineHeight: 21, color: C.text55 }}>
            {dish.desc}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {[`Ready in ${config.store.prepMinutes} min`, 'Aged basmati', 'Collect at counter'].map((chip) => (
              <View
                key={chip}
                style={{
                  paddingVertical: 6, paddingHorizontal: 11, borderRadius: R.pill,
                  backgroundColor: C.card, borderWidth: 1, borderColor: 'rgba(246,238,225,0.10)',
                }}
              >
                <Text style={{ fontFamily: F.sans600, fontSize: 10.5, color: C.text55 }}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>

          <View style={[S.hairline, { marginVertical: 4 }]} />

          {/* Pack */}
          <Text style={S.eyebrow}>Choose your pack</Text>
          <View style={{ gap: 10 }}>
            {dish.packs.map((pack) => {
              const active = pack.id === packId;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => setPackId(pack.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    paddingVertical: 15, paddingHorizontal: 16, borderRadius: R.lg,
                    backgroundColor: active ? 'rgba(227,174,78,0.12)' : C.card,
                    borderWidth: 1,
                    borderColor: active ? 'rgba(227,174,78,0.60)' : 'rgba(246,238,225,0.10)',
                  }}
                >
                  <Radio active={active} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.text }}>
                      {pack.label}
                    </Text>
                    <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.text45 }}>
                      {pack.serves} · {pack.grams}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: F.sans800, fontSize: 15, color: C.goldSoft }}>
                    {rupees(pack.price)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Add-ons */}
          {config.addons.length ? (
            <>
              <Text style={[S.eyebrow, { marginTop: 6 }]}>Make it a feast</Text>
              <View style={{ gap: 9 }}>
                {config.addons.map((addon) => {
                  const active = addonIds.includes(addon.id);
                  return (
                    <Pressable
                      key={addon.id}
                      onPress={() => toggleAddon(addon.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 13,
                        paddingVertical: 13, paddingHorizontal: 15, borderRadius: R.md,
                        backgroundColor: C.card,
                        borderWidth: 1,
                        borderColor: active ? 'rgba(227,174,78,0.55)' : 'rgba(246,238,225,0.08)',
                      }}
                    >
                      <Checkbox active={active} />
                      <Text style={{ flex: 1, fontFamily: F.sans700, fontSize: 13, color: C.text }}>
                        {addon.name}
                      </Text>
                      <Text style={{ fontFamily: F.sans700, fontSize: 13, color: C.goldSoft }}>
                        +{rupees(addon.price)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={{
        paddingHorizontal: 20, paddingTop: 14,
        paddingBottom: insets.bottom + 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: C.surface,
        borderTopWidth: 1, borderTopColor: C.hair,
      }}>
        <QtyStepper qty={qty} onChange={(n) => setQty(Math.max(1, Math.min(20, n)))} />
        <GoldButton
          label={config.openNow ? `Add to cart · ${rupees(total)}` : 'Counter closed'}
          onPress={submit}
          disabled={!config.openNow}
          height={52}
          fontSize={14}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <View style={{
      width: 19, height: 19, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.6, borderColor: active ? C.gold : 'rgba(246,238,225,0.28)',
    }}>
      {active ? (
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.gold }} />
      ) : null}
    </View>
  );
}

function Checkbox({ active }: { active: boolean }) {
  return (
    <View style={{
      width: 18, height: 18, borderRadius: 5,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.6,
      borderColor: active ? C.gold : 'rgba(246,238,225,0.30)',
      backgroundColor: active ? C.gold : 'transparent',
    }}>
      {active ? (
        <Text style={{ fontFamily: F.sans800, fontSize: 11, color: C.onGold }}>✓</Text>
      ) : null}
    </View>
  );
}
