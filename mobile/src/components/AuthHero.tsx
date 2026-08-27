import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { useApp } from '../lib/store';
import { C, F, S } from '../theme';

const HERO = require('../../assets/hero-biriyani.jpg');

/** The branded hero shared by the sign-in and sign-up screens. */
export default function AuthHero() {
  const { config } = useApp();
  const { height } = useWindowDimensions();
  const heroHeight = Math.min(404, Math.max(280, height * 0.44));
  const brand = config?.brand;

  return (
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

      <View style={{ position: 'absolute', left: 26, right: 26, bottom: 30, gap: 10 }}>
        <View style={[S.row, { gap: 8 }]}>
          <View style={{ width: 22, height: 1, backgroundColor: C.gold }} />
          <Text style={S.eyebrowGold}>
            {brand?.established ?? 'Est. 2024 · Bhubaneswar'}
          </Text>
        </View>
        <Text style={{ fontFamily: F.serif, fontSize: 46, lineHeight: 46, color: C.text }}>
          Biriyani{'\n'}<Text style={{ color: C.gold }}>Nation</Text>
        </Text>
        <Text style={[S.body, { maxWidth: 280 }]}>
          {brand?.tagline ?? 'Sealed with dough. Dum-cooked 45 minutes. Collected hot from our counter.'}
        </Text>
      </View>
    </View>
  );
}
