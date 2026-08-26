import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, RefreshControl, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { useApp } from '../../src/lib/store';
import {
  CoinBadge, CoinDot, VegMark, GoldButton, Loading, Icon,
} from '../../src/components/ui';
import { C, F, R, S, rupees } from '../../src/theme';
import type { Dish } from '../../src/lib/types';

const HERO = require('../../assets/hero-biriyani.jpg');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { config, user, refreshConfig, refreshUser, cartCount } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshConfig(), refreshUser()]);
    setRefreshing(false);
  }, [refreshConfig, refreshUser]);

  if (!config) return <Loading label="Warming the handi…" />;

  const hero = config.dishes.find((d) => d.bestseller) ?? config.dishes[0];
  const picks = config.dishes.filter((d) => d.id !== hero?.id).slice(0, 6);
  const coins = user?.coins ?? 0;
  const coinsToGo = Math.max(0, config.pricing.coinsForFreeMini - coins);

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: cartCount > 0 ? 96 : 34,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />
      }
    >
      {/* Header: pickup counter, not a delivery address. */}
      <View style={[S.between, { paddingHorizontal: 20 }]}>
        <Pressable
          onPress={() => Linking.openURL(config.store.mapsUrl).catch(() => {})}
          style={{ gap: 2, flex: 1 }}
        >
          <View style={[S.row, { gap: 5 }]}>
            <Icon.store color={C.gold} size={14} />
            <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.text }}>
              {config.store.addressLine1}
            </Text>
          </View>
          <Text style={{ fontFamily: F.sans, fontSize: 10.5, color: C.text45 }}>
            Pickup counter · {config.store.addressLine2}
          </Text>
        </Pressable>
        <CoinBadge coins={coins} />
      </View>

      {/* Open / closed + prep time. Replaces the delivery-vs-pickup toggle. */}
      <StatusStrip
        open={config.openNow}
        prepMinutes={config.store.prepMinutes}
        openTime={config.store.openTime}
        closedMessage={config.store.closedMessage}
      />

      {/* Signature dish */}
      {hero ? (
        <Pressable
          onPress={() => router.push(`/dish/${hero.id}`)}
          style={{
            marginHorizontal: 20, marginTop: 20,
            borderRadius: 24, overflow: 'hidden',
            borderWidth: 1, borderColor: 'rgba(227,174,78,0.22)',
          }}
        >
          <Image
            source={hero.image ? { uri: hero.image } : HERO}
            style={{ width: '100%', height: 320 }}
            contentFit="cover"
            transition={200}
          />
          <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <Defs>
              <LinearGradient id="heroScrim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0"    stopColor={C.bg} stopOpacity="0.45" />
                <Stop offset="0.32" stopColor={C.bg} stopOpacity="0" />
                <Stop offset="0.88" stopColor={C.bg} stopOpacity="0.94" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#heroScrim)" />
          </Svg>

          <View style={{
            position: 'absolute', top: 16, left: 16,
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingVertical: 6, paddingHorizontal: 11, borderRadius: R.pill,
            backgroundColor: 'rgba(11,9,6,0.60)',
            borderWidth: 1, borderColor: 'rgba(227,174,78,0.40)',
          }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.gold }} />
            <Text style={{
              fontFamily: F.sans800, fontSize: 9.5, letterSpacing: 1.3,
              textTransform: 'uppercase', color: C.goldSoft,
            }}>
              Most loved
            </Text>
          </View>

          {hero.rating ? (
            <View style={{
              position: 'absolute', top: 16, right: 16,
              flexDirection: 'row', alignItems: 'center', gap: 4,
              paddingVertical: 6, paddingHorizontal: 10, borderRadius: R.pill,
              backgroundColor: 'rgba(11,9,6,0.60)',
            }}>
              <Text style={{ color: C.gold, fontSize: 11 }}>★</Text>
              <Text style={{ fontFamily: F.sans800, fontSize: 11, color: C.text }}>
                {hero.rating}
              </Text>
            </View>
          ) : null}

          <View style={{
            position: 'absolute', left: 18, right: 18, bottom: 18, gap: 12,
          }}>
            <View style={[S.row, { gap: 7 }]}>
              <VegMark veg={hero.veg} />
              <Text style={{
                fontFamily: F.sans700, fontSize: 9.5, letterSpacing: 1.3,
                textTransform: 'uppercase', color: C.text55,
              }}>
                Signature · ready in {config.store.prepMinutes} min
              </Text>
            </View>
            <Text style={{ fontFamily: F.serif, fontSize: 32, color: C.text }}>
              {hero.name}
            </Text>
            <View style={[S.between, { alignItems: 'flex-end' }]}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: F.sans, fontSize: 11.5, color: C.text55 }}>
                  {hero.packs[1]?.label ?? hero.packs[0]?.label} · {hero.packs[1]?.serves ?? hero.packs[0]?.serves}
                </Text>
                <Text style={{ fontFamily: F.sans800, fontSize: 22, color: C.goldSoft }}>
                  {rupees(hero.packs[1]?.price ?? hero.packs[0]?.price ?? 0)}
                </Text>
              </View>
              <GoldButton
                label="Choose pack"
                onPress={() => router.push(`/dish/${hero.id}`)}
                height={46}
                fontSize={13.5}
                style={{ paddingHorizontal: 22 }}
              />
            </View>
          </View>
        </Pressable>
      ) : null}

      {/* Handi picks */}
      {picks.length ? (
        <>
          <View style={[S.between, {
            paddingHorizontal: 20, marginTop: 22, alignItems: 'baseline',
          }]}>
            <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.text }}>
              Handi picks
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/menu')} hitSlop={8}>
              <Text style={{ fontFamily: F.sans800, fontSize: 11.5, color: C.gold }}>
                Full menu ›
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, marginTop: 12 }}
          >
            {picks.map((dish) => <PickCard key={dish.id} dish={dish} />)}
          </ScrollView>
        </>
      ) : null}

      {/* Coins */}
      <View style={{
        marginHorizontal: 20, marginTop: 22, padding: 16,
        borderRadius: R.xl, flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: 'rgba(227,174,78,0.12)',
        borderWidth: 1, borderColor: 'rgba(227,174,78,0.26)',
      }}>
        <CoinDot size={42} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: F.sans800, fontSize: 13, color: C.goldSoft }}>
            1 Biriyani Coin for every {rupees(1 / config.pricing.coinsPerRupee)}
          </Text>
          <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16, color: C.text55 }}>
            {config.pricing.coinsForFreeMini} coins = a free Mini biriyani.
            {coinsToGo > 0 ? ` You're ${coinsToGo} away.` : ' Yours is ready to claim.'}
          </Text>
        </View>
      </View>

      {/* Shortcuts */}
      <View style={{
        marginHorizontal: 20, marginTop: 14,
        flexDirection: 'row', gap: 12,
      }}>
        {config.party.enabled ? (
          <ShortcutCard
            title="Host a party"
            sub="30 to 300 guests, cooked on site"
            icon={<Icon.party color={C.gold} size={22} />}
            onPress={() => router.push('/(tabs)/party')}
          />
        ) : null}
        {config.referral.enabled ? (
          <ShortcutCard
            title="Refer & earn"
            sub={`Give ${rupees(config.referral.friendDiscount)}, get ${config.referral.referrerCoins} coins`}
            icon={<Icon.refer color={C.gold} size={22} />}
            onPress={() => router.push('/(tabs)/refer')}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

function StatusStrip({
  open, prepMinutes, openTime, closedMessage,
}: {
  open: boolean; prepMinutes: number; openTime: string; closedMessage: string;
}) {
  return (
    <View style={{
      marginHorizontal: 20, marginTop: 18,
      paddingVertical: 13, paddingHorizontal: 16,
      borderRadius: R.md, flexDirection: 'row', alignItems: 'center', gap: 11,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: open ? 'rgba(78,154,107,0.35)' : 'rgba(192,69,58,0.35)',
    }}>
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: open ? C.veg : C.nonVeg,
      }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.sans800, fontSize: 12.5, color: C.text }}>
          {open ? `Counter open · ready in ${prepMinutes} min` : 'Counter closed'}
        </Text>
        <Text style={{ fontFamily: F.sans, fontSize: 10.5, color: C.text45, marginTop: 2 }}>
          {open ? 'Order now, collect hot from the counter' : closedMessage || `We open at ${openTime}`}
        </Text>
      </View>
      <Icon.clock color={open ? C.gold : C.text35} size={18} />
    </View>
  );
}

function PickCard({ dish }: { dish: Dish }) {
  return (
    <Pressable
      onPress={() => router.push(`/dish/${dish.id}`)}
      style={({ pressed }) => ({
        width: 154, borderRadius: R.xl, overflow: 'hidden',
        backgroundColor: C.card,
        borderWidth: 1, borderColor: pressed ? C.goldLine50 : C.hair,
      })}
    >
      <View style={{ height: 112, backgroundColor: C.well }}>
        {dish.image ? (
          <Image
            source={{ uri: dish.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.serif, fontSize: 20, color: 'rgba(227,174,78,0.35)' }}>
              B
            </Text>
          </View>
        )}
      </View>
      <View style={{ padding: 12, gap: 7 }}>
        <View style={[S.row, { gap: 6 }]}>
          <VegMark veg={dish.veg} size={9} />
          <Text style={{
            fontFamily: F.sans700, fontSize: 9, letterSpacing: 0.9,
            textTransform: 'uppercase', color: C.text45,
          }}>
            {dish.veg ? 'Veg' : 'Non-veg'}
          </Text>
        </View>
        <Text
          numberOfLines={2}
          style={{ fontFamily: F.sans700, fontSize: 13, lineHeight: 16, color: C.text, minHeight: 32 }}
        >
          {dish.name}
        </Text>
        <View style={S.between}>
          <Text style={{ fontFamily: F.sans800, fontSize: 13, color: C.goldSoft }}>
            {rupees(Math.min(...dish.packs.map((p) => p.price)))}
          </Text>
          {dish.rating ? (
            <Text style={{ fontFamily: F.sans600, fontSize: 10, color: C.text45 }}>
              ★ {dish.rating}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ShortcutCard({
  title, sub, icon, onPress,
}: {
  title: string; sub: string; icon: React.ReactNode; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1, minHeight: 132, padding: 16, borderRadius: R.xl,
        justifyContent: 'space-between',
        backgroundColor: C.card,
        borderWidth: 1, borderColor: pressed ? C.goldLine50 : C.hair,
      })}
    >
      {icon}
      <View style={{ gap: 5 }}>
        <Text style={{ fontFamily: F.serif, fontSize: 19, color: C.text }}>{title}</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 10.5, lineHeight: 15, color: C.text45 }}>
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}
