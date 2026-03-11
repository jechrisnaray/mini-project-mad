import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../convex/_generated/api';
import C, { SH, R } from '../constants/Colors';

const GW: Record<string, number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };
const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

const greet = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

const MENUS = [
  { name:'Registrasi MK', icon:'clipboard-outline',       route:'/registration',       roles:['student'] },
  { name:'Add / Drop',    icon:'swap-horizontal-outline', route:'/add-drop',           roles:['student'] },
  { name:'Drop MK',       icon:'trash-outline',           route:'/drop-subject',       roles:['student'] },
  { name:'Nilai',         icon:'school-outline',          route:'/view-grade',         roles:['student','admin'] },
  { name:'Jadwal',        icon:'calendar-outline',        route:'/view-schedule',      roles:['student'] },
  { name:'Eval. Dosen',   icon:'star-outline',            route:'/teacher-evaluation', roles:['student'] },
  { name:'Ospek & KKN',   icon:'flag-outline',            route:'/ospek-kkn',          roles:['student'] },
  { name:'Biaya Smt',     icon:'receipt-outline',         route:'/semester-cost',      roles:['student'] },
  { name:'Input Nilai',   icon:'create-outline',          route:'/input-grade',        roles:['admin'] },
  // ✅ Menu baru untuk admin: lihat semua evaluasi dosen
  { name:'Evaluasi Dosen', icon:'star-outline',           route:'/teacher-evaluations-admin', roles:['admin'] },
] as const;

export default function DashboardScreen() {
  const { user, isLoading } = useAuth();

  const regs   = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip') ?? [];
  const grades = useQuery(api.grades.listByUser,        user ? { userId: user._id as any } : 'skip') ?? [];
  const scheds = useQuery(api.scheadules.listByUser,    user ? { userId: user._id as any } : 'skip') ?? [];
  const anns   = useQuery(api.announcements.list) ?? [];

  useEffect(() => { if (!isLoading && !user) router.replace('/login'); }, [user, isLoading]);
  if (isLoading || !user) return null;

  const active    = regs.filter((r: any) => r.status === 'registered');
  const totalSKS  = active.reduce((s: number, r: any) => s + (r.course?.credits ?? 0), 0);
  const maxSks    = (user as any)?.maxSks ?? 24;

  let ipk = 0;
  if ((grades as any[]).length) {
    const wb = (grades as any[]).reduce((s, g) => s + (GW[g.grade]??0)*(g.course?.credits??0), 0);
    const ws = (grades as any[]).reduce((s, g) => s + (g.course?.credits??0), 0);
    if (ws > 0) ipk = wb / ws;
  }

  const todayStr   = DAYS[new Date().getDay()];
  const todayScheds = (scheds as any[]).filter(s => s.day === todayStr).sort((a, b) => a.time.localeCompare(b.time));

  const menus = MENUS.filter(m => (m.roles as readonly string[]).includes((user as any).role));

  const stats = [
    { val:active.length,            lbl:'MK Aktif',   icon:'layers-outline' },
    { val:`${totalSKS}/${maxSks}`,  lbl:'SKS',        icon:'library-outline' },
    { val:ipk>0?ipk.toFixed(2):'–', lbl:'IPK',        icon:'trophy-outline' },
    { val:todayScheds.length,       lbl:'Hari Ini',   icon:'today-outline' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDeep} />

      {/* ── Hero Header ── */}
      <LinearGradient colors={[C.primaryDeep, C.primaryDark, C.primary]} style={s.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={s.decorA} />
        <View style={s.decorB} />

        <View style={s.hrow}>
          <View style={{flex:1}}>
            <Text style={s.greetTxt}>{greet()},</Text>
            <Text style={s.nameTxt}>{user.name.split(' ')[0]} 👋</Text>
            {(user as any).role === 'student' && (
              <Text style={s.subTxt}>Masa aktif s/d {(user as any).activeUntil ?? '—'}</Text>
            )}
          </View>
          <TouchableOpacity style={s.avatarBtn} onPress={() => router.push('/profile' as any)}>
            <Text style={s.avatarTxt}>{initials(user.name)}</Text>
          </TouchableOpacity>
        </View>

        {(user as any).role === 'student' && (
          <View style={s.statsRow}>
            {stats.map((st, i) => (
              <View key={i} style={s.statCard}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>

        {/* Announcements */}
        {(anns as any[]).length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Pengumuman</Text>
            {(anns as any[]).map((a: any) => (
              <View key={a._id} style={s.annCard}>
                <View style={s.annIcon}>
                  <Ionicons name="megaphone-outline" size={16} color={C.primary} />
                </View>
                <View style={{flex:1}}>
                  <Text style={s.annTitle}>{a.title}</Text>
                  <Text style={s.annMsg}>{a.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Today's Schedule */}
        {(user as any).role === 'student' && (
          <View style={s.section}>
            <View style={s.secRow}>
              <Text style={s.secTitle}>Jadwal {todayStr}</Text>
              <TouchableOpacity onPress={() => router.push('/view-schedule' as any)}>
                <Text style={s.seeAll}>Lihat semua →</Text>
              </TouchableOpacity>
            </View>

            {todayScheds.length === 0 ? (
              <View style={s.emptyCard}>
                <Ionicons name="calendar-clear-outline" size={22} color={C.textLight} />
                <Text style={s.emptyTxt}>Tidak ada kelas hari ini</Text>
              </View>
            ) : todayScheds.map((sc: any) => (
              <View key={sc._id} style={s.schedCard}>
                <View style={s.schedTime}>
                  <Text style={s.schedStart}>{sc.time?.split('-')[0]?.trim() ?? '--'}</Text>
                  <Text style={s.schedEnd}>{sc.time?.split('-')[1]?.trim() ?? '--'}</Text>
                </View>
                <View style={s.schedDivider} />
                <View style={{flex:1}}>
                  <View style={{flexDirection:'row', alignItems:'center', gap:6, marginBottom:3}}>
                    <View style={s.codeTag}><Text style={s.codeTxt}>{sc.course?.code ?? '—'}</Text></View>
                    <Text style={s.sks}>{sc.course?.credits ?? 0} SKS</Text>
                  </View>
                  <Text style={s.courseName} numberOfLines={1}>{sc.course?.name ?? '—'}</Text>
                  <Text style={s.courseMeta}>{sc.room ?? '—'} · {sc.course?.lecturer ?? '—'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Access Grid */}
        <View style={s.section}>
          <Text style={s.secTitle}>Layanan Akademik</Text>
          <View style={s.grid}>
            {menus.map((m, i) => (
              <TouchableOpacity key={i} style={s.menuCard} onPress={() => router.push(m.route as any)} activeOpacity={0.82}>
                <View style={s.menuIcon}>
                  <Ionicons name={m.icon as any} size={22} color={C.primary} />
                </View>
                <Text style={s.menuLbl}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{height:24}} />
      </ScrollView>
    </View>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 10;
const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:C.bg },

  hero:    { paddingTop:PT, paddingBottom:18, paddingHorizontal:18, overflow:'hidden' },
  decorA:  { position:'absolute', top:-70, right:-50, width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.05)' },
  decorB:  { position:'absolute', bottom:-40, left:-30, width:140, height:140, borderRadius:70, backgroundColor:'rgba(255,255,255,0.04)' },

  hrow:      { flexDirection:'row', alignItems:'center', marginBottom:16 },
  greetTxt:  { fontSize:12, color:'rgba(255,255,255,0.65)' },
  nameTxt:   { fontSize:24, fontWeight:'800', color:'#FFF', letterSpacing:-0.4 },
  subTxt:    { fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 },
  avatarBtn: { width:48, height:48, borderRadius:16, backgroundColor:'rgba(255,255,255,0.16)', borderWidth:1, borderColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' },
  avatarTxt: { fontSize:16, fontWeight:'800', color:'#FFF' },

  statsRow: { flexDirection:'row', gap:8 },
  statCard: { flex:1, backgroundColor:'rgba(255,255,255,0.14)', borderRadius:14, paddingVertical:10, alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  statVal:  { fontSize:18, fontWeight:'800', color:'#FFF' },
  statLbl:  { fontSize:9, color:'rgba(255,255,255,0.6)', fontWeight:'600', marginTop:2 },

  body:    { paddingBottom:28 },
  section: { paddingHorizontal:16, paddingTop:20 },

  secRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  secTitle:  { fontSize:15, fontWeight:'800', color:C.text, marginBottom:10 },
  seeAll:    { fontSize:11, fontWeight:'700', color:C.primary },

  annCard:  { flexDirection:'row', gap:12, backgroundColor:C.surface, borderRadius:14, padding:13, marginBottom:8, borderWidth:1, borderColor:C.borderLight, ...SH.xs },
  annIcon:  { width:36, height:36, borderRadius:12, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center', flexShrink:0 },
  annTitle: { fontSize:13, fontWeight:'700', color:C.text, marginBottom:3 },
  annMsg:   { fontSize:12, color:C.textMuted, lineHeight:18 },

  emptyCard: { backgroundColor:C.surface, borderRadius:14, padding:20, borderWidth:1, borderColor:C.borderLight, flexDirection:'row', alignItems:'center', gap:10 },
  emptyTxt:  { fontSize:13, color:C.textMuted },

  schedCard:    { flexDirection:'row', alignItems:'center', backgroundColor:C.surface, borderRadius:14, padding:12, marginBottom:8, borderWidth:1, borderColor:C.borderLight, gap:12, ...SH.xs },
  schedTime:    { alignItems:'center', width:46 },
  schedStart:   { fontSize:12, fontWeight:'800', color:C.text },
  schedEnd:     { fontSize:10, color:C.textMuted, marginTop:2 },
  schedDivider: { width:1, height:'80%', backgroundColor:C.borderLight },
  codeTag:      { backgroundColor:C.primaryFaint, borderRadius:6, paddingHorizontal:6, paddingVertical:2 },
  codeTxt:      { fontSize:8, fontWeight:'800', color:C.primary },
  sks:          { fontSize:10, color:C.textMuted },
  courseName:   { fontSize:12, fontWeight:'700', color:C.text, marginBottom:2 },
  courseMeta:   { fontSize:10, color:C.textMuted },

  grid:     { flexDirection:'row', flexWrap:'wrap', gap:8 },
  menuCard: { width:'22%', backgroundColor:C.surface, borderRadius:14, paddingVertical:14, alignItems:'center', gap:7, borderWidth:1, borderColor:C.borderLight, ...SH.xs, flexGrow:1 },
  menuIcon: { width:44, height:44, borderRadius:14, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center' },
  menuLbl:  { fontSize:10, fontWeight:'700', color:C.text, textAlign:'center', lineHeight:14 },
});