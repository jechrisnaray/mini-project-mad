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

const RATING_LABELS = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'];
const RATING_COLORS = ['', Colors.error, '#E07B2A', Colors.warning, Colors.primary, Colors.success];

export default function TeacherEvaluationScreen() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Id<'courses'> | ''>('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const registrations = useQuery(
    api.registrations.listByUser,
    user ? { userId: user._id } : 'skip'
  );
  const evaluate = useMutation(api.teacherEvalutions.create);

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);
  if (!user) return null;

  const registeredCourses = registrations?.filter(r => r.status === 'registered') ?? [];

  const handleSubmit = async () => {
    if (!selectedCourse) { Alert.alert('Pilih mata kuliah terlebih dahulu'); return; }
    if (!rating) { Alert.alert('Berikan rating terlebih dahulu'); return; }
    setLoading(true);
    try {
      await evaluate({
        userId: user._id,
        courseId: selectedCourse,
        rating,
        comment: comment.trim() || undefined,
      });
      Alert.alert('Berhasil ✓', 'Evaluasi berhasil dikirim. Terima kasih!');
      setSelectedCourse('');
      setRating(0);
      setComment('');
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
        <Text style={styles.headerTitle}>Evaluasi Dosen</Text>
        <Text style={styles.headerSub}>Beri penilaian untuk kualitas pengajaran</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Course selection */}
        <Text style={styles.sectionLabel}>Pilih Mata Kuliah</Text>
        {registrations === undefined ? (
          <Text style={styles.loadingText}>Memuat data...</Text>
        ) : registeredCourses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Belum ada mata kuliah terdaftar.</Text>
          </View>
        ) : (
          registeredCourses.map(item => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.courseItem,
                selectedCourse === item.courseId && styles.courseItemSelected,
              ]}
              onPress={() => setSelectedCourse(item.courseId)}
            >
              <View style={[
                styles.courseItemLeft,
                { backgroundColor: selectedCourse === item.courseId ? Colors.primary : Colors.background }
              ]}>
                <Text style={[
                  styles.courseCode,
                  { color: selectedCourse === item.courseId ? Colors.accent : Colors.textMid }
                ]}>
                  {item.course?.code}
                </Text>
              </View>
              <View style={styles.courseItemInfo}>
                <Text style={styles.courseItemName}>{item.course?.name}</Text>
                <Text style={styles.courseItemLecturer}>{item.course?.lecturer}</Text>
              </View>
              {selectedCourse === item.courseId && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Rating */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Rating Dosen</Text>
        <View style={styles.ratingCard}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(val => (
              <TouchableOpacity key={val} onPress={() => setRating(val)} activeOpacity={0.7}>
                <Ionicons
                  name={val <= rating ? 'star' : 'star-outline'}
                  size={42}
                  color={val <= rating ? Colors.accent : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: RATING_COLORS[rating] }]}>
              {rating}/5 — {RATING_LABELS[rating]}
            </Text>
          )}
        </View>

        {/* Comment */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Komentar (opsional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Bagikan pengalaman Anda dengan dosen ini..."
          placeholderTextColor={Colors.textLight}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.submitGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name={loading ? 'hourglass-outline' : 'send-outline'} size={18} color="#FFF" />
            <Text style={styles.submitText}>{loading ? 'Mengirim...' : 'Kirim Evaluasi'}</Text>
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
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(232,184,75,0.1)', top: -60, right: -40,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  body: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark, marginBottom: 10, letterSpacing: 0.2 },
  loadingText: { color: Colors.textLight, fontSize: 14 },
  emptyBox: { padding: 20, backgroundColor: '#FFF', borderRadius: 14, alignItems: 'center' },
  emptyText: { color: Colors.textLight, fontSize: 14 },
  courseItem: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  courseItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F5FF',
  },
  courseItemLeft: {
    width: 50, height: 50, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  courseCode: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  courseItemInfo: { flex: 1 },
  courseItemName: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  courseItemLecturer: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  ratingCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  starsRow: { flexDirection: 'row', gap: 8 },
  ratingLabel: { fontSize: 14, fontWeight: '700', marginTop: 12 },
  commentInput: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 16,
    minHeight: 110, fontSize: 14, color: Colors.text,
    borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: 20,
  },
  submitBtn: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  submitGrad: {
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});