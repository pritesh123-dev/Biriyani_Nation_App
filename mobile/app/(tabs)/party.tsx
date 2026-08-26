import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { useApp } from '../../src/lib/store';
import { Loading, Icon } from '../../src/components/ui';
import { C, F, R, S } from '../../src/theme';

const HERO = require('../../assets/hero-biriyani.jpg');

export default function PartyScreen() {
  const insets = useSafeAreaInsets();
  const { config, cartCount } = useApp();

  if (!config) return <Loading />;

  const { party, store } = config;
  const waNumber = store.whatsapp.replace(/\D/g, '');

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={{ paddingBottom: cartCount > 0 ? 100 : 30 }}
    >
      <View style={{ height: 300 }}>
        <Image
          source={config.brand.heroImage ? { uri: config.brand.heroImage } : HERO}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <Defs>
            <LinearGradient id="partyScrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"   stopColor={C.bg} stopOpacity="0.60" />
              <Stop offset="0.4" stopColor={C.bg} stopOpacity="0.20" />
              <Stop offset="0.96" stopColor="#100C07" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#partyScrim)" />
        </Svg>
        <View style={{ position: 'absolute', left: 22, right: 22, bottom: 26 }}>
          <Text style={S.eyebrowGold}>Catering</Text>
          <Text style={{
            fontFamily: F.serif, fontSize: 38, lineHeight: 39,
            color: C.text, marginTop: 8,
          }}>
            {party.headline}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 6, gap: 16 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 22, color: C.text55 }}>
          {party.blurb}
        </Text>

        <View style={{ gap: 10 }}>
          {party.packs.map((pack) => (
            <View
              key={pack.id}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                padding: 16, borderRadius: R.xl,
                backgroundColor: C.card, borderWidth: 1, borderColor: C.hair,
              }}
            >
              <View style={{
                width: 46, height: 46, borderRadius: 13,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(227,174,78,0.12)',
                borderWidth: 1, borderColor: 'rgba(227,174,78,0.28)',
              }}>
                <Text style={{ fontFamily: F.serif, fontSize: 17, color: C.gold }}>
                  {pack.guests}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontFamily: F.sans700, fontSize: 13.5, color: C.text }}>
                  {pack.name}
                </Text>
                <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16, color: C.text45 }}>
                  {pack.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{
          padding: 18, borderRadius: 20, gap: 14,
          backgroundColor: 'rgba(227,174,78,0.10)',
          borderWidth: 1, borderColor: 'rgba(227,174,78,0.28)',
        }}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 25, color: C.text }}>
            Talk to us directly
          </Text>
          <Text style={{ fontFamily: F.sans, fontSize: 11.5, lineHeight: 18, color: C.text55 }}>
            Party orders are quoted by hand — message or call and we'll confirm
            the menu, timing and price the same day.
          </Text>

          <Pressable
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi! I would like a quote for a party order.')}`,
              ).catch(() => {})
            }
            style={({ pressed }) => ({
              height: 54, borderRadius: 15,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              backgroundColor: C.whatsapp,
              borderWidth: 1, borderColor: 'rgba(78,154,107,0.60)',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon.whatsapp color={C.whatsappFg} size={19} />
            <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.whatsappFg }}>
              WhatsApp {store.whatsapp}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(`tel:${store.phone}`).catch(() => {})}
            style={({ pressed }) => ({
              height: 54, borderRadius: 15,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              backgroundColor: 'rgba(227,174,78,0.10)',
              borderWidth: 1, borderColor: C.goldLine50,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon.phone color={C.goldSoft} size={18} />
            <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.goldSoft }}>
              Call the kitchen
            </Text>
          </Pressable>

          <Text style={{
            fontFamily: F.sans, fontSize: 10.5, color: C.text35, textAlign: 'center',
          }}>
            {store.openTime} – {store.closeTime}, all days · pickup and on-site catering
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
