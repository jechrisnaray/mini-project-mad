/**
 * AppHeader.tsx
 * Komponen header yang konsisten di seluruh halaman.
 * Mendukung tombol back, subtitle, dan slot kanan (opsional).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../constants/Colors';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode; // konten tambahan di dalam header (mis. stats card)
};

export default function AppHeader({
  title,
  subtitle,
  showBack = true,
  rightSlot,
  children,
}: Props) {
  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primary]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Dekorasi lingkaran emas di pojok kanan */}
      <View style={styles.decor} />

      {/* Baris atas: back + judul + slot kanan */}
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>{rightSlot ?? null}</View>
      </View>

      {/* Slot anak — dirender di bawah judul */}
      {children}
    </LinearGradient>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 10;

const styles = StyleSheet.create({
  header: {
    paddingTop: PT,
    paddingBottom: 20,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(240,192,64,0.10)',
    top: -70, right: -50,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backPlaceholder: { width: 36 },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 20, fontWeight: '800',
    color: '#FFF', letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  rightSlot: {},
});