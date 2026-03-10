import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

const GW: Record<string,number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };
const init = (n: string) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const regs  = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const grades = useQuery(api.grades.listByUser,       user ? { userId: user._id as any } : 'skip');
  const ospek  = useQuery(api.ospekKkn.listByUser,     user ? { userId: user._id as any } : 'skip');
  const evals  = useQuery(api.teacherEvalutions.listByUser, user ? { userId: user._id as any } : 'skip');

  if (!regs || !grades || !ospek || !evals) return <LoadingScreen />;

  const active    = regs.filter(r => r.status === 'registered');
  const dropped   = regs.filter(r => r.status === 'dropped');
  const totalSKS  = active.reduce((s, r) => s + (r.course?.credits ?? 0), 0);
  const histSKS   = grades.reduce((s, g) => s + (g.course?.credits ?? 0), 0);
  const ospekDone = ospek.filter(o => o.status === 'completed').length;

  let ipk = 0;
  if (grades.length) {
    const wb = grades.reduce((s,g) => s+(GW[g.grade]??0)*(g.course?.credits??0), 0);
    const ws = grades.reduce((s,g) => s+(g.course?.credits??0), 0);
    if (ws > 0) ipk = wb / ws;
  }

  const handleLogout = () =>
    Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
      <PageHeader title="Profil" showBack={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar */}
        <View style={s.avatarCard}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{init(user?.name ?? 'U')}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name}</Text>
            {user?.nim && <Text style={s.nimTxt}>{user.nim}</Text>}
            <View style={s.roleBadge}><Text style={s.roleTxt}>{user?.role === 'admin' ? 'Administrator' : 'Mahasiswa'}</Text></View>
          </View>
          <TouchableOpacity style={s.logoutIconBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={16} color={C.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {user?.role === 'student' && (
          <View style={s.statsRow}>
            {[
              { v: active.length,                   l: 'MK Aktif'  },
              { v: totalSKS,                         l: 'SKS Aktif' },
              { v: grades.length,                    l: 'MK Selesai'},
              { v: ipk > 0 ? ipk.toFixed(2) : '–',  l: 'IPK'       },
            ].map((st, i) => (
              <View key={i} style={s.statBox}>
                <Text style={s.statVal}>{st.v}</Text>
                <Text style={s.statLbl}>{st.l}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Account Info */}
        <SLbl title="INFORMASI AKUN" />
        <View style={s.card}>
          {[
            { icon:'person-outline' as const,    lbl:'Nama Lengkap',     val: user?.name ?? '—' },
            { icon:'at-outline' as const,         lbl:'Username',         val: user?.username ?? '—' },
            { icon:'card-outline' as const,       lbl:'NIM',              val: user?.nim ?? '—' },
            { icon:'book-outline' as const,       lbl:'Program Studi',    val: user?.prodi ?? '—' },
            { icon:'calendar-outline' as const,   lbl:'Angkatan',         val: user?.angkatan ?? '—' },
            { icon:'time-outline' as const,       lbl:'Masa Aktif s/d',   val: user?.activeUntil ?? '—' },
            { icon:'layers-outline' as const,     lbl:'Maks SKS/Semester',val: `${user?.maxSks ?? 24} SKS` },
          ].map((row, i, arr) => (
            <View key={i} style={[s.infoRow, i < arr.length-1 && s.rowBorder]}>
              <View style={s.infoIcon}><Ionicons name={row.icon} size={13} color={C.textMuted} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.infoLbl}>{row.lbl}</Text>
                <Text style={s.infoVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Activity Status */}
        {user?.role === 'student' && (
          <>
            <SLbl title="STATUS KEGIATAN" />
            <View style={s.card}>
              {(['ospek','kkn','kku'] as const).map((type, i, arr) => {
                const data = ospek.find(o => o.type === type);
                const st   = data?.status ?? 'not_started';
                const stLbl= st==='completed'?'Selesai':st==='in_progress'?'Berlangsung':'Belum';
                return (
                  <View key={i} style={[s.infoRow, i < arr.length-1 && s.rowBorder]}>
                    <View style={s.infoIcon}><Ionicons name="flag-outline" size={13} color={C.textMuted} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLbl}>{type.toUpperCase()}</Text>
                      <Text style={s.infoVal}>{data?.year ?? '—'}{data?.notes ? ` · ${data.notes}` : ''}</Text>
                    </View>
                    <View style={[s.chip, st==='completed' && s.chipDone]}>
                      <Text style={[s.chipTxt, st==='completed' && { color: C.white }]}>{stLbl}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Academic Summary */}
        {user?.role === 'student' && (
          <>
            <SLbl title="RINGKASAN AKADEMIK" />
            <View style={s.card}>
              {[
                { lbl:'MK Aktif',              val:`${active.length} MK · ${totalSKS} SKS` },
                { lbl:'MK Di-drop',            val:`${dropped.length} MK` },
                { lbl:'MK Sudah Dinilai',      val:`${grades.length} MK · ${histSKS} SKS` },
                { lbl:'Evaluasi Diberikan',    val:`${evals.length} evaluasi` },
                { lbl:'Kegiatan Wajib',        val:`${ospekDone}/3 selesai` },
              ].map((row, i, arr) => (
                <View key={i} style={[s.infoRow, i < arr.length-1 && s.rowBorder]}>
                  <Text style={[s.infoLbl, { flex: 1 }]}>{row.lbl}</Text>
                  <Text style={s.infoVal}>{row.val}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Quick links */}
        <SLbl title="MENU CEPAT" />
        <View style={s.card}>
          {[
            { icon:'flag-outline' as const,    lbl:'Ospek, KKN & KKU',  route:'/ospek-kkn' },
            { icon:'receipt-outline' as const,  lbl:'Biaya Semester',    route:'/semester-cost' },
            { icon:'star-outline' as const,    lbl:'Evaluasi Dosen',     route:'/teacher-evaluation' },
          ].map((item, i, arr) => (
            <TouchableOpacity key={i} style={[s.menuRow, i < arr.length-1 && s.rowBorder]} onPress={() => router.push(item.route as any)} activeOpacity={0.7}>
              <View style={s.infoIcon}><Ionicons name={item.icon} size={13} color={C.textMuted} /></View>
              <Text style={s.menuLbl}>{item.lbl}</Text>
              <Ionicons name="chevron-forward" size={13} color={C.g300} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={15} color={C.white} />
          <Text style={s.logoutTxt}>Keluar dari Akun</Text>
        </TouchableOpacity>

        <Text style={s.footer}>SIU v1.0 · Universitas Klabat</Text>
      </ScrollView>
    </View>
  );
}

function SLbl({ title }: { title: string }) {
  return <Text style={sl.t}>{title}</Text>;
}
const sl = StyleSheet.create({ t: { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8, marginTop: 18, marginBottom: 6, paddingHorizontal: 2 } });

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  scroll:       { padding: 18, paddingBottom: 40 },

  avatarCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border, ...SH.xs },
  avatar:       { width: 52, height: 52, borderRadius: R.md, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt:    { fontSize: 18, fontWeight: '800', color: C.white },
  userName:     { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  nimTxt:       { fontSize: 11, color: C.textMuted, marginTop: 1, marginBottom: 4 },
  roleBadge:    { alignSelf: 'flex-start', backgroundColor: C.g100, borderRadius: R.xs, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: C.border },
  roleTxt:      { fontSize: 9, fontWeight: '600', color: C.textMuted },
  logoutIconBtn:{ width: 32, height: 32, borderRadius: R.sm, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },

  statsRow:     { flexDirection: 'row', gap: 6, marginTop: 8 },
  statBox:      { flex: 1, backgroundColor: C.surface, borderRadius: R.md, padding: 11, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statVal:      { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  statLbl:      { fontSize: 8, color: C.textMuted, fontWeight: '600', marginTop: 1, textAlign: 'center' },

  card:         { backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden', ...SH.xs },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: C.border },
  infoIcon:     { width: 26, height: 26, borderRadius: R.sm, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoLbl:      { fontSize: 10, color: C.textMuted, marginBottom: 1 },
  infoVal:      { fontSize: 12, fontWeight: '600', color: C.text },
  chip:         { backgroundColor: C.g100, borderRadius: R.xs, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: C.border },
  chipDone:     { backgroundColor: C.ink, borderColor: C.ink },
  chipTxt:      { fontSize: 9, fontWeight: '600', color: C.textMuted },

  menuRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13 },
  menuLbl:      { flex: 1, fontSize: 12, fontWeight: '600', color: C.text },

  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.ink, borderRadius: R.md, height: 46, marginTop: 16, ...SH.sm },
  logoutTxt:    { color: C.white, fontSize: 13, fontWeight: '700' },
  footer:       { textAlign: 'center', fontSize: 10, color: C.textDisabled, marginTop: 16 },
});