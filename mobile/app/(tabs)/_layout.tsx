import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../src/lib/store';
import { Icon } from '../../src/components/ui';
import { C, F, R, rupees } from '../../src/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { cartCount, cartEstimate, config } = useApp();
  const showCartBar = cartCount > 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Tabs
        sceneContainerStyle={{ backgroundColor: C.bg }}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: C.gold,
          tabBarInactiveTintColor: 'rgba(246,238,225,0.42)',
          tabBarLabelStyle: { fontFamily: F.sans700, fontSize: 9.5, letterSpacing: 0.3 },
          tabBarStyle: {
            backgroundColor: '#100C07',
            borderTopColor: 'rgba(227,174,78,0.14)',
            borderTopWidth: 1,
            height: 58 + insets.bottom,
            paddingTop: 8,
            paddingBottom: insets.bottom + 6,
            elevation: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Icon.home color={color} />,
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color }) => <Icon.menu color={color} />,
          }}
        />
        <Tabs.Screen
          name="party"
          options={{
            title: 'Party',
            href: config?.party.enabled === false ? null : undefined,
            tabBarIcon: ({ color }) => <Icon.party color={color} />,
          }}
        />
        <Tabs.Screen
          name="refer"
          options={{
            title: 'Refer',
            href: config?.referral.enabled === false ? null : undefined,
            tabBarIcon: ({ color }) => <Icon.refer color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'You',
            tabBarIcon: ({ color }) => <Icon.you color={color} />,
          }}
        />
      </Tabs>

      {/* Floating cart pill, exactly as in the design. */}
      {showCartBar ? (
        <Pressable
          onPress={() => router.push('/cart')}
          accessibilityRole="button"
          accessibilityLabel={`View cart, ${cartCount} items, ${rupees(cartEstimate)}`}
          style={({ pressed }) => ({
            position: 'absolute',
            right: 16,
            bottom: 58 + insets.bottom + 14,
            height: 46, paddingHorizontal: 18,
            borderRadius: R.md,
            flexDirection: 'row', alignItems: 'center', gap: 9,
            backgroundColor: C.goldBottom,
            opacity: pressed ? 0.9 : 1,
            shadowColor: '#000', shadowOpacity: 0.55,
            shadowRadius: 26, shadowOffset: { width: 0, height: 12 },
            elevation: 10,
          })}
        >
          <View style={{
            width: 19, height: 19, borderRadius: 10,
            backgroundColor: 'rgba(36,25,5,0.16)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: F.sans800, fontSize: 10.5, color: C.onGold }}>
              {cartCount}
            </Text>
          </View>
          <Text style={{ fontFamily: F.sans800, fontSize: 12.5, color: C.onGold }}>
            {rupees(cartEstimate)} · View cart
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
