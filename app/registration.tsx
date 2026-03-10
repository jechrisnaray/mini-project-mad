import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import C, { R, SH } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'react-native';

type MenuItem = {
  name:      string;
  icon:      keyof typeof Ionicons.glyphMap;
  route:     string;
  desc:      string;
};

const MENUS: MenuItem[] = [
  { name:'Registrasi MK',  icon:'clipboard-outline',       route:'/registration',       desc:'Daftar mata kuliah baru' },
  { name:'Add / Drop MK',  icon:'swap-horizontal-outline', route:'/add-drop',           desc:'Tambah atau hapus MK' },
  { name:'Drop MK',        icon:'trash-outline',           route:'/drop-subject',       desc:'Batalkan MK aktif' },
  { name:'Lihat Nilai',    icon:'school-outline',          route:'/view-grade',         desc:'Transkrip & IPK' },
  { name:'Jadwal Kuliah',  icon:'calendar-outline',        route:'/view-schedule',      desc:'Jadwal mingguan' },
  { name:'Evaluasi Dosen', icon:'star-outline',            route:'/teacher-evaluation', desc:'Beri penilaian dosen' },
  { name:'Ospek & KKN',    icon:'flag-outline',            route:'/ospek-kkn',          desc:'Status kegiatan wajib' },
  { name:'Biaya Semester', icon:'receipt-outline',         route:'/semester-cost',      desc:'Rincian tagihan' },
];

export default function RegistrationScreen() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Mahasiswa';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDeep} />

      <LinearGradient colors={[C.primaryDeep, C.primaryDark, C.primary]} style={s.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={s.decor} />
        <Text style={s.hLabel}>Layanan Akademik</Text>
        <Text style={s.hName}>Halo, {firstName} 👋</Text>
        <Text style={s.hSub}>Pilih layanan yang kamu butuhkan</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {MENUS.map((m, i) => (
            <TouchableOpacity key={i} style={s.card} onPress={() => router.push(m.route as any)} activeOpacity={0.8}>
              <View style={s.iconBox}>
                <Ionicons name={m.icon} size={22} color={C.primary} />
              </View>
              <Text style={s.name}>{m.name}</Text>
              <Text style={s.desc}>{m.desc}</Text>
              <Ionicons name="chevron-forward" size={12} color={C.textLight} style={s.arrow} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{height:24}} />
      </ScrollView>
    </View>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 10;
const s = StyleSheet.create({
  root:   { flex:1, backgroundColor:C.bg },

  header: { paddingTop:PT, paddingHorizontal:18, paddingBottom:22, overflow:'hidden' },
  decor:  { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.05)', top:-80, right:-50 },
  hLabel: { fontSize:10, fontWeight:'700', color:'rgba(255,255,255,0.55)', letterSpacing:1.2, marginBottom:4 },
  hName:  { fontSize:24, fontWeight:'900', color:C.white, letterSpacing:-0.4 },
  hSub:   { fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:4 },

  scroll: { padding:14 },
  grid:   { flexDirection:'row', flexWrap:'wrap', gap:10 },
  card:   { width:'47%', flexGrow:1, backgroundColor:C.surface, borderRadius:R.xl, padding:16, borderWidth:1, borderColor:C.borderLight, ...SH.xs },
  iconBox:{ width:46, height:46, borderRadius:R.lg, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center', marginBottom:10 },
  name:   { fontSize:13, fontWeight:'800', color:C.text, lineHeight:17, marginBottom:3 },
  desc:   { fontSize:11, color:C.textMuted, lineHeight:16 },
  arrow:  { position:'absolute', bottom:12, right:12 },
});