import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

// ── PageHeader ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, showBack = true, right }: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      {/* Top gradient strip */}
      <View style={s.headerStrip} />
      <View style={s.headerInner}>
        {showBack && (
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={18} color={C.primary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
        </View>
        {right && <View>{right}</View>}
      </View>
    </View>
  );
}

// ── LoadingScreen ──────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <View style={s.loading}>
      <View style={s.loadingRing}>
        <ActivityIndicator size="small" color={C.primary} />
      </View>
      <Text style={s.loadingTxt}>Memuat data…</Text>
    </View>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIconWrap}>
        <View style={s.emptyIconRing}>
          <Ionicons name={icon} size={24} color={C.primaryLight} />
        </View>
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle && <Text style={s.emptySub}>{subtitle}</Text>}
    </View>
  );
}

// ── PrimaryButton ──────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, loading = false, icon, danger = false, disabled = false }: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  disabled?: boolean;
}) {
  const off = loading || disabled;
  return (
    <TouchableOpacity
      style={[s.btn, danger && s.btnDanger, off && s.btnOff]}
      onPress={onPress}
      disabled={off}
      activeOpacity={0.85}
    >
      <View style={s.btnSheen} />
      {loading ? (
        <ActivityIndicator size="small" color={C.white} />
      ) : (
        <View style={s.btnRow}>
          {icon && <Ionicons name={icon} size={15} color={C.white} />}
          <Text style={s.btnTxt}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const PT = (StatusBar.currentHeight ?? 0);

const s = StyleSheet.create({
  // PageHeader
  header:       { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.borderLight, paddingTop: PT, ...SH.xs },
  headerStrip:  { height: 3, backgroundColor: C.primaryLight, opacity: 0.6 },
  headerInner:  { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:13 },
  backBtn:      {
    width:34, height:34, borderRadius:R.md,
    backgroundColor: C.primaryFaint,
    alignItems:'center', justifyContent:'center',
    borderWidth:1, borderColor:C.primaryPale,
  },
  title:        { fontSize:16, fontWeight:'800', color:C.text, letterSpacing:-0.2 },
  subtitle:     { fontSize:11, color:C.textMuted, marginTop:1 },

  // LoadingScreen
  loading:    { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:C.bg, gap:12 },
  loadingRing:{ width:48, height:48, borderRadius:24, borderWidth:2, borderColor:C.primaryPale, alignItems:'center', justifyContent:'center' },
  loadingTxt: { fontSize:12, color:C.textMuted, fontWeight:'500' },

  // EmptyState
  empty:        { flex:1, alignItems:'center', justifyContent:'center', padding:40, gap:12 },
  emptyIconWrap:{ marginBottom:4 },
  emptyIconRing:{
    width:64, height:64, borderRadius:32,
    backgroundColor:C.primaryFaint,
    alignItems:'center', justifyContent:'center',
    borderWidth:2, borderColor:C.primaryPale,
  },
  emptyTitle:   { fontSize:15, fontWeight:'700', color:C.text, textAlign:'center' },
  emptySub:     { fontSize:12, color:C.textMuted, textAlign:'center', lineHeight:19 },

  // PrimaryButton
  btn:      {
    height:50, overflow:'hidden',
    alignItems:'center', justifyContent:'center',
    backgroundColor:C.primary, borderRadius:R.xl, ...SH.md,
  },
  btnSheen: {
    position:'absolute', top:0, left:0, right:0, height:'50%',
    backgroundColor:'rgba(255,255,255,0.07)',
  },
  btnRow:   { flexDirection:'row', alignItems:'center', gap:8 },
  btnDanger:{ backgroundColor: C.danger },
  btnOff:   { opacity:0.4 },
  btnTxt:   { color:C.white, fontSize:14, fontWeight:'800', letterSpacing:0.2 },
});