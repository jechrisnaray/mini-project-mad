import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import C from '../constants/Colors';

const { width } = Dimensions.get('window');
const MCOL = (width - 36 - 24) / 4;

type Menu = { name: string; icon: keyof typeof Ionicons.glyphMap; route: string; color: string; roles: string[] };
const MENUS: Menu[] = [
  { name: 'Registrasi',  icon: 'clipboard-outline',      route: '/registration',       color: C.primaryMid,  roles: ['student'] },
  { name: 'Add/Drop',    icon: 'swap-horizontal-outline', route: '/add-drop',           color: '#0F766E',     roles: ['student'] },
  { name: 'Drop MK',     icon: 'trash-outline',           route: '/drop-subject',       color: C.error,       roles: ['student'] },
  { name: 'Nilai',       icon: 'school-outline',          route: '/view-grade',         color: C.accent,      roles: ['student','admin'] },
  { name: 'Jadwal',      icon: 'calendar-outline',        route: '/view-schedule',      color: C.primary,     roles: ['student'] },
  { name: 'Eval. Dosen', icon: 'star-outline',            route: '/teacher-evaluation', color: '#7C3AED',     roles: ['student'] },
  { name: 'Ospek/KKN',  icon: 'people-outline',           route: '/ospek-kkn',          color: '#065F46',     roles: ['student'] },
  { name: 'Biaya SMT',   icon: 'cash-outline',            route: '/semester-cost',      color: '#9D174D',     roles: ['student'] },
  { name: 'Input Nilai', icon: 'create-outline',          route: '/input-grade',        color: C.primary,     roles: ['admin'] },
];

const GW: Record<string, number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };

const ANN_STYLE: Record<string, {bg:string;c:string;icon:keyof typeof Ionicons.glyphMap}> = {
  yellow: { bg: C.warningBg,  c: C.warning, icon: 'warning-outline' },
  blue:   { bg: C.infoBg,     c: C.info,    icon: 'information-circle-outline' },
  red:    { bg: C.errorBg,    c: C.error,   icon: 'alert-circle-outline' },
  green:  { bg: C.successBg,  c: C.success, icon: 'checkmark-circle-outline' },
};

export default function DashboardScreen() {
  const { user, isLoading, logout } = useAuth();

  const regs   = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const grades = useQuery(api.grades.listByUser,         user ? { userId: user._id as any } : 'skip');
  const scheds = useQuery(api.scheadules.listByUser,     user ? { userId: user._id as any } : 'skip');
  const anns   = useQuery(api.announcements.list);
  const seedAnn = useMutation(api.announcements.seed);

  useEffect(() => { seedAnn().catch(() => {}); }, []);
  useEffect(() => { if (!isLoading && !user) router.replace('/login'); }, [user, isLoading]);
  if (isLoading || !user) return null;

  // Stats
  const active   = regs?.filter(r => r.status === 'registered') ?? [];
  const totalSKS = active.reduce((s, r) => s + (r.course?.credits ?? 0), 0);

  let ipk = '—';
  if (grades?.length) {
    const wb = grades.reduce((s, g) => s + (GW[g.grade] ?? 0) * (g.course?.credits ?? 0), 0);
    const ws = grades.reduce((s, g) => s + (g.course?.credits ?? 0), 0);
    if (ws > 0) ipk = (wb / ws).toFixed(2);
  }

  const today = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][new Date().getDay()];
  const todayN = scheds?.filter(s => s.day === today).length ?? 0;

  const menus = MENUS.filter(m => m.roles.includes(user.role));
  const init  = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
    { text: 'Batal', style: 'cancel' },
    { text: 'Keluar', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
  ]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ─────────────────────────────────── */}
      <LinearGradient colors={[C.primary, C.primaryMid]} style={s.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={s.hdecor1} />
        <View style={s.hdecor2} />

        <View style={s.hrow}>
          <View style={s.avatarBox}>
            <Text style={s.avatarTxt}>{init(user.name)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.hWelcome}>Selamat datang 👋</Text>
            <Text style={s.hName}>{user.name}</Text>
            <View style={s.rolePill}>
              <Text style={s.roleTxt}>{user.role === 'admin' ? '⚙ Administrator' : '🎓 Mahasiswa'}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>

        {/* Stats strip (student only) */}
        {user.role === 'student' && (
          <View style={s.statsBox}>
            {[
              { v: active.length, l: 'MK Aktif' },
              { v: totalSKS,      l: 'Total SKS' },
              { v: ipk,           l: 'IPK' },
              { v: todayN,        l: 'Hari Ini' },
            ].map((st, i, arr) => (
              <View key={i} style={s.statItem}>
                <Text style={s.statVal}>{st.v}</Text>
                <Text style={s.statLbl}>{st.l}</Text>
                {i < arr.length - 1 && <View style={s.statDivider} />}
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* ── Pengumuman (dari Convex) ─────────────── */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <View style={s.goldBar} />
            <Text style={s.secTitle}>Pengumuman Kampus</Text>
          </View>
          {!anns
            ? <Text style={s.hint}>Memuat pengumuman...</Text>
            : anns.length === 0
              ? <Text style={s.hint}>Tidak ada pengumuman aktif.</Text>
              : anns.map(a => {
                  const st = ANN_STYLE[a.color] ?? ANN_STYLE.blue;
                  return (
                    <View key={a._id} style={s.annCard}>
                      <View style={[s.annIcon, { backgroundColor: st.bg }]}>
                        <Ionicons name={st.icon} size={16} color={st.c} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.annTitle, { color: st.c }]}>{a.title}</Text>
                        <Text style={s.annMsg}>{a.message}</Text>
                      </View>
                    </View>
                  );
                })}
        </View>

        {/* ── Menu Grid ────────────────────────────── */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <View style={s.goldBar} />
            <Text style={s.secTitle}>Layanan Akademik</Text>
          </View>
          <View style={s.grid}>
            {menus.map((m, i) => (
              <TouchableOpacity key={i} style={s.menuCard} onPress={() => router.push(m.route as any)} activeOpacity={0.75}>
                <View style={[s.menuIcon, { backgroundColor: m.color }]}>
                  <Ionicons name={m.icon} size={22} color={C.accentBright} />
                </View>
                <Text style={s.menuLbl}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.background },
  header:     { paddingTop: (StatusBar.currentHeight ?? 44) + 12, paddingBottom: 22, paddingHorizontal: 18, overflow: 'hidden' },
  hdecor1:    { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(212,160,23,0.10)', top:-70, right:-50 },
  hdecor2:    { position:'absolute', width:90,  height:90,  borderRadius:45,  backgroundColor:'rgba(212,160,23,0.07)', bottom:-30, left:40 },
  hrow:       { flexDirection:'row', alignItems:'center', marginBottom: 16 },
  avatarBox:  { width:48, height:48, borderRadius:15, backgroundColor:C.accentBright, alignItems:'center', justifyContent:'center', shadowColor:C.accent, shadowOffset:{width:0,height:3}, shadowOpacity:0.4, shadowRadius:6, elevation:4 },
  avatarTxt:  { fontSize:17, fontWeight:'900', color:C.primary },
  hWelcome:   { fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:1 },
  hName:      { fontSize:17, fontWeight:'800', color:'#FFF' },
  rolePill:   { marginTop:3, backgroundColor:'rgba(212,160,23,0.18)', borderRadius:20, paddingHorizontal:8, paddingVertical:2, alignSelf:'flex-start', borderWidth:1, borderColor:'rgba(212,160,23,0.3)' },
  roleTxt:    { fontSize:10, color:C.accentLight, fontWeight:'600' },
  logoutBtn:  { width:38, height:38, borderRadius:12, backgroundColor:'rgba(255,255,255,0.12)', alignItems:'center', justifyContent:'center' },
  statsBox:   { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.10)', borderRadius:14, padding:14, borderWidth:1, borderColor:'rgba(255,255,255,0.14)' },
  statItem:   { flex:1, alignItems:'center', position:'relative' },
  statVal:    { fontSize:19, fontWeight:'900', color:'#FFF' },
  statLbl:    { fontSize:10, color:'rgba(255,255,255,0.58)', marginTop:2 },
  statDivider:{ position:'absolute', right:0, top:4, width:1, height:28, backgroundColor:'rgba(255,255,255,0.18)' },
  body:       { flex:1 },
  section:    { paddingHorizontal:18, paddingTop:20 },
  secHeader:  { flexDirection:'row', alignItems:'center', gap:8, marginBottom:12 },
  goldBar:    { width:3, height:18, borderRadius:2, backgroundColor:C.accentBright },
  secTitle:   { fontSize:14, fontWeight:'800', color:C.text },
  hint:       { fontSize:13, color:C.textMuted, fontStyle:'italic' },
  annCard:    { backgroundColor:C.surface, borderRadius:14, padding:14, flexDirection:'row', gap:12, alignItems:'flex-start', marginBottom:8, borderWidth:1, borderColor:C.borderLight, shadowColor:C.primary, shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:6, elevation:2 },
  annIcon:    { width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center', flexShrink:0 },
  annTitle:   { fontSize:12, fontWeight:'700', marginBottom:2 },
  annMsg:     { fontSize:12, color:C.textSub, lineHeight:18 },
  grid:       { flexDirection:'row', flexWrap:'wrap', gap:10 },
  menuCard:   { width:MCOL, backgroundColor:C.surface, borderRadius:14, padding:11, alignItems:'center', borderWidth:1, borderColor:C.borderLight, shadowColor:C.primary, shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:3 },
  menuIcon:   { width:46, height:46, borderRadius:13, alignItems:'center', justifyContent:'center', marginBottom:7 },
  menuLbl:    { fontSize:10, fontWeight:'600', color:C.textSub, textAlign:'center', lineHeight:13 },
});