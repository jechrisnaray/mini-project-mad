import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, PrimaryButton, LoadingScreen, GoldChip } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C from '../constants/Colors';

const RATINGS = [
  { v: 1, label: 'Sangat Buruk' },
  { v: 2, label: 'Buruk' },
  { v: 3, label: 'Cukup' },
  { v: 4, label: 'Baik' },
  { v: 5, label: 'Sangat Baik' },
];

export default function TeacherEvaluationScreen() {
  const { user } = useAuth();
  const myRegs  = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const createMut = useMutation(api.teacherEvalutions.create);

  const [courseId, setCourseId] = useState<string | null>(null);
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState('');
  const [loading, setLoad]      = useState(false);

  if (!myRegs) return <LoadingScreen />;
  const registered = myRegs.filter(r => r.status === 'registered');

  const handleSubmit = async () => {
    if (!courseId) { Alert.alert('Info', 'Pilih mata kuliah terlebih dahulu.'); return; }
    if (!rating)   { Alert.alert('Info', 'Berikan penilaian bintang.'); return; }
    setLoad(true);
    try {
      await createMut({ userId: user!._id as any, courseId: courseId as any, rating, comment: comment.trim() || undefined });
      Alert.alert('Terima kasih!', 'Evaluasi Anda berhasil disimpan.');
      setCourseId(null); setRating(0); setComment('');
    } catch (e: any) { Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan'); }
    finally { setLoad(false); }
  };

  const selectedCourse = registered.find(r => r.courseId === courseId);

  return (
    <View style={s.root}>
      <PageHeader title="Evaluasi Dosen" subtitle="Berikan penilaian jujur Anda" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Course select */}
        <View style={s.sectionBox}>
          <Text style={s.sectionTitle}>Pilih Mata Kuliah</Text>
          {registered.length === 0
            ? <Text style={s.empty}>Belum ada MK yang terdaftar.</Text>
            : registered.map(r => (
              <TouchableOpacity
                key={r._id}
                style={[s.courseItem, courseId === r.courseId && s.courseItemActive]}
                onPress={() => setCourseId(r.courseId)}
                activeOpacity={0.75}
              >
                <GoldChip label={r.course?.code ?? '—'} />
                <Text style={s.courseItemName} numberOfLines={1}>{r.course?.name ?? 'Mata Kuliah'}</Text>
                {courseId === r.courseId && <Ionicons name="checkmark-circle" size={20} color={C.primary} />}
              </TouchableOpacity>
            ))
          }
        </View>

        {/* Rating stars */}
        <View style={s.sectionBox}>
          <Text style={s.sectionTitle}>Penilaian</Text>
          <View style={s.starsRow}>
            {[1,2,3,4,5].map(v => (
              <TouchableOpacity key={v} onPress={() => setRating(v)} style={s.starBtn}>
                <Ionicons name={v <= rating ? 'star' : 'star-outline'} size={34} color={v <= rating ? C.accentBright : C.border} />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={s.ratingLabel}>{RATINGS[rating - 1].label}</Text>
          )}
        </View>

        {/* Dosen info */}
        {selectedCourse && (
          <View style={s.dosenCard}>
            <Ionicons name="person-circle-outline" size={28} color={C.primaryMid} />
            <View>
              <Text style={s.dosenLabel}>Dosen Pengampu</Text>
              <Text style={s.dosenName}>{selectedCourse.course?.lecturer ?? '—'}</Text>
            </View>
          </View>
        )}

        {/* Comment */}
        <View style={s.sectionBox}>
          <Text style={s.sectionTitle}>Komentar <Text style={s.optional}>(Opsional)</Text></Text>
          <TextInput
            style={s.commentBox}
            placeholder="Tuliskan kesan, saran, atau masukan untuk dosen..."
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        <PrimaryButton label="Kirim Evaluasi" onPress={handleSubmit} loading={loading} icon="send-outline" />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.background },
  scroll:          { padding: 16 },
  sectionBox:      { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.borderLight },
  sectionTitle:    { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 12 },
  optional:        { fontSize: 11, color: C.textMuted, fontWeight: '400' },
  empty:           { fontSize: 13, color: C.textMuted, fontStyle: 'italic' },
  courseItem:      { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 12, borderWidth: 1.5, borderColor: C.borderLight, marginBottom: 8 },
  courseItemActive:{ borderColor: C.primary, backgroundColor: C.primaryPale },
  courseItemName:  { flex: 1, fontSize: 13, fontWeight: '600', color: C.text },
  starsRow:        { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 10 },
  starBtn:         { padding: 4 },
  ratingLabel:     { textAlign: 'center', fontSize: 14, fontWeight: '700', color: C.accent },
  dosenCard:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.primaryLight, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  dosenLabel:      { fontSize: 11, color: C.textMuted },
  dosenName:       { fontSize: 14, fontWeight: '700', color: C.primary },
  commentBox:      { backgroundColor: C.background, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 12, fontSize: 14, color: C.text, minHeight: 100 },
});