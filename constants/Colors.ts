/**
 * Colors.ts — Botanical Luxury Palette
 * Deep forest greens + warm cream + gold accent
 * Eye-friendly, premium, nature-inspired
 */

const C = {
  // ── Backgrounds ───────────────────────────────────────────
  bg:           '#F0F7F2',
  bgDeep:       '#E4F0E8',
  surface:      '#FFFFFF',
  surfaceTint:  '#F7FCF8',

  // ── Text ──────────────────────────────────────────────────
  text:         '#0F2419',
  textSub:      '#234D35',
  textMuted:    '#4E7A5E',
  textLight:    '#7AAD8A',
  textDisabled: '#B2CEBC',

  // ── Primary greens ────────────────────────────────────────
  primary:      '#1B5E35',
  primaryMid:   '#2E7D50',
  primaryLight: '#52B788',
  primaryPale:  '#D8F0E2',
  primaryFaint: '#EDF7F1',

  // ── Accent ────────────────────────────────────────────────
  gold:         '#C8963C',
  goldLight:    '#F5E6C8',
  mint:         '#95D5B2',

  // ── Semantic ──────────────────────────────────────────────
  success:      '#2E7D50',
  successLight: '#D8F0E2',
  warning:      '#C8963C',
  warningLight: '#F5E6C8',
  danger:       '#C0392B',
  dangerLight:  '#FDECEA',

  // ── Greyscale (green-tinted) ───────────────────────────────
  white:  '#FFFFFF',
  g50:    '#F5FAF7',
  g100:   '#EAF2EE',
  g200:   '#D3E8DA',
  g300:   '#B0D0BC',
  g400:   '#84AB93',
  g500:   '#5A8A6C',
  g600:   '#3E6B52',
  g700:   '#2B5040',
  g800:   '#1A3328',
  g900:   '#0F2018',

  // ── Borders ───────────────────────────────────────────────
  border:       '#D0E8D8',
  borderLight:  '#E4F0E8',

  // ── Legacy aliases (backward compat) ──────────────────────
  ink:          '#1B5E35',
};

export default C;

export const SH = {
  xs: { shadowColor:'#1B5E35', shadowOffset:{width:0,height:1},  shadowOpacity:0.05, shadowRadius:3,  elevation:1 },
  sm: { shadowColor:'#1B5E35', shadowOffset:{width:0,height:3},  shadowOpacity:0.08, shadowRadius:8,  elevation:3 },
  md: { shadowColor:'#1B5E35', shadowOffset:{width:0,height:6},  shadowOpacity:0.12, shadowRadius:16, elevation:6 },
  lg: { shadowColor:'#0F2018', shadowOffset:{width:0,height:12}, shadowOpacity:0.18, shadowRadius:28, elevation:10 },
} as const;

export const R = {
  xs:4, sm:8, md:12, lg:16, xl:20, xxl:28, full:999,
} as const;