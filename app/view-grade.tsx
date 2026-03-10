import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingScreen, EmptyState } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import C, { SH, R } from '../constants/Colors';

const GW: Record<string,number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };

const gradeLabel = (v: number) =>
  v>=3.51?'Dengan Pujian':v>=3.01?'Sangat Memuaskan':v>=2.76?'Memuaskan':v>=2.0?'Cukup':'Kurang';

const gradeBg = (g: string) => {
  const w = GW[g]??0;
  if(w>=3.7) return { bg:C.primary,      txt:C.white };
  if(w>=3.0) return { bg:C.primaryFaint, txt:C.primary };
  if(w>=2.0) return { bg:'#FAF3DC',      txt:'#B8862A' };
  return             { bg:'#E8F2EC',     txt:'#517A67' };
};

function StudentView({ userId }: { userId: string }) {
  const grades = useQuery(api.grades.listByUser, { userId: userId as any });
  if (!grades) return <LoadingScreen />;
  if (!grades.length) return <EmptyState icon="school-outline" title="Belum ada nilai" subtitle="Nilai akan tampil setelah dosen menginput" />;

  const totalSKS  = grades.reduce((s,g)=>s+(g.course?.credits??0),0);
  const totalMutu = grades.reduce((s,g)=>s+(GW[g.grade]??0)*(g.course?.credits??0),0);
  const ipk       = totalSKS>0 ? totalMutu/totalSKS : 0;

  const bySem: Record<string, typeof grades> = {};
  for (const g of grades) {
    const k = g.semester ?? 'Lainnya';
    if (!bySem[k]) bySem[k] = [];
    bySem[k].push(g);
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}>
      {/* IPK Hero Card */}
      <View style={s.ipkCard}>
        <View style={{flex:1}}>
          <Text style={s.ipkLabel}>Indeks Prestasi Kumulatif</Text>
          <Text style={s.ipkVal}>{ipk.toFixed(2)}</Text>
          <Text style={s.ipkTag}>{gradeLabel(ipk)}</Text>
        </View>
        <View style={s.ipkDivider} />
        <View style={s.ipkStats}>
          {[['SKS',totalSKS],['MK',grades.length],['Mutu',totalMutu.toFixed(0)]].map(([lbl,val])=>(
            <View key={lbl as string} style={s.ipkStat}>
              <Text style={s.ipkStatVal}>{val}</Text>
              <Text style={s.ipkStatLbl}>{lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      {Object.entries(bySem).map(([title, data]) => {
        const sSKS  = data.reduce((s,g)=>s+(g.course?.credits??0),0);
        const sMutu = data.reduce((s,g)=>s+(GW[g.grade]??0)*(g.course?.credits??0),0);
        const ips   = sSKS>0 ? sMutu/sSKS : 0;
        return (
          <View key={title} style={s.semGroup}>
            <View style={s.semHeader}>
              <View>
                <Text style={s.semTitle}>{title}</Text>
                <Text style={s.semMeta}>{data.length} MK · {sSKS} SKS</Text>
              </View>
              <View style={s.ipsChip}>
                <Text style={s.ipsVal}>{ips.toFixed(2)}</Text>
                <Text style={s.ipsLbl}>IPS</Text>
              </View>
            </View>
            <View style={s.table}>
              {data.map((g,i) => {
                const { bg, txt } = gradeBg(g.grade);
                return (
                  <View key={g._id} style={[s.row, i>0&&{borderTopWidth:1,borderTopColor:C.borderLight}]}>
                    <View style={s.codeBox}><Text style={s.code}>{g.course?.code??'–'}</Text></View>
                    <View style={{flex:1}}>
                      <Text style={s.mkName}>{g.course?.name??'Mata Kuliah'}</Text>
                      <Text style={s.mkMeta}>{g.course?.credits??0} SKS</Text>
                    </View>
                    <View style={[s.badge,{backgroundColor:bg}]}>
                      <Text style={[s.badgeTxt,{color:txt}]}>{g.grade}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function AdminView() {
  const courses = useQuery(api.courses.list);
  if (!courses) return <LoadingScreen />;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingBottom:40}}>
      <Text style={s.adminHint}>Tap MK untuk input nilai mahasiswa</Text>
      {courses.map(c => (
        <TouchableOpacity key={c._id} style={s.courseCard} onPress={()=>router.push('/input-grade' as any)} activeOpacity={0.75}>
          <View style={s.codeBox}><Text style={s.code}>{c.code}</Text></View>
          <View style={{flex:1}}>
            <Text style={s.mkName}>{c.name}</Text>
            <Text style={s.mkMeta}>{c.credits} SKS · {c.lecturer}</Text>
          </View>
          <View style={s.editBtn}><Ionicons name="create-outline" size={14} color={C.primary} /></View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function ViewGradeScreen() {
  const { user } = useAuth();
  if (!user) return null;
  const isAdmin = user.role === 'admin';
  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
      <PageHeader title={isAdmin?'Rekap Nilai':'Nilai Akademik'} subtitle={isAdmin?'Semua Mata Kuliah':'Transkrip & IPK'} showBack={false} />
      {isAdmin ? <AdminView /> : <StudentView userId={user._id} />}
    </View>
  );
}

const s = StyleSheet.create({
  ipkCard:      { margin:16, backgroundColor:C.primary, borderRadius:R.xl, padding:20, flexDirection:'row', alignItems:'center', ...SH.md },
  ipkLabel:     { fontSize:10, color:'rgba(255,255,255,0.65)', fontWeight:'600', marginBottom:4 },
  ipkVal:       { fontSize:52, fontWeight:'900', color:C.white, lineHeight:56, letterSpacing:-2 },
  ipkTag:       { fontSize:11, color:'rgba(255,255,255,0.75)', fontWeight:'600', marginTop:4 },
  ipkDivider:   { width:1, height:60, backgroundColor:'rgba(255,255,255,0.2)', marginHorizontal:16 },
  ipkStats:     { gap:8 },
  ipkStat:      {},
  ipkStatVal:   { fontSize:18, fontWeight:'800', color:C.white },
  ipkStatLbl:   { fontSize:9, color:'rgba(255,255,255,0.6)', fontWeight:'600' },

  semGroup:   { marginHorizontal:16, marginBottom:14 },
  semHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', marginBottom:8 },
  semTitle:   { fontSize:14, fontWeight:'700', color:C.text },
  semMeta:    { fontSize:10, color:C.textMuted, marginTop:1 },
  ipsChip:    { alignItems:'center', backgroundColor:C.surface, borderRadius:R.sm, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:C.border },
  ipsVal:     { fontSize:16, fontWeight:'900', color:C.primary },
  ipsLbl:     { fontSize:8, color:C.textMuted, fontWeight:'600' },

  table:      { backgroundColor:C.surface, borderRadius:R.lg, borderWidth:1, borderColor:C.borderLight, overflow:'hidden', ...SH.xs },
  row:        { flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:12, gap:10 },
  codeBox:    { backgroundColor:C.primaryFaint, borderRadius:R.xs, paddingHorizontal:7, paddingVertical:3, alignSelf:'flex-start' },
  code:       { fontSize:9, fontWeight:'800', color:C.primary, letterSpacing:0.3 },
  mkName:     { fontSize:12, fontWeight:'600', color:C.text, marginBottom:2 },
  mkMeta:     { fontSize:10, color:C.textMuted },
  badge:      { width:36, height:36, borderRadius:R.sm, alignItems:'center', justifyContent:'center' },
  badgeTxt:   { fontSize:13, fontWeight:'800' },

  adminHint:  { fontSize:12, color:C.textMuted, marginBottom:12 },
  courseCard: { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.surface, borderRadius:R.md, padding:14, marginBottom:6, borderWidth:1, borderColor:C.borderLight, ...SH.xs },
  editBtn:    { width:30, height:30, borderRadius:R.sm, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:C.primaryPale },

});