import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import C from '../constants/Colors';

const PT = (StatusBar.currentHeight ?? 44) + 12;

// ─── PageHeader ───────────────────────────────────────────────────────────────
type PHProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
};
export function PageHeader({ title, subtitle, showBack = true, rightElement, children }: PHProps) {
  return (
    <LinearGradient
      colors={[C.primary, C.primaryMid]}
      style={ph.wrap}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Gold accent circle */}
      <View style={ph.circle1} />
      <View style={ph.circle2} />

      <View style={ph.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={ph.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : <View style={{ width: 38 }} />}

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={ph.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={ph.sub}>{subtitle}</Text> : null}
        </View>
        {rightElement ?? <View style={{ width: 38 }} />}
      </View>
      {children}
    </LinearGradient>
  );
}
const ph = StyleSheet.create({
  wrap:    { paddingTop: PT, paddingBottom: 22, paddingHorizontal: 18, overflow: 'hidden' },
  circle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(212,160,23,0.12)', top: -50, right: -30 },
  circle2: { position: 'absolute', width: 80,  height: 80,  borderRadius: 40, backgroundColor: 'rgba(212,160,23,0.08)', bottom: -20, left: 60 },
  row:     { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  title:   { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
  sub:     { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
});

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, padding = 16 }: { children: React.ReactNode; style?: object; padding?: number }) {
  return (
    <View style={[{
      backgroundColor: C.surface, borderRadius: 16, padding,
      borderWidth: 1, borderColor: C.borderLight,
      shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    }, style]}>
      {children}
    </View>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
type PBProps = {
  label: string; onPress: () => void; loading?: boolean;
  disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap; danger?: boolean; outline?: boolean;
};
export function PrimaryButton({ label, onPress, loading = false, disabled = false, icon, danger = false, outline = false }: PBProps) {
  if (outline) {
    return (
      <TouchableOpacity
        onPress={onPress} disabled={disabled || loading}
        activeOpacity={0.8}
        style={[pb.outlineWrap, (disabled || loading) && { opacity: 0.5 }]}
      >
        {loading
          ? <ActivityIndicator size="small" color={C.primary} />
          : <>{icon && <Ionicons name={icon} size={17} color={C.primary} />}<Text style={pb.outlineLabel}>{label}</Text></>
        }
      </TouchableOpacity>
    );
  }

  const colors: [string, string] = danger
    ? [C.error, '#7F1D1D']
    : [C.primary, C.primaryMid];

  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled || loading}
      activeOpacity={0.82}
      style={[pb.shadow, (disabled || loading) && { opacity: 0.5 }]}
    >
      <LinearGradient colors={colors} style={pb.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {loading
          ? <ActivityIndicator size="small" color="#FFF" />
          : <>{icon && <Ionicons name={icon} size={18} color="#FFF" />}<Text style={pb.label}>{label}</Text></>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}
const pb = StyleSheet.create({
  shadow:      { borderRadius: 14, overflow: 'hidden', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 6 },
  grad:        { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label:       { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  outlineWrap: { borderRadius: 14, borderWidth: 2, borderColor: C.primary, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primaryPale },
  outlineLabel:{ color: C.primary, fontSize: 15, fontWeight: '700' },
});

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, accent }: { children: string; accent?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
      {accent && <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: C.accentBright }} />}
      <Text style={{ fontSize: 14, fontWeight: '800', color: C.text, letterSpacing: -0.2 }}>{children}</Text>
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  return (
    <View style={es.wrap}>
      <View style={es.iconBox}>
        <Ionicons name={icon} size={36} color={C.primaryMid} />
      </View>
      <Text style={es.title}>{title}</Text>
      {subtitle ? <Text style={es.sub}>{subtitle}</Text> : null}
    </View>
  );
}
const es = StyleSheet.create({
  wrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconBox: { width: 76, height: 76, borderRadius: 22, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: C.border },
  title:   { fontSize: 16, fontWeight: '700', color: C.text, textAlign: 'center' },
  sub:     { fontSize: 13, color: C.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.background }}>
      <ActivityIndicator size="large" color={C.primary} />
      <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Memuat...</Text>
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color, bg }: { label: string; color?: string; bg?: string }) {
  return (
    <View style={{ backgroundColor: bg ?? C.primaryLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: color ?? C.primary }}>{label}</Text>
    </View>
  );
}

// ─── GoldChip ─────────────────────────────────────────────────────────────────
export function GoldChip({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: C.accentLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E8C84A' }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent }}>{label}</Text>
    </View>
  );
}