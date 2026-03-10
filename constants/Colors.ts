const C = {
  bg:           '#F7F7F7',
  surface:      '#FFFFFF',
  text:         '#0A0A0A',
  textSub:      '#3A3A3A',
  textMuted:    '#6B6B6B',
  textDisabled: '#B0B0B0',
  ink:          '#0A0A0A',
  white:        '#FFFFFF',
  border:       '#E8E8E8',
  g50:  '#FAFAFA',
  g100: '#F2F2F2',
  g200: '#E4E4E4',
  g300: '#D0D0D0',
  g400: '#BCBCBC',
  g500: '#989898',
  g600: '#737373',
  g700: '#525252',
  g800: '#333333',
  g900: '#1A1A1A',
};

export default C;

export const SH = {
  xs: { shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.03, shadowRadius:2,  elevation:1 },
  sm: { shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:6,  elevation:2 },
  md: { shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
} as const;

export const R = {
  xs:4, sm:8, md:12, lg:16, xl:20, full:999,
} as const;