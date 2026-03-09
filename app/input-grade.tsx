import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, PrimaryButton, LoadingScreen, GoldChip } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import C from '../constants/Colors';

const GRADES = ['A','A-','B+','B','B-','C+','C','D','E'];

export default function InputGradeScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'admin') { router.replace('/dashboard'); }
  }, [user]);

  const students = useQuery(api.users.listStudents);
  const courses  = useQuery(api.courses.list);
  const upsertMut = useMutation(api.grades.upsert);

  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId,  setCourseId]  = useState<string | null>(null);
  const [grade,     setGrade]     = useState('');
  const [score,     setScore]     = useState('');
  const [loading,   setLoad]      = useState(false);

  if (!students || !courses) return <LoadingScreen />;
  if (!user || user.role !== 'admin') return null;

  const handleSave = async () => {
    if (!studentId || !courseId || !grade) { Alert.alert('Info', 'Pilih mahasiswa, mata kuliah, dan nilai.'); return; }
    const sc = parseInt(score);
    if (isNaN(sc) || sc < 0 || sc > 100) { Alert.alert('Info', 'Skor harus antara 0–100.'); return; }
    setLoad(true);
    try {
      await upsertMut({ userId: studentId as any, courseId: courseId as any, grade, score: sc });
      Alert.alert('Berhasil', 'Nilai berhasil disimpan!');
      setGrade(''); setScore('');
    } catch (e: any) { Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan'); }
    finally { setLoad(false); }
  };

  return (
    <View style={s.root}>
      <PageHeader title="Input Nilai" subtitle="Panel Administrator" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Step 1: Pilih Mahasiswa */}
        <View style={s.stepCard}>
          <View style={s.stepHeader}>
            <View style={s.stepNum}><Text style={s.stepNumTxt}>1</Text></View>
            <Text style={s.stepTitle}>Pilih Mahasiswa</Text>
          </View>
          <View style={s.selectList}>
            {students.map(st => (
              <TouchableOpacity
                key={st._id}
                style={[s.selectItem, studentId === st._id && s.selectItemActive]}
                onPress={() => setStudentId(st._id)}
                activeOpacity={0.75}
              >
                <View style={[s.avatar, studentId === st._id && { backgroundColor: C.primary }]}>
                  <Text style={[s.avatarTxt, studentId === st._id && { color: '#FFF' }]}>
                    {st.name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.selectName}>{st.name}</Text>
                  <Text style={s.selectSub}>{st.username}</Text>
                </View>
                {studentId === st._id && <Ionicons name="checkmark-circle" size={20} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 2: Pilih MK */}
        <View style={s.stepCard}>
          <View style={s.stepHeader}>
            <View style={s.stepNum}><Text style={s.stepNumTxt}>2</Text></View>
            <Text style={s.stepTitle}>Pilih Mata Kuliah</Text>
          </View>
          <View style={s.selectList}>
            {courses.map(c => (
              <TouchableOpacity
                key={c._id}
                style={[s.selectItem, courseId === c._id && s.selectItemActive]}
                onPress={() => setCourseId(c._id)}
                activeOpacity={0.75}
              >
                <GoldChip label={c.code} />
                <Text style={s.selectName} numberOfLines={1}>{c.name}</Text>
                <Text style={s.sksChip}>{c.credits} SKS</Text>
                {courseId === c._id && <Ionicons name="checkmark-circle" size={18} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 3: Input Nilai */}
        <View style={s.stepCard}>
          <View style={s.stepHeader}>
            <View style={s.stepNum}><Text style={s.stepNumTxt}>3</Text></View>
            <Text style={s.stepTitle}>Input Nilai</Text>
          </View>

          <Text style={s.fieldLabel}>Nilai Huruf</Text>
          <View style={s.gradeGrid}>
            {GRADES.map(g => (
              <TouchableOpacity
                key={g}
                style={[s.gradeBtn, grade === g && s.gradeBtnActive]}
                onPress={() => setGrade(g)}
              >
                <Text style={[s.gradeBtnTxt, grade === g && s.gradeBtnTxtActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Skor Numerik (0–100)</Text>
          <View style={s.inputRow}>
            <Ionicons name="calculator-outline" size={17} color={C.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.input}
              placeholder="Masukkan skor 0–100"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              value={score}
              onChangeText={setScore}
              maxLength={3}
            />
          </View>
        </View>

        <PrimaryButton label="Simpan Nilai" onPress={handleSave} loading={loading} icon="save-outline" />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.background },
  scroll:          { padding: 16 },
  stepCard:        { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.borderLight },
  stepHeader:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  stepNum:         { width: 26, height: 26, borderRadius: 13, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt:      { fontSize: 12, fontWeight: '900', color: '#FFF' },
  stepTitle:       { fontSize: 14, fontWeight: '800', color: C.text },
  selectList:      { gap: 8 },
  selectItem:      { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 12, borderWidth: 1.5, borderColor: C.borderLight },
  selectItemActive:{ borderColor: C.primary, backgroundColor: C.primaryPale },
  avatar:          { width: 36, height: 36, borderRadius: 11, backgroundColor: C.accentLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt:       { fontSize: 12, fontWeight: '800', color: C.accent },
  selectName:      { fontSize: 13, fontWeight: '700', color: C.text, flex: 1 },
  selectSub:       { fontSize: 11, color: C.textMuted },
  sksChip:         { fontSize: 11, color: C.textMuted, fontWeight: '600' },
  fieldLabel:      { fontSize: 12, fontWeight: '700', color: C.textSub, marginBottom: 8 },
  gradeGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gradeBtn:        { width: 56, paddingVertical: 10, borderRadius: 11, backgroundColor: C.background, alignItems: 'center', borderWidth: 1.5, borderColor: C.borderLight },
  gradeBtnActive:  { backgroundColor: C.primary, borderColor: C.primary },
  gradeBtnTxt:     { fontSize: 15, fontWeight: '800', color: C.textSub },
  gradeBtnTxtActive:{ color: '#FFF' },
  inputRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, borderRadius: 13, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 12 },
  input:           { flex: 1, paddingVertical: 13, fontSize: 15, color: C.text },
});