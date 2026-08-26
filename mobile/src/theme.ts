import { StyleSheet } from 'react-native';

/**
 * Every colour, radius and type ramp here is lifted from the
 * BiriyaniNation design file so the shipped app matches the mockup.
 */
export const C = {
  bg:        '#0B0906',
  surface:   '#100C07',
  card:      '#1A140D',
  cardAlt:   '#15110B',
  well:      '#241C12',
  chip:      '#2C2318',

  gold:      '#E3AE4E',
  goldSoft:  '#F3D79B',
  goldTop:   '#F0C066',
  goldBottom:'#DE9F35',
  onGold:    '#241905',

  cream:     '#F6EEE1',
  veg:       '#4E9A6B',
  nonVeg:    '#C0453A',
  whatsapp:  '#25603F',
  whatsappFg:'#EAFBF0',

  // Cream at opacity — RN has no rgba() shorthand on named colours.
  text:      '#F6EEE1',
  text85:    'rgba(246,238,225,0.85)',
  text70:    'rgba(246,238,225,0.70)',
  text55:    'rgba(246,238,225,0.55)',
  text45:    'rgba(246,238,225,0.45)',
  text35:    'rgba(246,238,225,0.35)',
  text30:    'rgba(246,238,225,0.30)',

  hair:      'rgba(246,238,225,0.08)',
  hairSoft:  'rgba(246,238,225,0.06)',
  border:    'rgba(246,238,225,0.14)',
  goldLine:  'rgba(227,174,78,0.24)',
  goldLine50:'rgba(227,174,78,0.50)',
  goldWash:  'rgba(227,174,78,0.12)',
  goldWash16:'rgba(227,174,78,0.16)',
  nonVegWash:'rgba(192,69,58,0.16)',
} as const;

export const F = {
  serif: 'InstrumentSerif_400Regular',
  sans:  'Manrope_500Medium',
  sans600: 'Manrope_600SemiBold',
  sans700: 'Manrope_700Bold',
  sans800: 'Manrope_800ExtraBold',
} as const;

export const R = {
  sm: 10, md: 14, lg: 16, xl: 18, xxl: 22, pill: 999,
} as const;

/** Shared primitives used across screens. */
export const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // ── Type ──
  display: { fontFamily: F.serif, color: C.text, fontSize: 34, lineHeight: 37 },
  displayLg: { fontFamily: F.serif, color: C.text, fontSize: 42, lineHeight: 43 },
  title: { fontFamily: F.serif, color: C.text, fontSize: 26, lineHeight: 30 },
  eyebrow: {
    fontFamily: F.sans600, fontSize: 10, letterSpacing: 1.6,
    textTransform: 'uppercase', color: C.text45,
  },
  eyebrowGold: {
    fontFamily: F.sans600, fontSize: 9.5, letterSpacing: 1.9,
    textTransform: 'uppercase', color: C.gold,
  },
  body: { fontFamily: F.sans, fontSize: 13, lineHeight: 21, color: C.text55 },
  label: { fontFamily: F.sans700, fontSize: 13.5, color: C.text },
  meta: { fontFamily: F.sans, fontSize: 11, color: C.text45 },
  price: { fontFamily: F.sans800, fontSize: 14, color: C.goldSoft },

  // ── Surfaces ──
  card: {
    backgroundColor: C.card, borderRadius: R.xl,
    borderWidth: 1, borderColor: C.hair,
  },
  goldCard: {
    borderRadius: R.xxl, borderWidth: 1,
    borderColor: 'rgba(227,174,78,0.30)',
    backgroundColor: 'rgba(227,174,78,0.10)',
  },

  // ── Buttons ──
  primaryBtn: {
    height: 56, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.goldBottom,
  },
  primaryBtnText: { fontFamily: F.sans800, fontSize: 15, color: C.onGold },
  ghostBtn: {
    height: 52, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border, backgroundColor: 'transparent',
  },
  ghostBtnText: { fontFamily: F.sans700, fontSize: 13.5, color: C.text85 },

  backBtn: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hairline: { height: 1, backgroundColor: C.hair },
});

/** The veg / non-veg square mark that Indian menus are required to show. */
export const markColor = (veg: boolean) => (veg ? C.veg : C.nonVeg);

export const rupees = (n: number) => `₹${Math.round(n)}`;
