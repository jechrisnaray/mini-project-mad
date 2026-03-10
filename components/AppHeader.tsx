/**
 * AppHeader.tsx — Deep Forest Gradient Header
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode;
};

export default function AppHeader({ title, subtitle, showBack = true, rightSlot, children }: Props) {
  return (
    <LinearGradient
      colors={['#0D3D22', '#1B5E35', '#2E7D50']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      {/* Mesh line accent */}
      <View style={styles.meshLine} />

      {/* Top row */}
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.rightSlot}>{rightSlot ?? null}</View>
      </View>

      {children}
    </LinearGradient>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 10;

const styles = StyleSheet.create({
  header: {
    paddingTop: PT,
    paddingBottom: 22,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -100, right: -70,
  },
  orb2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -40, left: -20,
  },
  meshLine: {
    position: 'absolute', width: 1.5, height: '300%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ rotate: '20deg' }], left: '65%', top: -50,
  },
  topRow:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:         {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  backPlaceholder: { width: 36 },
  titleBlock:      { flex: 1 },
  title:           { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.4 },
  subtitle:        { fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
  rightSlot:       {},
});