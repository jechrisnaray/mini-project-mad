import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const BASE_SPP = 2_500_000;
const COST_PER_SKS = 150_000;
const LAB_FEE = 500_000;
const STUDENT_ACTIVITY_FEE = 250_000;
const INSURANCE_FEE = 100_000;

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export default function SemesterCostScreen() {
  const { user } = useAuth();
  const registrations = useQuery(
    api.registrations.listByUser,
    user ? { userId: user._id } : 'skip'
  );

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);
  if (!user) return null;

  const activeRegs = registrations?.filter(r => r.status === 'registered') ?? [];
  const totalSKS = activeRegs.reduce((sum, r) => sum + (r.course?.credits ?? 0), 0);
  const sksFee = totalSKS * COST_PER_SKS;
  const total = BASE_SPP + sksFee + LAB_FEE + STUDENT_ACTIVITY_FEE + INSURANCE_FEE;

  const items = [
    {
      label: 'SPP Tetap',
      desc: 'Biaya pokok per semester',
      value: BASE_SPP,
      icon: 'school-outline' as const,
      color: Colors.primary,
    },
    {
      label: 'Biaya SKS',
      desc: `${totalSKS} SKS × ${formatRupiah(COST_PER_SKS)}`,
      value: sksFee,
      icon: 'book-outline' as const,
      color: '#1A5C42',
    },
    {
      label: 'Biaya Laboratorium',
      desc: 'Penggunaan fasilitas lab',
      value: LAB_FEE,
      icon: 'flask-outline' as const,
      color: '#553C9A',
    },
    {
      label: 'Kemahasiswaan',
      desc: 'Kegiatan dan organisasi',
      value: STUDENT_ACTIVITY_FEE,
      icon: 'people-outline' as const,
      color: '#285E61',
    },
    {
      label: 'Asuransi Mahasiswa',
      desc: 'Jaminan keselamatan',
      value: INSURANCE_FEE,
      icon: 'shield-checkmark-outline' as const,
      color: '#744210',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Estimasi Biaya Semester</Text>
        <Text style={styles.headerSub}>Semester Genap 2024/2025</Text>

        {/* Total card in header */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL ESTIMASI</Text>
          <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
          <Text style={styles.totalSub}>{totalSKS} SKS terdaftar · {activeRegs.length} mata kuliah</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Rincian Biaya</Text>

        {items.map((item, i) => (
          <View key={i} style={styles.costCard}>
            <View style={[styles.costIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.costInfo}>
              <Text style={styles.costLabel}>{item.label}</Text>
              <Text style={styles.costDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.costValue}>{formatRupiah(item.value)}</Text>
          </View>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Total row */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.totalRow}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <Text style={styles.totalRowLabel}>Total Biaya Semester</Text>
          <Text style={styles.totalRowValue}>{formatRupiah(total)}</Text>
        </LinearGradient>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            Ini adalah estimasi biaya. Nominal final dapat berbeda sesuai kebijakan universitas.
            Pembayaran dilakukan melalui bank yang ditunjuk.
          </Text>
        </View>

        {/* Payment methods */}
        <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
        {[
          { bank: 'BNI', no: '123-456-7890', name: 'Universitas Klabat' },
          { bank: 'BRI', no: '098-765-4321', name: 'Universitas Klabat' },
          { bank: 'Mandiri', no: '147-258-3690', name: 'Universitas Klabat' },
        ].map((p, i) => (
          <View key={i} style={styles.paymentCard}>
            <View style={styles.bankBadge}>
              <Text style={styles.bankText}>{p.bank}</Text>
            </View>
            <View>
              <Text style={styles.paymentNo}>{p.no}</Text>
              <Text style={styles.paymentName}>a/n {p.name}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(232,184,75,0.1)', top: -70, right: -50,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3, marginBottom: 18 },
  totalCard: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  totalLabel: {
    fontSize: 10, color: Colors.accentLight, fontWeight: '800',
    letterSpacing: 1.2,
  },
  totalValue: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginTop: 4, letterSpacing: -1 },
  totalSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  body: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: Colors.primaryDark,
    marginBottom: 12, marginTop: 8, letterSpacing: -0.3,
  },
  costCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  costIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  costInfo: { flex: 1 },
  costLabel: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  costDesc: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  costValue: { fontSize: 14, fontWeight: '800', color: Colors.primaryDark },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  totalRow: {
    borderRadius: 14, padding: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  totalRowLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  totalRowValue: { fontSize: 18, fontWeight: '900', color: Colors.accent },
  disclaimer: {
    backgroundColor: Colors.warningLight, borderRadius: 12, padding: 14,
    flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 24,
    borderWidth: 1, borderColor: '#FBD38D',
  },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.warning, lineHeight: 18 },
  paymentCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.borderLight,
  },
  bankBadge: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  bankText: { fontSize: 13, fontWeight: '800', color: Colors.accent },
  paymentNo: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark },
  paymentName: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
});