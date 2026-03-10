import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, PrimaryButton, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

const LABELS = ['Sangat Buruk','Buruk','Cukup','Baik','Sangat Baik'];

export default function TeacherEvaluationScreen() {
  const { user } = useAuth();
  const myRegs    = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const myEvals   = useQuery(api.teacherEvalutions.listByUser, user ? { userId: user._id as any } : 'skip');
  const createMut = useMutation(api.teacherEvalutions.create);

  const [courseId, setCourseId] = useState<string|null>(null);
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState('');
  const [loading,  setLoad]     = useState(false);
  const [focused,  setFocused]  = useState(false);

  if (!myRegs || !myEvals) return <LoadingScreen />;

  const registered   = myRegs.filter(r => r.status === 'registered');
  const evaluatedIds = new Set(myEvals.map(e => e.courseId));
  const selected     = registered.find(r => r.courseId === courseId);
  const existing     = myEvals.find(e => e.courseId === courseId);
  const isEdit       = !!existing && !!courseId;

  const handleSelect = (id: string) => {
    setCourseId(id);
    const ev = myEvals.find(e => e.courseId === id);
    if (ev) { setRating(ev.rating); setComment(ev.comment ?? ''); }
    else    { setRating(0); setComment(''); }
  };

  const handleSubmit = async () => {
    if (!courseId)  { Alert.alert('Info', 'Pilih mata kuliah.'); return; }
    if (rating < 1) { Alert.alert('Info', 'Berikan penilaian bintang.'); return; }
    setLoad(true);
    try {
      await createMut({ userId: user!._id as any, courseId: courseId as any, rating, comment: comment.trim() || undefined });
      Alert.alert('Terima kasih!', 'Evaluasi berhasil disimpan.');
      setCourseId(null); setRating(0); setComment('');
    } catch (e: any) { Alert.alert('Gagal', e?.message); }
    finally { setLoad(false); }
  };

  return (
    <View style={s.root}>
      <PageHeader title="Evaluasi Dosen" subtitle={`${myEvals.length} evaluasi diberikan`} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Stats */}
        <View style={s.statsCard}>
          {[
            { val: registered.length,                             lbl: 'MK Terdaftar' },
            { val: myEvals.length,                                lbl: 'Sudah Dievaluasi' },
            { val: Math.max(0, registered.length - myEvals.length), lbl: 'Belum Dievaluasi' },
          ].map((st, i) => (
            <View key={i} style={[s.statItem, i > 0 && s.statBorder]}>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLbl}>{st.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Step 1 */}
        <View style={s.stepCard}>
          <StepHead n={1} title="Pilih Mata Kuliah" />
          {registered.length === 0
            ? <Text style={s.empty}>Belum ada MK yang terdaftar.</Text>
            : registered.map(r => {
              const isSel  = courseId === r.courseId;
              const isDone = evaluatedIds.has(r.courseId);
              return (
                <TouchableOpacity key={r._id} style={[s.mkItem, isSel && s.mkItemSel]} onPress={() => handleSelect(r.courseId)} activeOpacity={0.75}>
                  <View style={[s.mkCode, isSel && s.mkCodeSel]}><Text style={[s.mkCodeTxt, isSel && { color: C.white }]}>{r.course?.code ?? '—'}</Text></View>
                  <Text style={s.mkName} numberOfLines={1}>{r.course?.name ?? '—'}</Text>
                  {isDone && (
                    <View style={s.doneBadge}><Ionicons name="checkmark" size={9} color={C.textMuted} /><Text style={s.doneTxt}>Sudah</Text></View>
                  )}
                  <View style={[s.radio, isSel && s.radioSel]}>{isSel && <View style={s.radioDot} />}</View>
                </TouchableOpacity>
              );
            })
          }
        </View>

        {/* Lecturer info */}
        {selected && (
          <View style={s.lecCard}>
            <View style={s.lecAva}><Ionicons name="person" size={15} color={C.white} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.lecLabel}>Dosen Pengampu</Text>
              <Text style={s.lecName}>{selected.course?.lecturer ?? '—'}</Text>
            </View>
            {isEdit && <View style={s.editChip}><Ionicons name="create-outline" size={10} color={C.textMuted} /><Text style={s.editTxt}>Edit</Text></View>}
          </View>
        )}

        {/* Step 2 */}
        <View style={s.stepCard}>
          <StepHead n={2} title="Penilaian" />
          <View style={s.stars}>
            {[1,2,3,4,5].map(v => (
              <TouchableOpacity key={v} onPress={() => setRating(v)} style={s.star} activeOpacity={0.7}>
                <Ionicons name={v <= rating ? 'star' : 'star-outline'} size={34} color={v <= rating ? C.text : C.g300} />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <View style={s.ratingInfo}>
              <View style={s.ratingDots}>
                {[1,2,3,4,5].map(v => <View key={v} style={[s.dot, v <= rating && s.dotActive]} />)}
              </View>
              <Text style={s.ratingLbl}>{LABELS[rating-1]}</Text>
            </View>
          )}
        </View>

        {/* Step 3 */}
        <View style={s.stepCard}>
          <View style={s.step3Head}>
            <StepHead n={3} title="Komentar" />
            <View style={s.optChip}><Text style={s.optTxt}>Opsional</Text></View>
          </View>
          <TextInput
            style={[s.textarea, focused && s.textareaFocus]}
            placeholder="Tuliskan kesan, saran, atau masukan untuk dosen..."
            placeholderTextColor={C.textDisabled}
            multiline numberOfLines={4}
            value={comment} onChangeText={setComment}
            textAlignVertical="top"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>

        <PrimaryButton label={isEdit ? 'Perbarui Evaluasi' : 'Kirim Evaluasi'} onPress={handleSubmit} loading={loading} icon="send-outline" />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function StepHead({ n, title }: { n: number; title: string }) {
  return (
    <View style={st.row}>
      <View style={st.badge}><Text style={st.num}>{n}</Text></View>
      <Text style={st.title}>{title}</Text>
    </View>
  );
}
const st = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  badge: { width: 20, height: 20, borderRadius: R.xs, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  num:   { fontSize: 9, fontWeight: '800', color: C.white },
  title: { fontSize: 13, fontWeight: '700', color: C.text },
});

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  scroll:      { padding: 16 },

  statsCard:   { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, ...SH.xs },
  statItem:    { flex: 1, alignItems: 'center', gap: 2 },
  statBorder:  { borderLeftWidth: 1, borderLeftColor: C.border },
  statVal:     { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  statLbl:     { fontSize: 8, color: C.textMuted, fontWeight: '600', textAlign: 'center', letterSpacing: 0.2 },

  stepCard:    { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: C.border, ...SH.xs },
  step3Head:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty:       { fontSize: 12, color: C.textMuted, fontStyle: 'italic' },

  mkItem:      { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: R.sm, marginBottom: 6, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.g50 },
  mkItemSel:   { borderColor: C.ink, backgroundColor: C.g100 },
  mkCode:      { backgroundColor: C.g200, borderRadius: R.xs, paddingHorizontal: 7, paddingVertical: 3, flexShrink: 0 },
  mkCodeSel:   { backgroundColor: C.ink },
  mkCodeTxt:   { fontSize: 9, fontWeight: '700', color: C.textMuted },
  mkName:      { flex: 1, fontSize: 12, fontWeight: '600', color: C.text },
  doneBadge:   { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.g200, borderRadius: R.xs, paddingHorizontal: 6, paddingVertical: 2 },
  doneTxt:     { fontSize: 8, fontWeight: '700', color: C.textMuted },
  radio:       { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioSel:    { borderColor: C.ink },
  radioDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink },

  lecCard:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border, ...SH.xs },
  lecAva:      { width: 32, height: 32, borderRadius: R.sm, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  lecLabel:    { fontSize: 9, color: C.textMuted, marginBottom: 1 },
  lecName:     { fontSize: 12, fontWeight: '700', color: C.text },
  editChip:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.g100, borderRadius: R.xs, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1, borderColor: C.border },
  editTxt:     { fontSize: 9, color: C.textMuted, fontWeight: '600' },

  stars:       { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  star:        { padding: 2 },
  ratingInfo:  { alignItems: 'center', gap: 7 },
  ratingDots:  { flexDirection: 'row', gap: 4 },
  dot:         { width: 5, height: 5, borderRadius: 3, backgroundColor: C.g200 },
  dotActive:   { backgroundColor: C.ink },
  ratingLbl:   { fontSize: 12, fontWeight: '700', color: C.text },

  optChip:     { backgroundColor: C.g100, borderRadius: R.xs, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: C.border },
  optTxt:      { fontSize: 9, color: C.textMuted, fontWeight: '600' },
  textarea:    { backgroundColor: C.g100, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border, padding: 12, fontSize: 13, color: C.text, minHeight: 90, marginTop: 4 },
  textareaFocus:{ borderColor: C.ink, backgroundColor: C.white },
});