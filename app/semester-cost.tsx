import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingScreen } from '../components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import C from '../constants/Colors';

const COST_PER_SKS = 150_000;
const BASE_SPP     = 2_500_000;
const LAB          = 500_000;
const KEMAHASISWAAN= 250_000;
const ASURANSI     = 100_000;

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function SemesterCostScreen() {
  const { user } = useAuth();
  const regs = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');

  if (!regs) return <LoadingScreen />;

  const active   = regs.filter(r => r.status === 'registered');
  const totalSKS = active.reduce((s, r) => s + (r.course?.credits ?? 0), 0);
  const sksFee   = totalSKS * COST_PER_SKS;
  const total    = BASE_SPP + sksFee + LAB + KEMAHASISWAAN + ASURANSI;

  const items = [
    { label: 'SPP Tetap',       desc: 'Per semester',        amount: BASE_SPP,      icon: 'school-outline' as const },
    { label: `Biaya SKS`,       desc: `${totalSKS} SKS × Rp 150.000`, amount: sksFee, icon: 'book-outline' as const },
    { label: 'Biaya Lab',       desc: 'Praktikum & fasilitas', amount: LAB,          icon: 'flask-outline' as const },
    { label: 'Kemahasiswaan',   desc: 'Kegiatan dan organisasi', amount: KEMAHASISWAAN, icon: 'people-outline' as const },
    { label: 'Asuransi',        desc: 'Perlindungan mahasiswa', amount: ASURANSI,    icon: 'shield-checkmark-outline' as const },
  ];

  return (
    <View style={s.root}>
      <PageHeader title="Biaya Semester" subtitle="Rincian tagihan akademik Anda" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Total card */}
        <LinearGradient colors={[C.primary, C.primaryMid]} style={s.totalCard} start={{x:0,y:0}} end={{x:1,y:1}}>
          <View style={s.totalDecor} />
          <Text style={s.totalLabel}>Total Tagihan Semester Ini</Text>
          <Text style={s.totalAmount}>{fmt(total)}</Text>
          <View style={s.totalMeta}>
            <View style={s.metaChip}>
              <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={s.metaTxt}>{totalSKS} SKS Aktif</Text>
            </View>
            <View style={s.metaChip}>
              <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={s.metaTxt}>2024/2025 Ganjil</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Breakdown */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <View style={s.goldBar} />
            <Text style={s.secTitle}>Rincian Biaya</Text>
          </View>
          <View style={s.breakdown}>
            {items.map((item, i) => (
              <View key={i} style={[s.row, i < items.length - 1 && s.rowBorder]}>
                <View style={s.rowIcon}>
                  <Ionicons name={item.icon} size={16} color={C.primaryMid} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{item.label}</Text>
                  <Text style={s.rowDesc}>{item.desc}</Text>
                </View>
                <Text style={s.rowAmount}>{fmt(item.amount)}</Text>
              </View>
            ))}
            {/* Total row */}
            <LinearGradient colors={[C.primary, C.primaryMid]} style={s.totalRow} start={{x:0,y:0}} end={{x:1,y:0}}>
              <Text style={s.totalRowLabel}>Total Keseluruhan</Text>
              <Text style={s.totalRowAmount}>{fmt(total)}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Payment methods */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <View style={s.goldBar} />
            <Text style={s.secTitle}>Metode Pembayaran</Text>
          </View>
          <View style={s.payMethods}>
            {['BNI', 'BRI', 'Mandiri'].map(bank => (
              <View key={bank} style={s.payChip}>
                <Ionicons name="card-outline" size={16} color={C.primaryMid} />
                <Text style={s.payTxt}>{bank}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={15} color={C.textMuted} />
          <Text style={s.disclaimerTxt}>
            Biaya dapat berubah sesuai kebijakan universitas. Hubungi Bagian Keuangan untuk informasi lebih lanjut.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.background },
  scroll:        { padding: 16 },
  totalCard:     { borderRadius: 20, padding: 22, marginBottom: 20, overflow: 'hidden' },
  totalDecor:    { position:'absolute', width:150, height:150, borderRadius:75, backgroundColor:'rgba(212,160,23,0.12)', top:-50, right:-30 },
  totalLabel:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  totalAmount:   { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  totalMeta:     { flexDirection: 'row', gap: 10, marginTop: 14 },
  metaChip:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  metaTxt:       { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  section:       { marginBottom: 18 },
  secHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  goldBar:       { width: 3, height: 18, borderRadius: 2, backgroundColor: C.accentBright },
  secTitle:      { fontSize: 14, fontWeight: '800', color: C.text },
  breakdown:     { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.borderLight },
  row:           { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  rowIcon:       { width: 36, height: 36, borderRadius: 10, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowLabel:      { fontSize: 13, fontWeight: '700', color: C.text },
  rowDesc:       { fontSize: 11, color: C.textMuted, marginTop: 1 },
  rowAmount:     { fontSize: 13, fontWeight: '700', color: C.text },
  totalRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  totalRowLabel: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  totalRowAmount:{ fontSize: 16, fontWeight: '900', color: '#FFF' },
  payMethods:    { flexDirection: 'row', gap: 10 },
  payChip:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.surface, borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: C.borderLight },
  payTxt:        { fontSize: 13, fontWeight: '700', color: C.text },
  disclaimer:    { flexDirection: 'row', gap: 8, backgroundColor: C.accentLight, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.accentBright + '30', alignItems: 'flex-start' },
  disclaimerTxt: { fontSize: 11, color: C.textSub, flex: 1, lineHeight: 17 },
});