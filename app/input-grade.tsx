import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, FlatList, StatusBar, ScrollView,
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

const GRADE_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'];

export default function InputGradeScreen() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<Id<'users'> | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<Id<'courses'> | ''>('');
  const [grade, setGrade] = useState('');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);

  const students = useQuery(api.users.listStudents);
  const courses = useQuery(api.courses.list);
  const upsertGrade = useMutation(api.grades.upsert);

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'admin') {
      Alert.alert('Akses Ditolak', 'Halaman ini hanya untuk admin.');
      router.back();
    }
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handleSubmit = async () => {
    if (!selectedUser || !selectedCourse || !grade || !score) {
      Alert.alert('Semua field harus diisi');
      return;
    }
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      Alert.alert('Nilai angka harus antara 0-100');
      return;
    }
    setLoading(true);
    try {
      await upsertGrade({ userId: selectedUser, courseId: selectedCourse, grade, score: scoreNum });
      Alert.alert('Berhasil ✓', 'Nilai berhasil disimpan!');
      setSelectedUser('');
      setSelectedCourse('');
      setGrade('');
      setScore('');
    } catch (error: any) {
      Alert.alert('Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentData = students?.find(s => s._id === selectedUser);
  const selectedCourseData = courses?.find(c => c._id === selectedCourse);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark-outline" size={13} color={Colors.accent} />
          <Text style={styles.adminBadgeText}>Administrator</Text>
        </View>
        <Text style={styles.headerTitle}>Input Nilai</Text>
        <Text style={styles.headerSub}>Masukkan nilai akademik mahasiswa</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Selection summary */}
        {(selectedStudentData || selectedCourseData) && (
          <View style={styles.summaryCard}>
            {selectedStudentData && (
              <View style={styles.summaryRow}>
                <Ionicons name="person" size={15} color={Colors.primary} />
                <Text style={styles.summaryText}>{selectedStudentData.name}</Text>
              </View>
            )}
            {selectedCourseData && (
              <View style={styles.summaryRow}>
                <Ionicons name="book" size={15} color={Colors.primary} />
                <Text style={styles.summaryText}>{selectedCourseData.code} — {selectedCourseData.name}</Text>
              </View>
            )}
          </View>
        )}

        {/* Students */}
        <Text style={styles.sectionLabel}>Pilih Mahasiswa</Text>
        <View style={styles.selectionCard}>
          {!students ? (
            <Text style={styles.loadingText}>Memuat...</Text>
          ) : students.map(s => (
            <TouchableOpacity
              key={s._id}
              style={[styles.selectItem, selectedUser === s._id && styles.selectItemActive]}
              onPress={() => setSelectedUser(s._id)}
            >
              <View style={[styles.avatarSmall, { backgroundColor: selectedUser === s._id ? Colors.primary : Colors.background }]}>
                <Text style={[styles.avatarInitial, { color: selectedUser === s._id ? Colors.accent : Colors.textMid }]}>
                  {s.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectItemName}>{s.name}</Text>
                <Text style={styles.selectItemSub}>@{s.username}</Text>
              </View>
              {selectedUser === s._id && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Courses */}
        <Text style={styles.sectionLabel}>Pilih Mata Kuliah</Text>
        <View style={styles.selectionCard}>
          {!courses ? (
            <Text style={styles.loadingText}>Memuat...</Text>
          ) : courses.map(c => (
            <TouchableOpacity
              key={c._id}
              style={[styles.selectItem, selectedCourse === c._id && styles.selectItemActive]}
              onPress={() => setSelectedCourse(c._id)}
            >
              <View style={[styles.codeBadge, { backgroundColor: selectedCourse === c._id ? Colors.primary : Colors.background }]}>
                <Text style={[styles.codeText, { color: selectedCourse === c._id ? Colors.accent : Colors.textMid }]}>
                  {c.code}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectItemName}>{c.name}</Text>
                <Text style={styles.selectItemSub}>{c.credits} SKS · {c.lecturer}</Text>
              </View>
              {selectedCourse === c._id && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Grade letter picker */}
        <Text style={styles.sectionLabel}>Nilai Huruf</Text>
        <View style={styles.gradeGrid}>
          {GRADE_OPTIONS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.gradeOption, grade === g && styles.gradeOptionActive]}
              onPress={() => setGrade(g)}
            >
              <Text style={[styles.gradeOptionText, grade === g && styles.gradeOptionTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Score */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Nilai Angka (0-100)</Text>
        <TextInput
          style={styles.scoreInput}
          placeholder="Contoh: 85"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
          value={score}
          onChangeText={setScore}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.submitGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name={loading ? 'hourglass-outline' : 'save-outline'} size={18} color="#FFF" />
            <Text style={styles.submitText}>{loading ? 'Menyimpan...' : 'Simpan Nilai'}</Text>
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
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(232,184,75,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(232,184,75,0.3)',
  },
  adminBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.accentLight },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  body: { flex: 1, padding: 16 },
  summaryCard: {
    backgroundColor: Colors.accentPale, borderRadius: 14, padding: 14,
    marginBottom: 16, gap: 8, borderWidth: 1, borderColor: '#FBD38D',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { fontSize: 13, color: Colors.primaryDark, fontWeight: '600', flex: 1 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark, marginBottom: 10, letterSpacing: 0.2 },
  loadingText: { color: Colors.textLight, fontSize: 14 },
  selectionCard: {
    backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden',
    marginBottom: 16, borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  selectItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  selectItemActive: { backgroundColor: '#EBF4FF' },
  avatarSmall: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 13, fontWeight: '800' },
  codeBadge: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  codeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  selectItemName: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  selectItemSub: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  gradeOption: {
    width: 56, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: Colors.border,
  },
  gradeOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  gradeOptionText: { fontSize: 15, fontWeight: '800', color: Colors.textMid },
  gradeOptionTextActive: { color: Colors.accent },
  scoreInput: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 16,
    fontSize: 18, color: Colors.primaryDark, fontWeight: '700',
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 20,
  },
  submitBtn: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  submitGrad: {
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});