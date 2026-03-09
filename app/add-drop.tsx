import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

export default function AddDropScreen() {
  const { user } = useAuth();
  const [selectedAdd, setSelectedAdd] = useState<Id<'courses'> | null>(null);
  const [selectedDrop, setSelectedDrop] = useState<Id<'courses'> | null>(null);
  const [loading, setLoading] = useState(false);

  const allCourses = useQuery(api.courses.list);
  const registrations = useQuery(
    api.registrations.listByUser,
    user ? { userId: user._id } : 'skip'
  );
  const addDrop = useMutation(api.registrations.addDrop);

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);
  if (!user) return null;

  const registered = registrations?.filter(r => r.status === 'registered') ?? [];
  const registeredIds = new Set(registered.map(r => r.courseId));
  const available = (allCourses ?? []).filter(c => !registeredIds.has(c._id));

  const handleSave = async () => {
    if (!selectedAdd && !selectedDrop) {
      Alert.alert('Pilih setidaknya satu aksi (tambah atau drop)');
      return;
    }
    setLoading(true);
    try {
      await addDrop({
        userId: user._id,
        addCourseId: selectedAdd ?? undefined,
        dropCourseId: selectedDrop ?? undefined,
      });
      Alert.alert('Berhasil ✓', 'Perubahan berhasil disimpan!');
      setSelectedAdd(null);
      setSelectedDrop(null);
    } catch (error: any) {
      Alert.alert('Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Add / Drop MK</Text>
        <Text style={styles.headerSub}>Ubah registrasi mata kuliah Anda</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* ADD section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#EBF8FF' }]}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Tambah Mata Kuliah</Text>
          </View>

          {!allCourses || !registrations ? (
            <Text style={styles.loadingText}>Memuat...</Text>
          ) : available.length === 0 ? (
            <Text style={styles.emptyText}>Semua mata kuliah sudah diambil.</Text>
          ) : available.map(c => (
            <TouchableOpacity
              key={c._id}
              style={[styles.item, selectedAdd === c._id && styles.itemAddSelected]}
              onPress={() => setSelectedAdd(selectedAdd === c._id ? null : c._id)}
            >
              <Text style={styles.itemCode}>{c.code}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{c.name}</Text>
                <Text style={styles.itemMeta}>{c.credits} SKS · {c.schedule}</Text>
              </View>
              {selectedAdd === c._id && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* DROP section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.errorLight }]}>
              <Ionicons name="remove-circle-outline" size={20} color={Colors.error} />
            </View>
            <Text style={styles.sectionTitle}>Drop Mata Kuliah</Text>
          </View>

          {registered.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada mata kuliah terdaftar.</Text>
          ) : registered.map(r => (
            <TouchableOpacity
              key={r._id}
              style={[styles.item, selectedDrop === r.courseId && styles.itemDropSelected]}
              onPress={() => setSelectedDrop(selectedDrop === r.courseId ? null : r.courseId)}
            >
              <Text style={styles.itemCode}>{r.course?.code}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{r.course?.name}</Text>
                <Text style={styles.itemMeta}>{r.course?.credits} SKS</Text>
              </View>
              {selectedDrop === r.courseId && (
                <Ionicons name="close-circle" size={22} color={Colors.error} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        {(selectedAdd || selectedDrop) && (
          <View style={styles.summaryCard}>
            {selectedAdd && (
              <View style={styles.summaryRow}>
                <Ionicons name="add-circle" size={16} color={Colors.success} />
                <Text style={styles.summaryText}>
                  Tambah: {allCourses?.find(c => c._id === selectedAdd)?.name}
                </Text>
              </View>
            )}
            {selectedDrop && (
              <View style={styles.summaryRow}>
                <Ionicons name="remove-circle" size={16} color={Colors.error} />
                <Text style={styles.summaryText}>
                  Drop: {registered.find(r => r.courseId === selectedDrop)?.course?.name}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.saveBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name={loading ? 'hourglass-outline' : 'save-outline'} size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 22, paddingHorizontal: 20, overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(232,184,75,0.1)', top: -60, right: -40,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  body: { flex: 1, padding: 16 },
  sectionCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark },
  loadingText: { color: Colors.textLight, fontSize: 14 },
  emptyText: { color: Colors.textLight, fontSize: 13, fontStyle: 'italic' },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  itemAddSelected: { borderColor: Colors.primary, backgroundColor: '#EBF4FF' },
  itemDropSelected: { borderColor: Colors.error, backgroundColor: Colors.errorLight },
  itemCode: {
    fontSize: 10, fontWeight: '800', color: Colors.textLight,
    width: 38, letterSpacing: 0.4,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark },
  itemMeta: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  summaryCard: {
    backgroundColor: Colors.accentPale, borderRadius: 14, padding: 14,
    marginBottom: 16, gap: 8,
    borderWidth: 1, borderColor: '#FBD38D',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { fontSize: 13, color: Colors.primaryDark, fontWeight: '600', flex: 1 },
  saveBtn: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  saveBtnGrad: {
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});