import React from 'react';
import {
  View, Text, Pressable, ActivityIndicator, StyleSheet,
  type ViewStyle, type TextStyle, type StyleProp,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { C, F, R, S, markColor } from '../theme';

// ────────────────────────────── Buttons ──────────────────────────────

/**
 * The gold pill from the design. RN cannot do CSS gradients on a View,
 * so the fill is an absolutely-positioned SVG behind the label.
 */
export function GoldButton({
  label, onPress, disabled, loading, style, height = 56, fontSize = 15,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  height?: number;
  fontSize?: number;
}) {
  const inert = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      style={({ pressed }) => [
        {
          height, borderRadius: R.lg, overflow: 'hidden',
          alignItems: 'center', justifyContent: 'center',
          opacity: inert ? 0.45 : pressed ? 0.88 : 1,
          backgroundColor: inert ? 'rgba(246,238,225,0.10)' : C.goldBottom,
        },
        style,
      ]}
    >
      {!inert && (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.goldTop} />
              <Stop offset="1" stopColor={C.goldBottom} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#gold)" />
        </Svg>
      )}
      {loading ? (
        <ActivityIndicator color={C.onGold} />
      ) : (
        <Text style={{
          fontFamily: F.sans800, fontSize,
          color: inert ? C.text35 : C.onGold,
        }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function GhostButton({
  label, onPress, style, height = 52,
}: {
  label: string; onPress: () => void; style?: StyleProp<ViewStyle>; height?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        S.ghostBtn, { height, opacity: pressed ? 0.7 : 1 }, style,
      ]}
    >
      <Text style={S.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

export function BackButton({ onPress, style }: { onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={10}
      style={({ pressed }) => [S.backBtn, { opacity: pressed ? 0.6 : 1 }, style]}
    >
      <Text style={{ fontFamily: F.sans600, fontSize: 20, color: C.text, marginTop: -2 }}>‹</Text>
    </Pressable>
  );
}

// ───────────────────────────── Indicators ────────────────────────────

/** The FSSAI-style veg / non-veg square. */
export function VegMark({ veg, size = 11 }: { veg: boolean; size?: number }) {
  const color = markColor(veg);
  return (
    <View
      accessibilityLabel={veg ? 'Vegetarian' : 'Non-vegetarian'}
      style={{
        width: size, height: size, borderWidth: 1.5, borderColor: color,
        borderRadius: size / 4, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <View style={{
        width: size * 0.45, height: size * 0.45,
        borderRadius: size * 0.25, backgroundColor: color,
      }} />
    </View>
  );
}

export function CoinBadge({ coins, compact }: { coins: number; compact?: boolean }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 7,
      paddingVertical: 7, paddingLeft: 8, paddingRight: 12,
      borderRadius: R.pill, backgroundColor: 'rgba(227,174,78,0.13)',
      borderWidth: 1, borderColor: 'rgba(227,174,78,0.30)',
    }}>
      <CoinDot size={20} />
      <Text style={{ fontFamily: F.sans800, fontSize: 12.5, color: C.goldSoft }}>
        {coins}{compact ? '' : ''}
      </Text>
    </View>
  );
}

export function CoinDot({ size = 20 }: { size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: C.goldBottom, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontFamily: F.sans800, fontSize: size * 0.5, color: C.onGold }}>B</Text>
    </View>
  );
}

export function Pill({ text, tone = 'gold' }: { text: string; tone?: 'gold' | 'red' | 'muted' }) {
  const map = {
    gold:  { bg: 'rgba(227,174,78,0.16)', fg: C.goldSoft, border: 'rgba(227,174,78,0.40)' },
    red:   { bg: C.nonVegWash, fg: '#E2857B', border: 'rgba(192,69,58,0.40)' },
    muted: { bg: C.card, fg: C.text55, border: C.hair },
  }[tone];
  return (
    <View style={{
      alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7,
      paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.pill,
      backgroundColor: map.bg, borderWidth: 1, borderColor: map.border,
    }}>
      <Text style={{
        fontFamily: F.sans700, fontSize: 9.5, letterSpacing: 1.2,
        textTransform: 'uppercase', color: map.fg,
      }}>
        {text}
      </Text>
    </View>
  );
}

// ─────────────────────────── Quantity stepper ────────────────────────

export function QtyStepper({
  qty, onChange, tone = 'plain',
}: {
  qty: number; onChange: (next: number) => void; tone?: 'plain' | 'gold';
}) {
  const gold = tone === 'gold';
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      height: gold ? 32 : 52, paddingHorizontal: gold ? 11 : 14,
      gap: gold ? 12 : 14, borderRadius: gold ? R.sm : 15,
      backgroundColor: gold ? 'rgba(227,174,78,0.10)' : C.card,
      borderWidth: 1, borderColor: gold ? 'rgba(227,174,78,0.30)' : 'rgba(246,238,225,0.12)',
    }}>
      <Pressable
        onPress={() => onChange(qty - 1)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Text style={{ fontFamily: F.sans800, fontSize: gold ? 15 : 19, color: C.gold }}>−</Text>
      </Pressable>
      <Text style={{
        fontFamily: F.sans800, fontSize: gold ? 12.5 : 15,
        color: gold ? C.goldSoft : C.text, minWidth: 12, textAlign: 'center',
      }}>
        {qty}
      </Text>
      <Pressable
        onPress={() => onChange(qty + 1)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Text style={{ fontFamily: F.sans800, fontSize: gold ? 15 : 19, color: C.gold }}>+</Text>
      </Pressable>
    </View>
  );
}

// ───────────────────────────── Feedback ──────────────────────────────

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 9,
      paddingVertical: 11, paddingHorizontal: 14, borderRadius: R.md,
      backgroundColor: C.nonVegWash, borderWidth: 1, borderColor: 'rgba(192,69,58,0.35)',
    }}>
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.nonVeg }} />
      <Text style={{ flex: 1, fontFamily: F.sans600, fontSize: 12, color: '#E2857B' }}>
        {message}
      </Text>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <ActivityIndicator color={C.gold} size="large" />
      {label ? (
        <Text style={{ fontFamily: F.serif, fontSize: 18, color: C.text55 }}>{label}</Text>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title, body, actionLabel, onAction,
}: {
  title: string; body: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={{ paddingVertical: 60, paddingHorizontal: 10, alignItems: 'center', gap: 16 }}>
      <View style={{
        width: 64, height: 64, borderRadius: 32, borderWidth: 1,
        borderStyle: 'dashed', borderColor: C.goldLine50,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontFamily: F.serif, fontSize: 26, color: C.gold }}>B</Text>
      </View>
      <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.text }}>{title}</Text>
      <Text style={[S.body, { textAlign: 'center', maxWidth: 240 }]}>{body}</Text>
      {actionLabel && onAction ? (
        <GoldButton
          label={actionLabel}
          onPress={onAction}
          height={48}
          fontSize={13}
          style={{ marginTop: 6, paddingHorizontal: 26 }}
        />
      ) : null}
    </View>
  );
}

// ─────────────────────────────── Icons ───────────────────────────────

export const Icon = {
  home:    (p: IconProps) => <Stroke {...p} d="M4 11l8-7 8 7v9H4z" />,
  menu:    (p: IconProps) => <Stroke {...p} d="M4 6h16M4 12h16M4 18h10" />,
  party:   (p: IconProps) => <Stroke {...p} d="M4 20l7-13 9 5-9 8z" />,
  refer:   (p: IconProps) => (
    <Svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3.2" stroke={p.color} strokeWidth={1.7} />
      <Path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={p.color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M18 8v6M15 11h6" stroke={p.color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  ),
  you:     (p: IconProps) => (
    <Svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={p.color} strokeWidth={1.7} />
      <Path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke={p.color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  ),
  store:   (p: IconProps) => (
    <Svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9h16v11H4z" stroke={p.color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M4 9l1.5-5h13L20 9" stroke={p.color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  ),
  phone:   (p: IconProps) => (
    <Stroke {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  ),
  check:   (p: IconProps) => <Stroke {...p} d="M4.5 12.5l5 5 10-11" width={2.2} />,
  clock:   (p: IconProps) => (
    <Svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8.5" stroke={p.color} strokeWidth={1.7} />
      <Path d="M12 7.5V12l3 2" stroke={p.color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  ),
  lock:    (p: IconProps) => (
    <Svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="10" width="16" height="10" rx="2" stroke={p.color} strokeWidth={1.8} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={p.color} strokeWidth={1.8} />
    </Svg>
  ),
  whatsapp: (p: IconProps) => (
    <Svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24">
      <Path
        fill={p.color}
        d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1.1.1-1.9-.2-1.4-.5-3.1-1.7-4.3-3.3-.9-1.2-1.4-2.4-1.4-3.3 0-.8.4-1.4.8-1.8.2-.2.4-.3.7-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3-.1.5.4.8 1.6 2.1 2.6 2.5.2.1.4.1.5-.1l.5-.6c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.3.4 0 .3 0 .8-.3 1.2z"
      />
    </Svg>
  ),
};

interface IconProps { color: string; size?: number; width?: number }

function Stroke({ color, size = 20, width = 1.7, d }: IconProps & { d: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
