import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import C, { R } from '../constants/Colors';

type Props = {
  title:      string;
  subtitle?:  string;
  showBack?:  boolean;
  rightSlot?: React.ReactNode;
  children?:  React.ReactNode;
  variant?:   'full' | 'compact';
};

export default function AppHeader({ title, subtitle, showBack = true, rightSlot, children, variant = 'full' }: Props) {
  const isCompact = variant === 'compact';
  return (
    <LinearGradient
      colors={[C.primaryDeep, C.primaryDark, C.primary]}
      style={[styles.header, isCompact && styles.headerCompact]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.decorA} />
      <View style={styles.decorB} />

      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12 as any}>
            <Ionicons name="chevron-back" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.ph} />
        )}

        <View style={styles.titleBlock}>
          <Text style={[styles.title, isCompact && styles.titleSm]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.rightSlot}>
          {rightSlot ?? <View style={styles.ph} />}
        </View>
      </View>

      {children}
    </LinearGradient>
  );
}

export function HeaderChip({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <View style={[chip.wrap, accent && chip.accent]}>
      <Text style={[chip.txt, accent && chip.txtAccent]}>{label}</Text>
    </View>
  );
}

const chip = StyleSheet.create({
  wrap:      { backgroundColor:'rgba(255,255,255,0.18)', borderRadius:R.full, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:'rgba(255,255,255,0.22)' },
  accent:    { backgroundColor:C.accentBg, borderColor:C.accentLight },
  txt:       { fontSize:11, fontWeight:'700', color:'#FFF' },
  txtAccent: { color:C.accentDark },
});

const PT = (StatusBar.currentHeight ?? 44) + 10;
const styles = StyleSheet.create({
  header:        { paddingTop:PT, paddingBottom:20, paddingHorizontal:18, overflow:'hidden' },
  headerCompact: { paddingBottom:14 },
  decorA:        { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.06)', top:-80, right:-60 },
  decorB:        { position:'absolute', width:80, height:80, borderRadius:40, backgroundColor:'rgba(255,255,255,0.04)', bottom:-30, left:20 },
  topRow:        { flexDirection:'row', alignItems:'center', gap:10 },
  backBtn:       { width:36, height:36, borderRadius:R.full, backgroundColor:'rgba(255,255,255,0.14)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  ph:            { width:36 },
  titleBlock:    { flex:1 },
  title:         { fontSize:20, fontWeight:'800', color:'#FFF', letterSpacing:-0.4 },
  titleSm:       { fontSize:17 },
  subtitle:      { fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:2 },
  rightSlot:     { alignItems:'flex-end', justifyContent:'center' },
});