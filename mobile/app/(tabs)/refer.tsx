import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { useApp } from '../../src/lib/store';
import { Loading, Icon } from '../../src/components/ui';
import { C, F, R, S, rupees } from '../../src/theme';

export default function ReferScreen() {
  const insets = useSafeAreaInsets();
  const { config, user, cartCount } = useApp();
  const [copied, setCopied] = useState(false);

  if (!config || !user) return <Loading />;

  const { referral, brand } = config;
  const code = user.referralCode;
  const done = user.referralsCompleted ?? 0;
  const message =
    `Get ${rupees(referral.friendDiscount)} off your first biriyani at ${brand.name}. `
    + `Use my code ${code}.`;

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const steps = [
    { n: '1', title: 'Share your code', sub: `Send ${code} to a friend` },
    { n: '2', title: `They save ${rupees(referral.friendDiscount)}`, sub: 'Applied on their first order' },
    { n: '3', title: `You get ${referral.referrerCoins} coins`, sub: 'Credited the moment they collect' },
  ];

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 18,
        paddingHorizontal: 22,
        paddingBottom: cartCount > 0 ? 100 : 30,
        gap: 20,
      }}
    >
      <View>
        <Text style={S.eyebrowGold}>Refer & earn</Text>
        <Text style={{
          fontFamily: F.serif, fontSize: 34, lineHeight: 36, color: C.text, marginTop: 9,
        }}>
          Give {rupees(referral.friendDiscount)}.{'\n'}Get {referral.referrerCoins} coins.
        </Text>
        <Text style={[S.body, { marginTop: 11 }]}>
          Your friend's first biriyani comes with {rupees(referral.friendDiscount)} off.
          When they collect it, {referral.referrerCoins} Biriyani Coins land in your wallet.
        </Text>
      </View>

      <View style={{
        padding: 20, borderRadius: 20, gap: 14, alignItems: 'center',
        backgroundColor: C.card,
        borderWidth: 1, borderStyle: 'dashed', borderColor: C.goldLine50,
      }}>
        <Text style={S.eyebrow}>Your code</Text>
        <Text
          selectable
          style={{ fontFamily: F.serif, fontSize: 34, letterSpacing: 5, color: C.goldSoft }}
        >
          {code}
        </Text>
        <Pressable
          onPress={copy}
          style={({ pressed }) => ({
            height: 42, paddingHorizontal: 22, borderRadius: 12,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(227,174,78,0.12)',
            borderWidth: 1, borderColor: 'rgba(227,174,78,0.45)',
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ fontFamily: F.sans800, fontSize: 12, color: C.goldSoft }}>
            {copied ? 'Copied' : 'Copy code'}
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() =>
            Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`).catch(() => {})
          }
          style={({ pressed }) => ({
            flex: 1, height: 50, borderRadius: R.md,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: C.whatsapp, opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon.whatsapp color={C.whatsappFg} size={16} />
          <Text style={{ fontFamily: F.sans800, fontSize: 12.5, color: C.whatsappFg }}>
            WhatsApp
          </Text>
        </Pressable>

        <Pressable
          onPress={() => Share.share({ message }).catch(() => {})}
          style={({ pressed }) => ({
            flex: 1, height: 50, borderRadius: R.md,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: C.border, opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ fontFamily: F.sans800, fontSize: 12.5, color: C.text }}>
            More options
          </Text>
        </Pressable>
      </View>

      <View style={{
        padding: 18, borderRadius: 20, gap: 14,
        backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.hairSoft,
      }}>
        <View style={[S.between, { alignItems: 'baseline' }]}>
          <Text style={S.eyebrow}>Your streak</Text>
          <Text style={{ fontFamily: F.sans700, fontSize: 11, color: C.gold }}>
            {done} of {referral.milestoneCount} friends
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {Array.from({ length: referral.milestoneCount }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1, height: 6, borderRadius: 3,
                backgroundColor: i < done ? C.gold : 'rgba(246,238,225,0.12)',
              }}
            />
          ))}
        </View>
        <Text style={{ fontFamily: F.sans, fontSize: 11.5, lineHeight: 17, color: C.text45 }}>
          Refer {referral.milestoneCount} and we send {referral.milestoneReward}.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {steps.map((step) => (
          <View key={step.n} style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}>
            <View style={{
              width: 26, height: 26, borderRadius: 13,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(227,174,78,0.40)',
            }}>
              <Text style={{ fontFamily: F.sans700, fontSize: 11, color: C.gold }}>
                {step.n}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: F.sans700, fontSize: 12.5, color: C.text }}>
                {step.title}
              </Text>
              <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16, color: C.text45 }}>
                {step.sub}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
