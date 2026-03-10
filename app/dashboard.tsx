import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/ui';
import C, { R, SH } from '../constants/Colors';

// Bobot nilai untuk kalkulasi IPK
const GW: Record<string, number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };

// Menu layanan akademik
const MENUS = [
  { name:'Registrasi',  icon:'clipboard-outline',      route:'/registration',       roles:['student'] },
  { name:'Add/Drop',    icon:'swap-horizontal-outline', route:'/add-drop',           roles:['student'] },
  { name:'Drop MK',     icon:'trash-outline',           route:'/drop-subject',       roles:['student'] },
  { name:'Nilai',       icon:'school-outline',          route:'/view-grade',         roles:['student','admin'] },
  { name:'Jadwal',      icon:'calendar-outline',        route:'/view-schedule',      roles:['student'] },
  { name:'Eval. Dosen', icon:'star-outline',            route:'/teacher-evaluation', roles:['student'] },
  { name:'Ospek/KKN',  icon:'flag-outline',             route:'/ospek-kkn',          roles:['student'] },
  { name:'Biaya SMT',  icon:'receipt-outline',          route:'/semester-cost',      roles:['student'] },
  { name:'Input Nilai', icon:'create-outline',          route:'/input-grade',        roles:['admin'] },
] as const;

const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const greet = () => {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
};
const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function DashboardScreen() {
  const { user, isLoading } = useAuth();

  const regs   = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const grades = useQuery(api.grades.listByUser,         user ? { userId: user._id as any } : 'skip');
  const scheds = useQuery(api.scheadules.listByUser,     user ? { userId: user._id as any } : 'skip');
  const anns   = useQuery(api.announcements.list);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading]);

  if (isLoading || !user) return null;
  if (!regs || !grades || !scheds) return <LoadingScreen />;

  // Kalkulasi statistik mahasiswa
  const active   = regs.filter(r => r.status === 'registered');
  const totalSKS = active.reduce((s, r) => s + (r.course?.credits ?? 0), 0);
  const maxSks   = user.maxSks ?? 24;

  let ipk = 0;
  if (grades.length) {
    const wb = grades.reduce((s, g) => s + (GW[g.grade] ?? 0) * (g.course?.credits ?? 0), 0);
    const ws = grades.reduce((s, g) => s + (g.course?.credits ?? 0), 0);
    if (ws > 0) ipk = wb / ws;
  }

  const todayStr    = DAYS[new Date().getDay()];
  const todayScheds = scheds.filter(s => s.day === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const menus       = MENUS.filter(m => (m.roles as readonly string[]).includes(user.role));

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.hrow}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greet()},</Text>
            <Text style={s.name}>{user.name.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity style={s.avatarBtn} onPress={() => router.push('/profile' as any)}>
            <Text style={s.avatarTxt}>{initials(user.name)}</Text>
          </TouchableOpacity>
        </View>

        {/* Statistik SKS/MK/IPK (khusus mahasiswa) */}
        {user.role === 'student' && (
          <View style={s.statsRow}>
            {[
              { val: active.length,                         lbl: 'MK Aktif' },
              { val: `${totalSKS}/${maxSks}`,               lbl: 'SKS' },
              { val: ipk > 0 ? ipk.toFixed(2) : '–',       lbl: 'IPK' },
              { val: todayScheds.length,                    lbl: 'Hari Ini' },
            ].map((st, i) => (
              <View key={i} style={s.statCard}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Banner masa aktif */}
        {user.role === 'student' && (
          <View style={s.banner}>
            <Ionicons name="time-outline" size={15} color={C.textMuted} />
            <Text style={s.bannerTxt}>Masa studi aktif hingga <Text style={{ fontWeight: '700', color: C.text }}>{user.activeUntil ?? '—'}</Text></Text>
          </View>
        )}

        {/* Pengumuman */}
        {anns && anns.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Pengumuman</Text>
            {anns.map(a => (
              <View key={a._id} style={s.annCard}>
                <Ionicons name="megaphone-outline" size={16} color={C.textSub} style={s.annIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.annTitle}>{a.title}</Text>
                  <Text style={s.annMsg}>{a.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Jadwal hari ini */}
        {user.role === 'student' && (
          <View style={s.section}>
            <View style={s.secRow}>
              <Text style={s.secTitle}>Jadwal {todayStr}</Text>
              <TouchableOpacity onPress={() => router.push('/view-schedule' as any)}>
                <Text style={s.seeAll}>Semua →</Text>
              </TouchableOpacity>
            </View>
            {todayScheds.length === 0 ? (
              <View style={s.emptyCard}><Text style={s.emptyTxt}>Tidak ada jadwal hari ini</Text></View>
            ) : (
              todayScheds.map(sc => (
                <View key={sc._id} style={s.schedCard}>
                  <View style={s.schedTime}>
                    <Text style={s.schedStart}>{sc.time.split('-')[0]}</Text>
                    <Text style={s.schedEnd}>{sc.time.split('-')[1]}</Text>
                  </View>
                  <View style={{ width: 1, height: 30, backgroundColor: C.border }} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.schedName} numberOfLines={1}>{sc.course?.name ?? '—'}</Text>
                    <Text style={s.schedRoom}>{sc.room} · {sc.course?.lecturer}</Text>
                  </View>
                  <View style={s.schedCode}><Text style={s.schedCodeTxt}>{sc.course?.code}</Text></View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Menu layanan */}
        <View style={s.section}>
          <Text style={s.secTitle}>Layanan Akademik</Text>
          <View style={s.grid}>
            {menus.map((m, i) => (
              <TouchableOpacity key={i} style={s.menuCard} onPress={() => router.push(m.route as any)}>
                <View style={s.menuIcon}><Ionicons name={m.icon as any} size={20} color={C.text} /></View>
                <Text style={s.menuLbl}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 8;
const MCOL = '47.5%';

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },
  header:     { backgroundColor: C.surface, paddingTop: PT, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  hrow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  greeting:   { fontSize: 12, color: C.textMuted },
  name:       { fontSize: 22, fontWeight: '700', color: C.text },
  avatarBtn:  { width: 44, height: 44, borderRadius: 13, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:  { fontSize: 14, fontWeight: '800', color: C.white },
  statsRow:   { flexDirection: 'row', gap: 8 },
  statCard:   { flex: 1, backgroundColor: C.g100, borderRadius: 12, padding: 10, alignItems: 'center', gap: 2 },
  statVal:    { fontSize: 18, fontWeight: '800', color: C.text },
  statLbl:    { fontSize: 9, color: C.textMuted, textAlign: 'center' },
  banner:     { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 20, marginBottom: 0, backgroundColor: C.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
  bannerTxt:  { fontSize: 12, color: C.textMuted, flex: 1 },
  section:    { paddingHorizontal: 20, paddingTop: 20 },
  secTitle:   { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  secRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAll:     { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  annCard:    { flexDirection: 'row', gap: 12, backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  annIcon:    { marginTop: 2 },
  annTitle:   { fontSize: 12, fontWeight: '700', color: C.text, marginBottom: 2 },
  annMsg:     { fontSize: 12, color: C.textMuted, lineHeight: 18 },
  schedCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border, gap: 10 },
  schedTime:  { alignItems: 'center', width: 46 },
  schedStart: { fontSize: 12, fontWeight: '700', color: C.text },
  schedEnd:   { fontSize: 10, color: C.textMuted },
  schedName:  { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 2 },
  schedRoom:  { fontSize: 11, color: C.textMuted },
  schedCode:  { backgroundColor: C.ink, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  schedCodeTxt:{ fontSize: 9, fontWeight: '700', color: C.white },
  emptyCard:  { backgroundColor: C.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  emptyTxt:   { fontSize: 13, color: C.textMuted },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuCard:   { width: MCOL, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border, ...SH.xs },
  menuIcon:   { width: 40, height: 40, borderRadius: 10, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },
  menuLbl:    { fontSize: 12, fontWeight: '600', color: C.textSub, textAlign: 'center', lineHeight: 16 },
});