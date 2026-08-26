import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useApp } from '../../src/lib/store';
import { VegMark, Loading } from '../../src/components/ui';
import { C, F, R, S, rupees } from '../../src/theme';
import type { Dish } from '../../src/lib/types';

type Filter = 'All' | 'Veg' | 'Non-veg';
const FILTERS: Filter[] = ['All', 'Veg', 'Non-veg'];

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const { config, refreshConfig, cartCount } = useApp();
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);

  const dishes = useMemo(() => {
    if (!config) return [];
    return config.dishes.filter((d) =>
      filter === 'All' ? true : filter === 'Veg' ? d.veg : !d.veg,
    );
  }, [config, filter]);

  if (!config) return <Loading />;

  return (
    <View style={S.screen}>
      {/* Sticky header */}
      <View style={{
        paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 14,
        backgroundColor: C.surface,
        borderBottomWidth: 1, borderBottomColor: C.hairSoft,
      }}>
        <Text style={{ fontFamily: F.serif, fontSize: 30, color: C.text }}>The menu</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 11.5, color: C.text45, marginTop: 5 }}>
          {config.dishes.length} biriyanis · every pack cooked to order
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={{
                  height: 34, paddingHorizontal: 15, borderRadius: R.pill,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: active ? 'rgba(227,174,78,0.16)' : 'transparent',
                  borderWidth: 1,
                  borderColor: active ? C.goldLine50 : C.border,
                }}
              >
                <Text style={{
                  fontFamily: F.sans800, fontSize: 11.5,
                  color: active ? C.goldSoft : C.text55,
                }}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: cartCount > 0 ? 110 : 30,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await refreshConfig(); setRefreshing(false); }}
            tintColor={C.gold}
          />
        }
      >
        {dishes.map((dish, i) => (
          <MenuRow key={dish.id} dish={dish} last={i === dishes.length - 1} />
        ))}

        {dishes.length === 0 ? (
          <Text style={[S.body, { paddingTop: 40, textAlign: 'center' }]}>
            Nothing on the menu matches that filter today.
          </Text>
        ) : null}

        <Text style={{
          fontFamily: F.sans, fontSize: 12, lineHeight: 19,
          color: C.text30, paddingTop: 20,
        }}>
          Raita, salan and Double ka Meetha are added at the dish step.
        </Text>
      </ScrollView>
    </View>
  );
}

function MenuRow({ dish, last }: { dish: Dish; last: boolean }) {
  const from = Math.min(...dish.packs.map((p) => p.price));

  return (
    <Pressable
      onPress={() => router.push(`/dish/${dish.id}`)}
      style={({ pressed }) => ({
        flexDirection: 'row', gap: 14, paddingVertical: 17,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.hairSoft,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View style={{ flex: 1, gap: 7 }}>
        <View style={[S.row, { gap: 7, flexWrap: 'wrap' }]}>
          <VegMark veg={dish.veg} />
          <Text style={{
            fontFamily: F.sans700, fontSize: 9, letterSpacing: 1,
            textTransform: 'uppercase', color: C.text45,
          }}>
            {dish.veg ? 'Veg' : 'Non-veg'}
          </Text>
          {dish.bestseller ? (
            <View style={{
              paddingVertical: 3, paddingHorizontal: 6, borderRadius: 5,
              backgroundColor: 'rgba(227,174,78,0.16)',
            }}>
              <Text style={{
                fontFamily: F.sans800, fontSize: 8.5, letterSpacing: 0.9, color: C.goldSoft,
              }}>
                BESTSELLER
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={{ fontFamily: F.sans700, fontSize: 15, lineHeight: 19, color: C.text }}>
          {dish.name}
        </Text>
        <Text
          numberOfLines={2}
          style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16.5, color: C.text45, maxWidth: 210 }}
        >
          {dish.short}
        </Text>

        <View style={[S.row, { gap: 10, marginTop: 2 }]}>
          <Text style={{ fontFamily: F.sans800, fontSize: 14, color: C.goldSoft }}>
            {rupees(from)}
          </Text>
          <Text style={{ fontFamily: F.sans600, fontSize: 10.5, color: C.text35 }}>
            from {dish.packs[0]?.label}{dish.rating ? ` · ★ ${dish.rating}` : ''}
          </Text>
        </View>
      </View>

      <View style={{ width: 96, alignItems: 'center', gap: 9 }}>
        <View style={{
          width: 96, height: 96, borderRadius: R.lg,
          overflow: 'hidden', backgroundColor: C.well,
        }}>
          {dish.image ? (
            <Image
              source={{ uri: dish.image }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.serif, fontSize: 22, color: 'rgba(227,174,78,0.30)' }}>
                B
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            width: 82, height: 32, borderRadius: R.sm,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(227,174,78,0.14)',
            borderWidth: 1, borderColor: C.goldLine50,
          }}
        >
          <Text style={{ fontFamily: F.sans800, fontSize: 11.5, color: C.goldSoft }}>
            ADD
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
