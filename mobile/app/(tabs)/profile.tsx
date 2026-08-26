import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, RefreshControl, Alert, Linking,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { useApp } from '../../src/lib/store';
import { api, ApiError } from '../../src/lib/api';
import { Loading, CoinDot, Icon, GoldButton, ErrorNote } from '../../src/components/ui';
import { C, F, R, S, rupees } from '../../src/theme';

interface OrderSummary {
  orderId: string; orderNumber: string; status: string;
  total: number; summary: string; createdAt: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { config, user, refreshUser, signOut, cartCount } = useApp();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.listOrders();
      setOrders(res.orders as OrderSummary[]);
    } catch { /* history is not worth an error screen */ }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadOrders();
    void refreshUser();
  }, [loadOrders, refreshUser]));

  if (!config || !user) return <Loading />;

  const coins = user.coins;
  const target = config.pricing.coinsForFreeMini;
  const pct = Math.min(100, Math.round((coins / target) * 100));
  const toGo = Math.max(0, target - coins);

  const confirmSignOut = () =>
    Alert.alert(
      'Sign out?',
      'You will need to verify your number again to order.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out', style: 'destructive',
          onPress: async () => { await signOut(); router.replace('/(auth)/phone'); },
        },
      ],
    );

  const confirmDelete = () =>
    Alert.alert(
      'Delete your account?',
      'Your profile, coins and order history will be removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount();
            } catch {
              // Even if the call fails we sign out locally rather than
              // stranding someone on a screen they asked to leave.
            }
            await signOut();
            router.replace('/(auth)/phone');
          },
        },
      ],
    );

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 18,
        paddingHorizontal: 22,
        paddingBottom: cartCount > 0 ? 100 : 30,
        gap: 18,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await Promise.all([refreshUser(), loadOrders()]);
            setRefreshing(false);
          }}
          tintColor={C.gold}
        />
      }
    >
      {/* Identity — the phone number is the account, the name is editable. */}
      <Pressable
        onPress={() => setEditingName(true)}
        style={[S.row, { gap: 15 }]}
        accessibilityRole="button"
        accessibilityLabel="Edit your name"
      >
        <View style={{
          width: 60, height: 60, borderRadius: 30,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: C.chip,
          borderWidth: 1, borderColor: 'rgba(227,174,78,0.35)',
        }}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.gold }}>
            {initials(user.displayName, user.phone)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={[S.row, { gap: 8 }]}>
            <Text style={{ fontFamily: F.serif, fontSize: 25, color: C.text }}>
              {user.displayName || 'Add your name'}
            </Text>
            <Text style={{ fontFamily: F.sans700, fontSize: 10.5, color: C.gold }}>Edit</Text>
          </View>
          <Text style={{ fontFamily: F.sans600, fontSize: 11.5, color: C.text45 }}>
            {formatPhone(user.phone)} · {user.orderCount} order{user.orderCount === 1 ? '' : 's'}
          </Text>
        </View>
      </Pressable>

      <EditNameModal
        visible={editingName}
        initialName={user.displayName ?? ''}
        onClose={() => setEditingName(false)}
        onSaved={refreshUser}
      />

      {/* Coins */}
      <View style={{
        padding: 20, borderRadius: 22, gap: 14,
        backgroundColor: 'rgba(227,174,78,0.12)',
        borderWidth: 1, borderColor: 'rgba(227,174,78,0.30)',
      }}>
        <View style={[S.between, { alignItems: 'flex-end' }]}>
          <View style={{ gap: 4 }}>
            <Text style={[S.eyebrow, { color: C.text55 }]}>Biriyani Coins</Text>
            <Text style={{ fontFamily: F.serif, fontSize: 42, color: C.goldSoft }}>
              {coins}
            </Text>
          </View>
          <CoinDot size={44} />
        </View>
        <View style={{
          height: 6, borderRadius: 3, overflow: 'hidden',
          backgroundColor: 'rgba(11,9,6,0.50)',
        }}>
          <View style={{ height: '100%', width: `${pct}%`, backgroundColor: C.goldBottom }} />
        </View>
        <Text style={{ fontFamily: F.sans600, fontSize: 11, color: C.text55 }}>
          {toGo > 0 ? `${toGo} coins to go for a free Mini biriyani` : 'A free Mini biriyani is yours — ask at the counter'}
        </Text>
      </View>

      {/* Order history */}
      <Text style={S.eyebrow}>Recent orders</Text>
      {orders.length === 0 ? (
        <Text style={S.body}>
          No orders yet. Your first handi is waiting on the menu.
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {orders.slice(0, 10).map((order) => (
            <Pressable
              key={order.orderId}
              onPress={() => router.push(`/order/${order.orderId}`)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 13,
                padding: 14, borderRadius: R.lg,
                backgroundColor: C.card,
                borderWidth: 1, borderColor: pressed ? C.goldLine50 : C.hairSoft,
              })}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: F.sans700, fontSize: 12.5, color: C.text }}
                >
                  {order.summary}
                </Text>
                <Text style={{ fontFamily: F.sans, fontSize: 10.5, color: C.text45 }}>
                  {formatDate(order.createdAt)} · {order.orderNumber}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontFamily: F.sans800, fontSize: 12.5, color: C.goldSoft }}>
                  {rupees(order.total)}
                </Text>
                <StatusTag status={order.status} />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Kitchen + account */}
      <View style={{
        borderRadius: R.xl, overflow: 'hidden',
        backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.hairSoft,
      }}>
        <SettingRow
          label="Call the kitchen"
          value={config.store.phone}
          onPress={() => Linking.openURL(`tel:${config.store.phone}`).catch(() => {})}
        />
        <SettingRow
          label="Where to collect"
          value={config.store.addressLine1}
          onPress={() => Linking.openURL(config.store.mapsUrl).catch(() => {})}
        />
        <SettingRow
          label="Opening hours"
          value={`${config.store.openTime} – ${config.store.closeTime}`}
        />
        {config.store.fssai ? (
          <SettingRow label="FSSAI licence" value={config.store.fssai} />
        ) : null}
        <SettingRow label="Sign out" value="" onPress={confirmSignOut} />
        <SettingRow label="Delete my account" value="" danger onPress={confirmDelete} last />
      </View>

      <Text style={{
        fontFamily: F.sans, fontSize: 10, color: C.text30, textAlign: 'center',
      }}>
        {config.brand.name} · menu v{config.version}
      </Text>
    </ScrollView>
  );
}

function SettingRow({
  label, value, onPress, danger, last,
}: {
  label: string; value: string; onPress?: () => void; danger?: boolean; last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 16, paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(246,238,225,0.05)',
        opacity: pressed && onPress ? 0.6 : 1,
      })}
    >
      <Text style={{
        fontFamily: F.sans600, fontSize: 12.5,
        color: danger ? C.nonVeg : C.text85,
      }}>
        {label}
      </Text>
      <Text style={{ fontFamily: F.sans600, fontSize: 11.5, color: C.text35 }}>
        {value}
      </Text>
    </Pressable>
  );
}

function EditNameModal({
  visible, initialName, onClose, onSaved,
}: {
  visible: boolean; initialName: string; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (visible) { setName(initialName); setError(null); } }, [visible, initialName]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Enter a name.'); return; }
    setSaving(true);
    setError(null);
    try {
      await api.updateMe({ displayName: trimmed });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={onClose}
          style={{ ...S.screen, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)' }}
        />
        <View style={{
          padding: 22, paddingBottom: 34, gap: 14,
          backgroundColor: C.surface, borderTopLeftRadius: R.xxl, borderTopRightRadius: R.xxl,
          borderWidth: 1, borderColor: C.hair, borderBottomWidth: 0,
        }}>
          <Text style={{ fontFamily: F.serif, fontSize: 24, color: C.text }}>Your name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ananya Mishra"
            placeholderTextColor={C.text30}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={save}
            style={{
              height: 52, borderRadius: R.md, paddingHorizontal: 16,
              backgroundColor: C.card, borderWidth: 1, borderColor: C.goldLine,
              fontFamily: F.sans600, fontSize: 15, color: C.text,
            }}
          />
          <ErrorNote message={error} />
          <GoldButton label={saving ? 'Saving…' : 'Save'} onPress={save} loading={saving} height={52} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    placed:    { label: 'Placed',    color: C.gold },
    cooking:   { label: 'Cooking',   color: C.gold },
    ready:     { label: 'Ready',     color: C.veg },
    collected: { label: 'Collected', color: C.text35 },
    cancelled: { label: 'Cancelled', color: C.nonVeg },
  };
  const tag = map[status] ?? { label: status, color: C.text35 };
  return (
    <Text style={{ fontFamily: F.sans700, fontSize: 9.5, color: tag.color }}>
      {tag.label}
    </Text>
  );
}

const initials = (name: string | null, phone: string) => {
  if (name?.trim()) {
    return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
  return phone.slice(-2);
};

const formatPhone = (e164: string) => {
  const n = e164.replace(/^\+91/, '');
  return n.length === 10 ? `+91 ${n.slice(0, 5)} ${n.slice(5)}` : e164;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
