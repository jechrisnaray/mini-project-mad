import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

type Course = {
  _id: Id<'courses'>;
  code: string;
  name: string;
  credits: number;
  schedule: string;
  lecturer: string;
  quota: number;
};

const CODE_COLORS: Record<string, [string, string]> = {
  IF: ['#1E3A72', '#2A4FAF'],
  MA: ['#1A5C42', '#2D9B6F'],
  EN: ['#553C9A', '#6B46C1'],
};

function getCourseGradient(code: string): [string, string] {
  const prefix = code.substring(0, 2);
  return CODE_COLORS[prefix] || [Colors.primaryDark, Colors.primary];
}

export default function RegistrationScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const courses = useQuery(api.courses.list);
  const registrations = useQuery(
    api.registrations.listByUser,
    user ? { userId: user._id } : 'skip'
  );
  const register = useMutation(api.registrations.register);

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);

  if (!user) return null;

  if (courses === undefined || registrations === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.headerSmall} />
        <View style={styles.loadingBody}>
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </View>
    );
  }

  const registeredIds = new Set(registrations.filter(r => r.status === 'registered').map(r => r.courseId));
  const availableCourses = courses.filter(c => !registeredIds.has(c._id));

  const handleRegister = async (courseId: Id<'courses'>) => {
    setLoading(courseId);
    try {
      await register({ userId: user._id, courseId });
      Alert.alert('Berhasil ✓', 'Mata kuliah berhasil didaftarkan!');
    } catch (error: any) {
      Alert.alert('Gagal', error.message);
    } finally {
      setLoading(null);
    }
  };

  const renderItem = ({ item }: { item: Course }) => {
    const gradient = getCourseGradient(item.code);
    return (
      <View style={styles.courseCard}>
        <View style={styles.courseLeft}>
          <LinearGradient colors={gradient} style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.code}</Text>
          </LinearGradient>
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={Colors.textLight} />
            <Text style={styles.metaText}>{item.schedule}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={12} color={Colors.textLight} />
            <Text style={styles.metaText}>{item.lecturer}</Text>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.sksBadge}>
              <Text style={styles.sksText}>{item.credits} SKS</Text>
            </View>
            <View style={styles.quotaBadge}>
              <Ionicons name="people-outline" size={11} color={Colors.textMid} />
              <Text style={styles.quotaText}>{item.quota} kuota</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.regBtn, loading === item._id && { opacity: 0.6 }]}
          onPress={() => handleRegister(item._id)}
          disabled={loading === item._id}
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.regBtnGrad}>
            <Ionicons name={loading === item._id ? 'hourglass-outline' : 'add'} size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrasi Mata Kuliah</Text>
        <Text style={styles.headerSub}>
          {availableCourses.length} mata kuliah tersedia
        </Text>
      </LinearGradient>

      {availableCourses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={60} color={Colors.success} />
          <Text style={styles.emptyTitle}>Semua sudah terdaftar!</Text>
          <Text style={styles.emptySub}>Anda sudah mendaftar semua mata kuliah yang tersedia.</Text>
        </View>
      ) : (
        <FlatList
          data={availableCourses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background },
  headerSmall: { height: 120 },
  loadingBody: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.textLight, fontSize: 15 },
  header: {
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(232,184,75,0.1)', top: -60, right: -40,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  list: { padding: 16, gap: 12 },
  courseCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  courseLeft: {},
  codeBadge: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  codeText: { fontSize: 11, fontWeight: '800', color: Colors.accent, letterSpacing: 0.5 },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaText: { fontSize: 11, color: Colors.textLight },
  bottomRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  sksBadge: {
    backgroundColor: Colors.accentPale, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  sksText: { fontSize: 11, fontWeight: '700', color: Colors.warning },
  quotaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.background, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  quotaText: { fontSize: 11, color: Colors.textMid, fontWeight: '500' },
  regBtn: { flexShrink: 0 },
  regBtnGrad: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.primaryDark, marginTop: 16 },
  emptySub: { fontSize: 13, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
});