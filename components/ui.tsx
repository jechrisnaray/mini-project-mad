import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

// ── PageHeader ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, showBack = true, right }: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerInner}>
        {showBack && (
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
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

// ── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <View style={s.loading}>
      <ActivityIndicator size="small" color={C.primary} />
      <Text style={s.loadingTxt}>Memuat…</Text>
    </View>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={26} color={C.primaryLight} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle && <Text style={s.emptySub}>{subtitle}</Text>}
    </View>
  );
}

// ── PrimaryButton ─────────────────────────────────────────────────────────────
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
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator size="small" color={C.white} />
      ) : (
        <View style={s.btnRow}>
          {icon && <Ionicons name={icon} size={16} color={C.white} />}
          <Text style={s.btnTxt}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const PT = (StatusBar.currentHeight ?? 0);

const s = StyleSheet.create({
  header:      { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.borderLight, paddingTop: PT, ...SH.xs },
  headerInner: { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14 },
  backBtn:     { width:34, height:34, borderRadius:R.md, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:C.primaryPale },
  title:       { fontSize:17, fontWeight:'800', color:C.text, letterSpacing:-0.3 },
  subtitle:    { fontSize:11, color:C.textMuted, marginTop:2 },

  loading:     { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:C.bg, gap:10 },
  loadingTxt:  { fontSize:12, color:C.textMuted },

  empty:       { flex:1, alignItems:'center', justifyContent:'center', padding:40, gap:10 },
  emptyIcon:   { width:60, height:60, borderRadius:30, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center', marginBottom:4, borderWidth:1.5, borderColor:C.primaryPale },
  emptyTitle:  { fontSize:15, fontWeight:'700', color:C.text },
  emptySub:    { fontSize:12, color:C.textMuted, textAlign:'center', lineHeight:19 },

  btn:         { height:50, alignItems:'center', justifyContent:'center', backgroundColor:C.primary, borderRadius:R.xl, ...SH.sm },
  btnRow:      { flexDirection:'row', alignItems:'center', gap:8 },
  btnDanger:   { backgroundColor:C.danger },
  btnOff:      { opacity:0.4 },
  btnTxt:      { color:C.white, fontSize:14, fontWeight:'700' },
});