/**
 * Colors.ts — Refined Forest Green System
 * Deep forest greens · warm cream · subtle gold
 * Professional, clean, easy on the eyes
 */

const C = {
  // ── Backgrounds ───────────────────────────────────────────
  bg:           '#F2F6F3',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F8FBF9',

  // ── Text ──────────────────────────────────────────────────
  text:         '#111D16',
  textSub:      '#2D5240',
  textMuted:    '#5A7D6A',
  textLight:    '#8FB09F',
  textDisabled: '#C2D6CB',

  // ── Primary greens ────────────────────────────────────────
  primary:      '#1A6B3E',
  primaryDark:  '#134F2E',
  primaryDeep:  '#0D3820',
  primaryMid:   '#2E8B5A',
  primaryLight: '#4CAF78',
  primaryPale:  '#D0EAD8',
  primaryFaint: '#EBF5EE',

  // ── Accent ────────────────────────────────────────────────
  gold:         '#B8862A',
  goldLight:    '#F0E0B0',
  goldFaint:    '#FAF3DC',
  mint:         '#7EC8A0',
  teal:         '#2D9B72',

  // ── Semantic ──────────────────────────────────────────────
  success:      '#1A6B3E',
  successLight: '#D0EAD8',
  warning:      '#B8862A',
  warningLight: '#F0E0B0',
  danger:       '#B53A2E',
  dangerLight:  '#FDECEA',

  // ── Greyscale (green-tinted) ───────────────────────────────
  white:  '#FFFFFF',
  g50:    '#F4F9F6',
  g100:   '#E8F2EC',
  g200:   '#CDE0D5',
  g300:   '#A8C4B5',
  g400:   '#7A9E8D',
  g500:   '#517A67',
  g600:   '#3A5E4D',
  g700:   '#274538',
  g800:   '#182E25',
  g900:   '#0E1E17',

  // ── Borders ───────────────────────────────────────────────
  border:       '#CBE0D2',
  borderLight:  '#E2EFE7',

  // ── Legacy ──────────────────────────────────────────────
  ink:          '#1A6B3E',
  accentBg:     '#F0E0B0',
  accentLight:  '#D4A840',
  accentDark:   '#7A5A10',
};

export default C;

export const SH = {
  xs: { shadowColor:'#0D3820', shadowOffset:{width:0,height:1},  shadowOpacity:0.06, shadowRadius:3,  elevation:1 },
  sm: { shadowColor:'#0D3820', shadowOffset:{width:0,height:3},  shadowOpacity:0.09, shadowRadius:8,  elevation:3 },
  md: { shadowColor:'#0D3820', shadowOffset:{width:0,height:6},  shadowOpacity:0.12, shadowRadius:16, elevation:6 },
  lg: { shadowColor:'#0D3820', shadowOffset:{width:0,height:12}, shadowOpacity:0.16, shadowRadius:28, elevation:10 },
} as const;

export const R = {
  xs:4, sm:8, md:12, lg:16, xl:20, xxl:28, full:999,
} as const;