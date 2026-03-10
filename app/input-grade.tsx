import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  Alert, ScrollView, StatusBar, SectionList,
} from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import C, { SH, R } from '../constants/Colors';

const GRADES    = ['A','A-','B+','B','B-','C+','C','D','E'];
const GW: Record<string,number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };
const SEMESTERS = ['2024/2025 Genap','2024/2025 Ganjil','2023/2024 Genap','2023/2024 Ganjil'];

const initials = (n: string) => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

export default function InputGradeScreen() {
  const { user } = useAuth();
  useEffect(() => { if (user && user.role !== 'admin') router.replace('/dashboard'); }, [user]);

  const students  = useQuery(api.users.listStudents);
  const courses   = useQuery(api.courses.list);
  const upsertMut = useMutation(api.grades.upsert);

  const [step,      setStep]      = useState(1);
  const [courseId,  setCourseId]  = useState<string|null>(null);
  const [studentId, setStudentId] = useState<string|null>(null);
  const [grade,     setGrade]     = useState('');
  const [semester,  setSemester]  = useState(SEMESTERS[0]);
  const [query,     setQuery]     = useState('');
  const [saving,    setSaving]    = useState(false);

  const courseGrades    = useQuery(api.grades.listByCourse, courseId ? { courseId:courseId as any } : 'skip');
  const selectedCourse  = courses?.find(c => c._id === courseId);
  const selectedStudent = students?.find(s => s._id === studentId);
  const existingGrade   = courseGrades?.find(g => g.userId === studentId);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    const q = query.toLowerCase();
    return students.filter(s => s.name.toLowerCase().includes(q) || (s.nim ?? '').includes(q));
  }, [students, query]);

  const grouped = useMemo(() => {
    const map: Record<string,typeof filteredStudents> = {};
    for (const s of filteredStudents) {
      const key = s.prodi ?? 'Lainnya';
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return Object.entries(map).map(([title,data]) => ({ title, data }));
  }, [filteredStudents]);

  const reset = () => { setStep(1); setCourseId(null); setStudentId(null); setGrade(''); setQuery(''); };

  const handleSave = async () => {
    if (!courseId || !studentId || !grade) return;
    setSaving(true);
    try {
      await upsertMut({ userId:studentId as any, courseId:courseId as any, grade, score:0, semester });
      Alert.alert('Nilai Tersimpan', `${selectedStudent?.name} — ${selectedCourse?.name}: ${grade}`, [
        { text:'Input Lagi', onPress:()=>{ setStudentId(null); setGrade(''); setStep(2); } },
        { text:'Selesai',    onPress:reset },
      ]);
    } catch { Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan nilai.'); }
    finally { setSaving(false); }
  };

  if (!students || !courses) return <LoadingScreen />;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
      <PageHeader
        title="Input Nilai"
        subtitle={selectedCourse ? `${selectedCourse.code} — ${selectedCourse.name}` : 'Admin Panel'}
        right={step > 1
          ? <TouchableOpacity onPress={reset} style={s.resetBtn}><Text style={s.resetTxt}>Reset</Text></TouchableOpacity>
          : undefined
        }
      />

      {/* Step indicator */}
      <View style={s.stepBar}>
        {['Pilih MK','Pilih Mahasiswa','Input Nilai'].map((lbl, i) => (
          <View key={i} style={s.stepItem}>
            <View style={[s.stepDot, step===i+1 && s.stepDotActive, step>i+1 && s.stepDotDone]}>
              {step>i+1
                ? <Ionicons name="checkmark" size={11} color={C.white} />
                : <Text style={[s.stepNum, step>=i+1 && {color:C.white}]}>{i+1}</Text>
              }
            </View>
            <Text style={[s.stepLbl, step===i+1 && {color:C.text, fontWeight:'700'}]}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* Step 1: Pilih MK */}
      {step === 1 && (
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          <Text style={s.secLabel}>Semester</Text>
          <View style={s.semPicker}>
            {SEMESTERS.map(sm => (
              <TouchableOpacity key={sm} style={[s.semOpt, semester===sm && s.semOptActive]} onPress={()=>setSemester(sm)}>
                <Text style={[s.semOptTxt, semester===sm && {color:C.white}]}>{sm}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.secLabel}>Mata Kuliah</Text>
          {courses.map(c => (
            <TouchableOpacity key={c._id} style={s.courseRow} onPress={()=>{ setCourseId(c._id); setStep(2); }}>
              <View style={s.codeBox}><Text style={s.codeTxt}>{c.code}</Text></View>
              <View style={{flex:1}}>
                <Text style={s.courseName}>{c.name}</Text>
                <Text style={s.courseMeta}>{c.credits} SKS · {c.lecturer}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={C.textLight} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Step 2: Pilih Mahasiswa */}
      {step === 2 && (
        <View style={{flex:1}}>
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={15} color={C.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="Cari nama atau NIM..."
              placeholderTextColor={C.textDisabled}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
          </View>
          <SectionList
            sections={grouped}
            keyExtractor={item => item._id}
            contentContainerStyle={{paddingBottom:32}}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <View style={s.groupHead}>
                <Text style={s.groupTitle}>{section.title}</Text>
                <Text style={s.groupCount}>{section.data.length} mahasiswa</Text>
              </View>
            )}
            renderItem={({ item:st, index, section }) => {
              const hasGrade = courseGrades?.find(g => g.userId === st._id);
              const isFirst  = index === 0;
              const isLast   = index === section.data.length - 1;
              return (
                <TouchableOpacity
                  style={[
                    s.studentRow,
                    isFirst  && { borderTopLeftRadius:R.md, borderTopRightRadius:R.md },
                    isLast   && { borderBottomLeftRadius:R.md, borderBottomRightRadius:R.md, marginBottom:10 },
                    index>0  && { borderTopWidth:1, borderTopColor:C.borderLight },
                  ]}
                  onPress={()=>{ setStudentId(st._id); setGrade(hasGrade?.grade ?? ''); setStep(3); }}
                >
                  <View style={s.avatar}><Text style={s.avatarTxt}>{initials(st.name)}</Text></View>
                  <View style={{flex:1}}>
                    <Text style={s.studentName}>{st.name}</Text>
                    <Text style={s.studentNim}>{st.nim ?? st.username}</Text>
                  </View>
                  {hasGrade && <View style={s.gradeChip}><Text style={s.gradeChipTxt}>{hasGrade.grade}</Text></View>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Step 3: Input Nilai */}
      {step === 3 && (
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          <View style={s.studentCard}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{initials(selectedStudent?.name ?? '')}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={s.scName}>{selectedStudent?.name}</Text>
              <Text style={s.scMeta}>{selectedStudent?.nim} · {selectedStudent?.prodi}</Text>
            </View>
            {existingGrade && (
              <View style={s.existingBadge}>
                <Text style={s.existingLbl}>Ada nilai</Text>
                <Text style={s.existingVal}>{existingGrade.grade}</Text>
              </View>
            )}
          </View>

          <Text style={s.secLabel}>Pilih Nilai</Text>
          <View style={s.gradeGrid}>
            {GRADES.map(g => (
              <TouchableOpacity key={g} style={[s.gradeBtn, grade===g && s.gradeBtnActive]} onPress={()=>setGrade(g)}>
                <Text style={[s.gradeLetter, grade===g && {color:C.white}]}>{g}</Text>
                <Text style={[s.gradePoint, grade===g && {color:'rgba(255,255,255,0.7)'}]}>{(GW[g]??0).toFixed(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {grade && (
            <View style={s.preview}>
              <Text style={s.prevLbl}>Nilai dipilih: </Text>
              <Text style={s.prevGrade}>{grade}</Text>
              <Text style={s.prevPoint}> ({(GW[grade]??0).toFixed(2)} mutu)</Text>
            </View>
          )}

          <TouchableOpacity style={[s.saveBtn, (!grade||saving) && s.saveBtnOff]} onPress={handleSave} disabled={!grade||saving}>
            <Text style={s.saveTxt}>{saving?'Menyimpan...':existingGrade?'Perbarui Nilai':'Simpan Nilai'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.backStep} onPress={()=>setStep(2)}>
            <Ionicons name="arrow-back" size={13} color={C.textMuted} />
            <Text style={s.backStepTxt}>Ganti mahasiswa</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:C.bg },
  body:    { padding:18, paddingBottom:40 },
  resetBtn:{ paddingHorizontal:10, paddingVertical:5, backgroundColor:C.primaryFaint, borderRadius:R.sm, borderWidth:1, borderColor:C.primaryPale },
  resetTxt:{ fontSize:11, color:C.primary, fontWeight:'700' },

  stepBar:      { flexDirection:'row', padding:14, paddingBottom:6, backgroundColor:C.surface, borderBottomWidth:1, borderBottomColor:C.borderLight },
  stepItem:     { flex:1, alignItems:'center', gap:4 },
  stepDot:      { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:C.border, backgroundColor:C.surface, alignItems:'center', justifyContent:'center' },
  stepDotActive:{ backgroundColor:C.primary, borderColor:C.primary },
  stepDotDone:  { backgroundColor:C.primaryMid, borderColor:C.primaryMid },
  stepNum:      { fontSize:10, fontWeight:'700', color:C.textMuted },
  stepLbl:      { fontSize:9, color:C.textMuted },

  semPicker:   { flexDirection:'row', flexWrap:'wrap', gap:6, marginBottom:18 },
  semOpt:      { paddingHorizontal:11, paddingVertical:7, borderRadius:R.full, borderWidth:1, borderColor:C.border, backgroundColor:C.surface },
  semOptActive:{ backgroundColor:C.primary, borderColor:C.primary },
  semOptTxt:   { fontSize:11, color:C.textSub },
  secLabel:    { fontSize:11, fontWeight:'700', color:C.textMuted, letterSpacing:0.3, marginBottom:8 },

  courseRow:  { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.surface, borderRadius:R.md, padding:14, marginBottom:6, borderWidth:1, borderColor:C.borderLight, ...SH.xs },
  codeBox:    { backgroundColor:C.primaryFaint, borderRadius:R.xs, paddingHorizontal:8, paddingVertical:4 },
  codeTxt:    { fontSize:9, fontWeight:'800', color:C.primary },
  courseName: { fontSize:13, fontWeight:'600', color:C.text, marginBottom:2 },
  courseMeta: { fontSize:11, color:C.textMuted },

  searchBar:   { flexDirection:'row', alignItems:'center', margin:14, backgroundColor:C.surface, borderRadius:R.md, paddingHorizontal:13, paddingVertical:11, borderWidth:1, borderColor:C.borderLight, gap:8 },
  searchInput: { flex:1, fontSize:13, color:C.text, padding:0 },

  groupHead:   { flexDirection:'row', justifyContent:'space-between', paddingHorizontal:14, paddingVertical:7 },
  groupTitle:  { fontSize:10, fontWeight:'700', color:C.textMuted },
  groupCount:  { fontSize:10, color:C.textMuted },

  studentRow:  { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.surface, paddingHorizontal:14, paddingVertical:12, marginHorizontal:14 },
  avatar:      { width:36, height:36, borderRadius:R.sm, backgroundColor:C.primary, alignItems:'center', justifyContent:'center' },
  avatarTxt:   { fontSize:11, fontWeight:'800', color:C.white },
  studentName: { fontSize:13, fontWeight:'600', color:C.text },
  studentNim:  { fontSize:10, color:C.textMuted },
  gradeChip:   { width:34, height:34, borderRadius:R.sm, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:C.primaryPale },
  gradeChipTxt:{ fontSize:12, fontWeight:'800', color:C.primary },

  studentCard:  { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.surface, borderRadius:R.lg, padding:14, borderWidth:1, borderColor:C.borderLight, marginBottom:16, ...SH.sm },
  scName:       { fontSize:14, fontWeight:'700', color:C.text },
  scMeta:       { fontSize:11, color:C.textMuted, marginTop:2 },
  existingBadge:{ alignItems:'center', paddingLeft:12, borderLeftWidth:1, borderLeftColor:C.borderLight },
  existingLbl:  { fontSize:9, color:C.textMuted, marginBottom:2 },
  existingVal:  { fontSize:20, fontWeight:'900', color:C.primary },

  gradeGrid:      { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 },
  gradeBtn:       { width:'23%', aspectRatio:1, borderRadius:R.md, borderWidth:1.5, borderColor:C.borderLight, backgroundColor:C.surface, alignItems:'center', justifyContent:'center', gap:2 },
  gradeBtnActive: { backgroundColor:C.primary, borderColor:C.primary },
  gradeLetter:    { fontSize:18, fontWeight:'900', color:C.text },
  gradePoint:     { fontSize:10, color:C.textMuted, fontWeight:'600' },

  preview:   { flexDirection:'row', alignItems:'center', backgroundColor:C.primaryFaint, borderRadius:R.lg, padding:13, borderWidth:1, borderColor:C.primaryPale, marginBottom:14 },
  prevLbl:   { fontSize:12, color:C.textMuted },
  prevGrade: { fontSize:18, fontWeight:'900', color:C.primary },
  prevPoint: { fontSize:12, color:C.textMuted },

  saveBtn:     { backgroundColor:C.primary, borderRadius:R.md, paddingVertical:15, alignItems:'center', marginBottom:10, ...SH.sm },
  saveBtnOff:  { backgroundColor:C.g300 },
  saveTxt:     { fontSize:14, fontWeight:'700', color:C.white },
  backStep:    { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingVertical:12 },
  backStepTxt: { fontSize:12, color:C.textMuted },
});