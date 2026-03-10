/**
 * view-grade.tsx — Nilai Akademik
 * Student: IPK hero + transkrip per semester
 * Admin:   Rekap semua MK → bisa tap untuk input
 */
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingScreen, EmptyState } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import C, { SH, R } from '../constants/Colors';

const GW: Record<string, number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };
const gradeLabel = (v: number) =>
  v>=3.51?'Dengan Pujian':v>=3.01?'Sangat Memuaskan':v>=2.76?'Memuaskan':v>=2.0?'Cukup':'Tidak Memuaskan';
const badgeBg = (g: string) => {
  const w = GW[g]??0;
  if(w>=3.5) return { bg:C.ink, txt:C.white };
  if(w>=3.0) return { bg:C.g800, txt:C.white };
  if(w>=2.0) return { bg:C.g200, txt:C.g800 };
  return { bg:C.g100, txt:C.g500 };
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:40 }}>
      {/* IPK Hero */}
      <View style={s.hero}>
        <View style={{ flex:1 }}>
          <Text style={s.heroLbl}>Indeks Prestasi Kumulatif</Text>
          <Text style={s.heroIpk}>{ipk.toFixed(2)}</Text>
          <Text style={s.heroTag}>{gradeLabel(ipk)}</Text>
        </View>
        <View style={s.heroStats}>
          {[['SKS', totalSKS], ['MK', grades.length], ['Mutu', totalMutu.toFixed(0)]].map(([lbl,val]) => (
            <View key={lbl as string} style={s.heroStat}>
              <Text style={s.heroStatVal}>{val}</Text>
              <Text style={s.heroStatLbl}>{lbl}</Text>
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
                <Text style={s.semMeta}>{data.length} mk · {sSKS} SKS</Text>
              </View>
              <View style={s.ipsChip}>
                <Text style={s.ipsVal}>{ips.toFixed(2)}</Text>
                <Text style={s.ipsLbl}>IPS</Text>
              </View>
            </View>
            <View style={s.table}>
              {data.map((g, i) => {
                const { bg, txt } = badgeBg(g.grade);
                return (
                  <View key={g._id} style={[s.row, i>0&&{borderTopWidth:1,borderTopColor:C.border}]}>
                    <View style={s.codeBox}><Text style={s.code}>{g.course?.code??'–'}</Text></View>
                    <View style={{flex:1}}>
                      <Text style={s.mkName}>{g.course?.name??'Mata Kuliah'}</Text>
                      <Text style={s.mkMeta}>{g.course?.credits??0} SKS · Mutu {((GW[g.grade]??0)*(g.course?.credits??0)).toFixed(0)}</Text>
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:20,paddingBottom:40}}>
      <Text style={s.introTxt}>Tap untuk input / lihat nilai mahasiswa</Text>
      {courses.map(c => (
        <TouchableOpacity key={c._id} style={s.courseCard} onPress={() => router.push('/input-grade' as any)} activeOpacity={0.7}>
          <View style={s.codeBox}><Text style={s.code}>{c.code}</Text></View>
          <View style={{flex:1}}>
            <Text style={s.mkName}>{c.name}</Text>
            <Text style={s.mkMeta}>{c.credits} SKS · {c.lecturer}</Text>
          </View>
          <View style={s.editBtn}><Ionicons name="create-outline" size={14} color={C.textMuted} /></View>
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
  hero:        { margin:20, backgroundColor:C.ink, borderRadius:R.xl, padding:20, flexDirection:'row', ...SH.md },
  heroLbl:     { fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:'600', marginBottom:4 },
  heroIpk:     { fontSize:54, fontWeight:'900', color:C.white, lineHeight:58, letterSpacing:-2 },
  heroTag:     { fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:'600', marginTop:4 },
  heroStats:   { justifyContent:'center', borderLeftWidth:1, borderLeftColor:'rgba(255,255,255,0.2)', paddingLeft:16, gap:0 },
  heroStat:    { paddingVertical:5 },
  heroStatVal: { fontSize:16, fontWeight:'800', color:C.white },
  heroStatLbl: { fontSize:9, color:'rgba(255,255,255,0.55)', fontWeight:'600' },

  semGroup:   { marginHorizontal:20, marginBottom:16 },
  semHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', marginBottom:8 },
  semTitle:   { fontSize:13, fontWeight:'700', color:C.text },
  semMeta:    { fontSize:10, color:C.textMuted, marginTop:1 },
  ipsChip:    { alignItems:'center', backgroundColor:C.surface, borderRadius:R.sm, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:C.border },
  ipsVal:     { fontSize:16, fontWeight:'900', color:C.text },
  ipsLbl:     { fontSize:8, color:C.textMuted, fontWeight:'600' },

  table:      { backgroundColor:C.surface, borderRadius:R.lg, borderWidth:1, borderColor:C.border, overflow:'hidden', ...SH.xs },
  row:        { flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:11, gap:10 },
  codeBox:    { backgroundColor:C.g900, borderRadius:R.xs, paddingHorizontal:6, paddingVertical:3, alignSelf:'flex-start' },
  code:       { fontSize:8, fontWeight:'800', color:C.white, letterSpacing:0.3 },
  mkName:     { fontSize:12, fontWeight:'600', color:C.text, marginBottom:2 },
  mkMeta:     { fontSize:10, color:C.textMuted },
  badge:      { width:34, height:34, borderRadius:R.sm, alignItems:'center', justifyContent:'center' },
  badgeTxt:   { fontSize:13, fontWeight:'800' },

  introTxt:   { fontSize:12, color:C.textMuted, marginBottom:14 },
  courseCard: { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.surface, borderRadius:R.md, padding:14, marginBottom:6, borderWidth:1, borderColor:C.border, ...SH.xs },
  editBtn:    { width:28, height:28, borderRadius:R.sm, backgroundColor:C.g100, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:C.border },
});