import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const GRADE_CONFIG: Record<string, { color: string; bg: string; bobot: number }> = {
  'A':  { color: '#276749', bg: '#F0FFF4', bobot: 4.0 },
  'A-': { color: '#276749', bg: '#F0FFF4', bobot: 3.7 },
  'B+': { color: '#2B6CB0', bg: '#EBF8FF', bobot: 3.3 },
  'B':  { color: '#2B6CB0', bg: '#EBF8FF', bobot: 3.0 },
  'B-': { color: '#2B6CB0', bg: '#EBF8FF', bobot: 2.7 },
  'C+': { color: '#744210', bg: '#FFFBEB', bobot: 2.3 },
  'C':  { color: '#744210', bg: '#FFFBEB', bobot: 2.0 },
  'D':  { color: '#9B2C2C', bg: '#FFF5F5', bobot: 1.0 },
  'E':  { color: '#9B2C2C', bg: '#FFF5F5', bobot: 0.0 },
};

export default function ViewGradeScreen() {
  const { user } = useAuth();
  const grades = useQuery(api.grades.listByUser, user ? { userId: user._id } : 'skip');

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);
  if (!user) return null;

  const loading = grades === undefined;

  let ipk = 0;
  let totalSKS = 0;
  if (grades && grades.length > 0) {
    const totalBobot = grades.reduce((sum, g) => {
      const cfg = GRADE_CONFIG[g.grade];
      return sum + (cfg?.bobot ?? 0) * (g.course?.credits ?? 0);
    }, 0);
    totalSKS = grades.reduce((sum, g) => sum + (g.course?.credits ?? 0), 0);
    ipk = totalSKS > 0 ? totalBobot / totalSKS : 0;
  }

  const ipkColor = ipk >= 3.5 ? Colors.success : ipk >= 3.0 ? Colors.primary : ipk >= 2.5 ? Colors.warning : Colors.error;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <View style={styles.backRow}>
          <View>
            <Text style={styles.headerTitle}>Nilai Mata Kuliah</Text>
            <Text style={styles.headerSub}>Rekap nilai akademik Anda</Text>
          </View>
        </View>

        {/* IPK Card */}
        {!loading && grades && grades.length > 0 && (
          <View style={styles.ipkCard}>
            <View style={styles.ipkLeft}>
              <Text style={styles.ipkLabel}>Indeks Prestasi Kumulatif</Text>
              <Text style={[styles.ipkValue, { color: ipkColor }]}>{ipk.toFixed(2)}</Text>
              <Text style={styles.ipkSub}>{totalSKS} SKS · {grades.length} mata kuliah</Text>
            </View>
            <View style={styles.ipkCircle}>
              <Text style={[styles.ipkCircleVal, { color: ipkColor }]}>{ipk.toFixed(1)}</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}><Text style={styles.loadingText}>Memuat nilai...</Text></View>
      ) : !grades || grades.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="school-outline" size={56} color={Colors.border} />
          <Text style={styles.emptyText}>Belum ada nilai tercatat.</Text>
        </View>
      ) : (
        <FlatList
          data={grades}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cfg = GRADE_CONFIG[item.grade] ?? { color: Colors.textMid, bg: Colors.background, bobot: 0 };
            return (
              <View style={styles.gradeCard}>
                <View style={[styles.gradeLetterBox, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.gradeLetter, { color: cfg.color }]}>{item.grade}</Text>
                </View>
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradeCode}>{item.course?.code}</Text>
                  <Text style={styles.gradeName}>{item.course?.name}</Text>
                  <View style={styles.gradeMetaRow}>
                    <View style={styles.creditBadge}>
                      <Text style={styles.creditText}>{item.course?.credits} SKS</Text>
                    </View>
                    <Text style={styles.bobotText}>Bobot {cfg.bobot.toFixed(1)}</Text>
                  </View>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreVal}>{item.score}</Text>
                  <Text style={styles.scoreLabel}>Nilai</Text>
                </View>
              </View>
            );
          }}
        />
      )}
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
  backRow: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  ipkCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  ipkLeft: {},
  ipkLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 0.5 },
  ipkValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1, marginTop: 2 },
  ipkSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  ipkCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  ipkCircleVal: { fontSize: 22, fontWeight: '900' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: Colors.textLight, fontSize: 15 },
  emptyText: { color: Colors.textLight, fontSize: 15, marginTop: 12 },
  list: { padding: 16, gap: 10 },
  gradeCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  gradeLetterBox: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeLetter: { fontSize: 20, fontWeight: '900' },
  gradeInfo: { flex: 1 },
  gradeCode: { fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.5 },
  gradeName: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark, marginTop: 1 },
  gradeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  creditBadge: {
    backgroundColor: Colors.accentPale, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  creditText: { fontSize: 11, fontWeight: '700', color: Colors.warning },
  bobotText: { fontSize: 11, color: Colors.textLight, fontWeight: '500' },
  scoreBox: { alignItems: 'center' },
  scoreVal: { fontSize: 22, fontWeight: '900', color: Colors.primaryDark },
  scoreLabel: { fontSize: 10, color: Colors.textLight, marginTop: 1, fontWeight: '500' },
});