import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingScreen } from '../components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import C from '../constants/Colors';

const GW: Record<string, number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };

type GradeStyle = { color: string; bg: string; glow: string };
const GS: Record<string, GradeStyle> = {
  A:   { color: C.success,  bg: C.successBg, glow: '#16A34A' },
  'A-':{ color: C.success,  bg: C.successBg, glow: '#16A34A' },
  'B+':{ color: C.info,     bg: C.infoBg,    glow: '#2563EB' },
  B:   { color: C.info,     bg: C.infoBg,    glow: '#2563EB' },
  'B-':{ color: C.info,     bg: C.infoBg,    glow: '#2563EB' },
  'C+':{ color: C.warning,  bg: C.warningBg, glow: '#D97706' },
  C:   { color: C.warning,  bg: C.warningBg, glow: '#D97706' },
  D:   { color: C.error,    bg: C.errorBg,   glow: '#DC2626' },
  E:   { color: C.error,    bg: C.errorBg,   glow: '#DC2626' },
};

export default function ViewGradeScreen() {
  const { user } = useAuth();
  const grades = useQuery(api.grades.listByUser, user ? { userId: user._id as any } : 'skip');

  if (!grades) return <LoadingScreen />;

  let ipk = 0, totalSKS = 0;
  if (grades.length) {
    const wb = grades.reduce((s, g) => s + (GW[g.grade] ?? 0) * (g.course?.credits ?? 0), 0);
    const ws = grades.reduce((s, g) => s + (g.course?.credits ?? 0), 0);
    if (ws > 0) { ipk = wb / ws; totalSKS = ws; }
  }

  const ipkColor = ipk >= 3.5 ? C.success : ipk >= 3.0 ? C.info : ipk >= 2.5 ? C.warning : C.error;

  return (
    <View style={s.root}>
      <PageHeader title="Nilai Akademik" subtitle={`${grades.length} mata kuliah`}>
        {grades.length > 0 && (
          <View style={s.ipkCard}>
            <View style={s.ipkLeft}>
              <Text style={s.ipkLabel}>IPK Kumulatif</Text>
              <Text style={[s.ipkValue, { color: ipkColor }]}>{ipk.toFixed(2)}</Text>
            </View>
            <View style={s.ipkDivider} />
            <View style={s.ipkRight}>
              <Text style={s.ipkSksLabel}>Total SKS</Text>
              <Text style={s.ipkSksValue}>{totalSKS} SKS</Text>
            </View>
            <View style={s.ipkRight}>
              <Text style={s.ipkSksLabel}>MK Selesai</Text>
              <Text style={s.ipkSksValue}>{grades.length} MK</Text>
            </View>
          </View>
        )}
      </PageHeader>

      {grades.length === 0
        ? <EmptyState icon="school-outline" title="Belum Ada Nilai" subtitle="Nilai Anda akan muncul di sini setelah diinput oleh dosen" />
        : (
          <FlatList
            data={grades}
            keyExtractor={i => i._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const gs = GS[item.grade] ?? { color: C.textMuted, bg: C.borderLight, glow: C.textMuted };
              return (
                <View style={s.card}>
                  <View style={[s.gradeBadge, { backgroundColor: gs.bg, borderColor: gs.color + '40' }]}>
                    <Text style={[s.gradeText, { color: gs.color }]}>{item.grade}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.codeRow}>
                      <Text style={s.courseCode}>{item.course?.code ?? '—'}</Text>
                      <Text style={s.sks}>{item.course?.credits ?? 0} SKS</Text>
                    </View>
                    <Text style={s.courseName}>{item.course?.name ?? 'Mata Kuliah'}</Text>
                    <View style={s.bottomRow}>
                      <View style={s.scoreChip}>
                        <Text style={s.scoreLabel}>Skor</Text>
                        <Text style={s.scoreValue}>{item.score}</Text>
                      </View>
                      <View style={s.bobotChip}>
                        <Text style={s.bobotLabel}>Bobot</Text>
                        <Text style={s.bobotValue}>{(GW[item.grade] ?? 0).toFixed(1)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )
      }
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.background },
  ipkCard:    { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:14, padding:14, marginTop:14, borderWidth:1, borderColor:'rgba(255,255,255,0.18)', gap:12 },
  ipkLeft:    { alignItems:'center' },
  ipkLabel:   { fontSize:10, color:'rgba(255,255,255,0.65)', marginBottom:2 },
  ipkValue:   { fontSize:26, fontWeight:'900' },
  ipkDivider: { width:1, height:36, backgroundColor:'rgba(255,255,255,0.2)', marginHorizontal:4 },
  ipkRight:   { flex:1, alignItems:'center' },
  ipkSksLabel:{ fontSize:10, color:'rgba(255,255,255,0.65)', marginBottom:2 },
  ipkSksValue:{ fontSize:15, fontWeight:'700', color:'#FFF' },
  list:       { padding:16, gap:10 },
  card:       { backgroundColor:C.surface, borderRadius:16, padding:16, flexDirection:'row', gap:14, alignItems:'center', borderWidth:1, borderColor:C.borderLight, shadowColor:C.primary, shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:3 },
  gradeBadge: { width:52, height:52, borderRadius:14, alignItems:'center', justifyContent:'center', borderWidth:1.5, flexShrink:0 },
  gradeText:  { fontSize:18, fontWeight:'900' },
  codeRow:    { flexDirection:'row', justifyContent:'space-between', marginBottom:3 },
  courseCode: { fontSize:12, fontWeight:'700', color:C.accent },
  sks:        { fontSize:11, color:C.textMuted, fontWeight:'600' },
  courseName: { fontSize:14, fontWeight:'700', color:C.text, marginBottom:8 },
  bottomRow:  { flexDirection:'row', gap:8 },
  scoreChip:  { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:C.primaryLight, borderRadius:8, paddingHorizontal:8, paddingVertical:4 },
  scoreLabel: { fontSize:10, color:C.primaryMid },
  scoreValue: { fontSize:12, fontWeight:'800', color:C.primary },
  bobotChip:  { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:C.accentLight, borderRadius:8, paddingHorizontal:8, paddingVertical:4 },
  bobotLabel: { fontSize:10, color:C.accent },
  bobotValue: { fontSize:12, fontWeight:'800', color:C.accent },
});