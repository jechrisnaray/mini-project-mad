import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoadingScreen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../convex/_generated/api';
import C, { SH, R } from '../constants/Colors';

const GW: Record<string,number> = { A:4,'A-':3.7,'B+':3.3,B:3,'B-':2.7,'C+':2.3,C:2,D:1,E:0 };
const init = (n: string) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const regs   = useQuery(api.registrations.listByUser, user ? { userId:user._id as any } : 'skip');
  const grades = useQuery(api.grades.listByUser,        user ? { userId:user._id as any } : 'skip');
  const ospek  = useQuery(api.ospekKkn.listByUser,      user ? { userId:user._id as any } : 'skip');
  const evals  = useQuery(api.teacherEvalutions.listByUser, user ? { userId:user._id as any } : 'skip');

  if (!regs || !grades || !ospek || !evals) return <LoadingScreen />;

  const active     = regs.filter(r => r.status === 'registered');
  const dropped    = regs.filter(r => r.status === 'dropped');
  const totalSKS   = active.reduce((s,r) => s+(r.course?.credits??0), 0);
  const histSKS    = grades.reduce((s,g) => s+(g.course?.credits??0), 0);
  const ospekDone  = ospek.filter(o => o.status === 'completed').length;

  let ipk = 0;
  if (grades.length) {
    const wb = grades.reduce((s,g) => s+(GW[g.grade]??0)*(g.course?.credits??0), 0);
    const ws = grades.reduce((s,g) => s+(g.course?.credits??0), 0);
    if (ws > 0) ipk = wb/ws;
  }

  const handleLogout = () => Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
    { text:'Batal', style:'cancel' },
    { text:'Keluar', style:'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
  ]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDeep} />

      <LinearGradient colors={[C.primaryDeep, C.primaryDark, C.primary]} style={s.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={s.decor} />
        <View style={s.heroRow}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{init(user?.name ?? 'U')}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={s.heroName}>{user?.name}</Text>
            {user?.nim ? <Text style={s.heroNim}>{user.nim}</Text> : null}
            <View style={s.roleBadge}>
              <Text style={s.roleTxt}>{user?.role === 'admin' ? 'Administrator' : 'Mahasiswa'}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.logoutIcon} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {user?.role === 'student' && (
          <View style={s.statsRow}>
            {[
              { v:active.length,                          l:'MK Aktif' },
              { v:totalSKS,                               l:'SKS' },
              { v:grades.length,                          l:'MK Selesai' },
              { v:ipk>0 ? ipk.toFixed(2) : '–',          l:'IPK' },
            ].map((st,i) => (
              <View key={i} style={s.statCard}>
                <Text style={s.statVal}>{st.v}</Text>
                <Text style={s.statLbl}>{st.l}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Info Akun */}
        <Section title="Informasi Akun" />
        <View style={s.card}>
          {[
            { icon:'person-outline'   as const, lbl:'Nama Lengkap',      val:user?.name ?? '—' },
            { icon:'at-outline'       as const, lbl:'Username',           val:user?.username ?? '—' },
            { icon:'card-outline'     as const, lbl:'NIM',                val:user?.nim ?? '—' },
            { icon:'book-outline'     as const, lbl:'Program Studi',      val:user?.prodi ?? '—' },
            { icon:'calendar-outline' as const, lbl:'Angkatan',           val:user?.angkatan ?? '—' },
            { icon:'time-outline'     as const, lbl:'Masa Aktif s/d',     val:user?.activeUntil ?? '—' },
            { icon:'layers-outline'   as const, lbl:'Maks SKS/Semester',  val:`${user?.maxSks ?? 24} SKS` },
          ].map((row, i, arr) => (
            <View key={i} style={[s.infoRow, i < arr.length-1 && s.rowBorder]}>
              <View style={s.infoIcon}><Ionicons name={row.icon} size={14} color={C.primary} /></View>
              <View style={{flex:1}}>
                <Text style={s.infoLbl}>{row.lbl}</Text>
                <Text style={s.infoVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {user?.role === 'student' && (
          <>
            <Section title="Status Kegiatan" />
            <View style={s.card}>
              {(['ospek','kkn','kku'] as const).map((type, i, arr) => {
                const data = ospek.find(o => o.type === type);
                const st   = data?.status ?? 'not_started';
                const stLbl = st==='completed'?'Selesai':st==='in_progress'?'Berlangsung':'Belum';
                const stColor = st==='completed'?C.primary:st==='in_progress'?C.gold:C.textLight;
                return (
                  <View key={i} style={[s.infoRow, i < arr.length-1 && s.rowBorder]}>
                    <View style={s.infoIcon}><Ionicons name="flag-outline" size={14} color={C.primary} /></View>
                    <View style={{flex:1}}>
                      <Text style={s.infoLbl}>{type.toUpperCase()}</Text>
                      <Text style={s.infoVal}>{data?.year ?? '—'}{data?.notes ? ` · ${data.notes}` : ''}</Text>
                    </View>
                    <View style={[s.chip, {backgroundColor:st==='completed'?C.primaryFaint:st==='in_progress'?C.goldFaint:C.g100}]}>
                      <Text style={[s.chipTxt, {color:stColor}]}>{stLbl}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Section title="Ringkasan Akademik" />
            <View style={s.card}>
              {[
                { lbl:'MK Aktif',             val:`${active.length} MK · ${totalSKS} SKS` },
                { lbl:'MK Di-drop',           val:`${dropped.length} MK` },
                { lbl:'MK Sudah Dinilai',     val:`${grades.length} MK · ${histSKS} SKS` },
                { lbl:'Evaluasi Diberikan',   val:`${evals.length} evaluasi` },
                { lbl:'Kegiatan Wajib',       val:`${ospekDone}/3 selesai` },
              ].map((row, i, arr) => (
                <View key={i} style={[s.infoRow, i < arr.length-1 && s.rowBorder]}>
                  <Text style={[s.infoLbl, {flex:1}]}>{row.lbl}</Text>
                  <Text style={s.infoVal}>{row.val}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Section title="Menu Cepat" />
        <View style={s.card}>
          {[
            { icon:'flag-outline'    as const, lbl:'Ospek, KKN & KKU',  route:'/ospek-kkn' },
            { icon:'receipt-outline' as const, lbl:'Biaya Semester',     route:'/semester-cost' },
            { icon:'star-outline'    as const, lbl:'Evaluasi Dosen',     route:'/teacher-evaluation' },
          ].map((item, i, arr) => (
            <TouchableOpacity key={i} style={[s.menuRow, i < arr.length-1 && s.rowBorder]} onPress={() => router.push(item.route as any)} activeOpacity={0.75}>
              <View style={s.infoIcon}><Ionicons name={item.icon} size={14} color={C.primary} /></View>
              <Text style={s.menuLbl}>{item.lbl}</Text>
              <Ionicons name="chevron-forward" size={14} color={C.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={16} color={C.danger} />
          <Text style={s.logoutTxt}>Keluar dari Akun</Text>
        </TouchableOpacity>

        <Text style={s.footer}>SIA v1.0 · Universitas Klabat</Text>
      </ScrollView>
    </View>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={sl.t}>{title}</Text>;
}
const sl = StyleSheet.create({ t:{ fontSize:11, fontWeight:'700', color:C.textMuted, letterSpacing:0.3, marginTop:18, marginBottom:8 } });

const PT = (StatusBar.currentHeight ?? 44) + 10;
const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:C.bg },
  hero:    { paddingTop:PT, paddingHorizontal:18, paddingBottom:18, overflow:'hidden' },
  decor:   { position:'absolute', top:-60, right:-40, width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,255,255,0.05)' },

  heroRow:    { flexDirection:'row', alignItems:'center', gap:14, marginBottom:16 },
  avatar:     { width:56, height:56, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:'rgba(255,255,255,0.25)' },
  avatarTxt:  { fontSize:18, fontWeight:'800', color:'#FFF' },
  heroName:   { fontSize:17, fontWeight:'800', color:'#FFF', letterSpacing:-0.3 },
  heroNim:    { fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:2 },
  roleBadge:  { alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.18)', borderRadius:R.full, paddingHorizontal:8, paddingVertical:3, marginTop:5 },
  roleTxt:    { fontSize:9, fontWeight:'700', color:'#FFF' },
  logoutIcon: { width:36, height:36, borderRadius:R.full, backgroundColor:'rgba(255,255,255,0.12)', alignItems:'center', justifyContent:'center' },

  statsRow: { flexDirection:'row', gap:8 },
  statCard: { flex:1, backgroundColor:'rgba(255,255,255,0.14)', borderRadius:12, paddingVertical:10, alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  statVal:  { fontSize:18, fontWeight:'800', color:'#FFF' },
  statLbl:  { fontSize:9, color:'rgba(255,255,255,0.6)', marginTop:2 },

  scroll:  { padding:16, paddingBottom:40 },
  card:    { backgroundColor:C.surface, borderRadius:16, borderWidth:1, borderColor:C.borderLight, overflow:'hidden', ...SH.xs },

  infoRow:  { flexDirection:'row', alignItems:'center', gap:12, padding:13 },
  rowBorder:{ borderBottomWidth:1, borderBottomColor:C.borderLight },
  infoIcon: { width:30, height:30, borderRadius:10, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center' },
  infoLbl:  { fontSize:10, color:C.textMuted, marginBottom:2 },
  infoVal:  { fontSize:13, fontWeight:'700', color:C.text },
  chip:     { borderRadius:R.full, paddingHorizontal:9, paddingVertical:4 },
  chipTxt:  { fontSize:10, fontWeight:'700' },

  menuRow: { flexDirection:'row', alignItems:'center', gap:12, padding:13 },
  menuLbl: { flex:1, fontSize:13, fontWeight:'700', color:C.text },

  logoutBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:C.dangerLight, borderRadius:14, paddingVertical:14, marginTop:18, borderWidth:1, borderColor:'#F5C5C0' },
  logoutTxt: { fontSize:14, fontWeight:'700', color:C.danger },

  footer: { textAlign:'center', fontSize:11, color:C.textLight, marginTop:16 },
});