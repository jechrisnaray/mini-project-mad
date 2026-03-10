import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import C, { R, SH } from '../constants/Colors';

type MenuItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  desc: string;
  color: string;
  iconColor: string;
  badge?: string;
};

const MENUS: MenuItem[] = [
  { name:'Registrasi MK',  icon:'clipboard-outline',       route:'/registration',       desc:'Daftar mata kuliah baru', color:C.primaryFaint, iconColor:C.primary },
  { name:'Add / Drop MK',  icon:'swap-horizontal-outline', route:'/add-drop',           desc:'Tambah atau hapus MK',    color:'#EDF5F0',      iconColor:C.primaryMid },
  { name:'Drop MK',        icon:'trash-outline',           route:'/drop-subject',       desc:'Batalkan MK yang aktif',  color:'#FDF0F0',      iconColor:'#C0392B' },
  { name:'Lihat Nilai',    icon:'school-outline',          route:'/view-grade',         desc:'Transkrip & IPK kamu',    color:C.goldLight,    iconColor:C.gold },
  { name:'Jadwal Kuliah',  icon:'calendar-outline',        route:'/view-schedule',      desc:'Jadwal mingguan',         color:C.primaryFaint, iconColor:C.primary },
  { name:'Evaluasi Dosen', icon:'star-outline',            route:'/teacher-evaluation', desc:'Beri penilaian dosen',    color:C.goldLight,    iconColor:C.gold },
  { name:'Ospek & KKN',   icon:'flag-outline',             route:'/ospek-kkn',          desc:'Status kegiatan wajib',   color:'#EDF5F0',      iconColor:C.primaryMid },
  { name:'Biaya Semester', icon:'receipt-outline',         route:'/semester-cost',      desc:'Rincian tagihan',         color:C.primaryFaint, iconColor:C.primary },
];

export default function RegistrationScreen() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Mahasiswa';

  const pairs: (MenuItem | null)[][] = [];
  for (let i = 0; i < MENUS.length; i += 2) {
    pairs.push([MENUS[i], MENUS[i+1] ?? null]);
  }

  return (
    <View style={s.root}>
      {/* ── Header Banner ── */}
      <View style={s.header}>
        <View style={s.hOrb} />
        <Text style={s.hGreet}>Layanan Akademik</Text>
        <Text style={s.hName}>Halo, {firstName} 👋</Text>
        <Text style={s.hSub}>Pilih layanan yang kamu butuhkan</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {pairs.map((pair, pi) => (
          <View key={pi} style={s.row}>
            {pair.map((m, ci) =>
              m ? (
                <TouchableOpacity key={ci} style={s.card} onPress={() => router.push(m.route as any)} activeOpacity={0.78}>
                  <View style={[s.iconBox, { backgroundColor: m.color }]}>
                    <Ionicons name={m.icon} size={24} color={m.iconColor} />
                  </View>
                  <Text style={s.name}>{m.name}</Text>
                  <Text style={s.desc}>{m.desc}</Text>
                  {/* Arrow hint */}
                  <View style={s.arrowWrap}>
                    <Ionicons name="chevron-forward" size={12} color={C.g300} />
                  </View>
                </TouchableOpacity>
              ) : (
                <View key={ci} style={s.cardEmpty} />
              )
            )}
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex:1, backgroundColor:C.bg },

  // Header
  header: {
    backgroundColor:C.primary, overflow:'hidden',
    paddingHorizontal:20, paddingBottom:22,
    paddingTop:(20), // will be overridden by safe area
  },
  hOrb:   { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.06)', top:-80, right:-50 },
  hGreet: { fontSize:10, fontWeight:'700', color:'rgba(255,255,255,0.55)', letterSpacing:1.2, marginBottom:4 },
  hName:  { fontSize:22, fontWeight:'900', color:C.white, letterSpacing:-0.4, marginBottom:4 },
  hSub:   { fontSize:12, color:'rgba(255,255,255,0.6)' },

  // Grid
  scroll: { padding:14, gap:10 },
  row:    { flexDirection:'row', gap:10 },
  card:   {
    flex:1, backgroundColor:C.surface, borderRadius:R.xl,
    padding:16, borderWidth:1, borderColor:C.border,
    gap:8, overflow:'hidden', ...SH.sm,
  },
  cardEmpty:{ flex:1 },
  iconBox:  { width:48, height:48, borderRadius:R.lg, alignItems:'center', justifyContent:'center' },
  name:     { fontSize:13, fontWeight:'800', color:C.text, lineHeight:18 },
  desc:     { fontSize:11, color:C.textMuted, lineHeight:16 },
  arrowWrap:{ position:'absolute', bottom:12, right:14 },
});