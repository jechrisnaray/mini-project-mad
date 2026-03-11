import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { PageHeader, LoadingScreen, EmptyState } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

const formatDate = (ts: number) => new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });

export default function TeacherEvaluationsAdminScreen() {
  const evals = useQuery(api.teacherEvalutions.listAll);

  if (!evals) return <LoadingScreen />;
  if (evals.length === 0) return <EmptyState icon="star-outline" title="Belum ada evaluasi" subtitle="Mahasiswa belum mengisi evaluasi dosen" />;

  // Kelompokkan berdasarkan mata kuliah
  const byCourse: Record<string, typeof evals> = {};
  for (const e of evals) {
    const courseId = e.courseId;
    if (!byCourse[courseId]) byCourse[courseId] = [];
    byCourse[courseId].push(e);
  }

  return (
    <View style={s.root}>
      <PageHeader title="Evaluasi Dosen" subtitle="Semua masukan mahasiswa" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {Object.entries(byCourse).map(([courseId, list]) => {
          const course = list[0].course;
          const avgRating = list.reduce((a, e) => a + e.rating, 0) / list.length;
          return (
            <View key={courseId} style={s.courseBlock}>
              <View style={s.courseHeader}>
                <View style={s.codeBox}><Text style={s.codeTxt}>{course?.code}</Text></View>
                <Text style={s.courseName} numberOfLines={1}>{course?.name}</Text>
                <View style={s.avgChip}>
                  <Ionicons name="star" size={12} color={C.gold} />
                  <Text style={s.avgTxt}>{avgRating.toFixed(1)}</Text>
                </View>
              </View>
              <View style={s.evalList}>
                {list.map((e, i) => (
                  <View key={e._id} style={[s.evalItem, i > 0 && { borderTopWidth:1, borderTopColor:C.borderLight }]}>
                    <View style={s.userRow}>
                      <View style={s.avatar}>
                        <Text style={s.avatarTxt}>
                          {e.user?.name?.split(' ').slice(0,2).map((n:string)=>n[0]).join('').toUpperCase()}
                        </Text>
                      </View>
                      <View style={{flex:1}}>
                        <Text style={s.userName}>{e.user?.name}</Text>
                        <Text style={s.userNim}>{e.user?.nim ?? e.user?.username}</Text>
                      </View>
                      <View style={s.ratingBadge}>
                        <Ionicons name="star" size={12} color={C.gold} />
                        <Text style={s.ratingVal}>{e.rating}</Text>
                      </View>
                    </View>
                    {e.comment ? (
                      <Text style={s.comment}>“{e.comment}”</Text>
                    ) : (
                      <Text style={s.noComment}>— tidak ada komentar —</Text>
                    )}
                    <Text style={s.date}>{formatDate(e.createdAt)}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
        <View style={{height:24}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex:1, backgroundColor:C.bg },
  scroll: { padding:16 },

  courseBlock:  { marginBottom:16 },
  courseHeader: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:6, paddingHorizontal:4 },
  codeBox:      { backgroundColor:C.primaryFaint, borderRadius:R.xs, paddingHorizontal:7, paddingVertical:3 },
  codeTxt:      { fontSize:9, fontWeight:'800', color:C.primary },
  courseName:   { fontSize:13, fontWeight:'700', color:C.text, flex:1 },
  avgChip:      { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:C.goldFaint, borderRadius:R.full, paddingHorizontal:8, paddingVertical:4 },
  avgTxt:       { fontSize:11, fontWeight:'800', color:C.gold },

  evalList:     { backgroundColor:C.surface, borderRadius:R.lg, borderWidth:1, borderColor:C.borderLight, overflow:'hidden', ...SH.xs },
  evalItem:     { padding:14 },

  userRow:      { flexDirection:'row', alignItems:'center', gap:12 },
  avatar:       { width:40, height:40, borderRadius:R.sm, backgroundColor:C.primary, alignItems:'center', justifyContent:'center' },
  avatarTxt:    { fontSize:12, fontWeight:'800', color:C.white },
  userName:     { fontSize:13, fontWeight:'600', color:C.text },
  userNim:      { fontSize:10, color:C.textMuted },
  ratingBadge:  { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:C.goldFaint, borderRadius:R.full, paddingHorizontal:8, paddingVertical:4 },
  ratingVal:    { fontSize:12, fontWeight:'800', color:C.gold },

  comment:      { fontSize:12, color:C.text, marginTop:8, paddingLeft:52, lineHeight:18 },
  noComment:    { fontSize:11, color:C.textMuted, fontStyle:'italic', marginTop:8, paddingLeft:52 },
  date:         { fontSize:10, color:C.textMuted, marginTop:6, paddingLeft:52 },
});