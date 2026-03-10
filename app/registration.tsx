import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui';
import C, { R, SH } from '../constants/Colors';

const MENUS = [
  { name: 'Registrasi MK',   icon: 'clipboard-outline',       route: '/registration',       desc: 'Daftar mata kuliah baru' },
  { name: 'Add / Drop MK',   icon: 'swap-horizontal-outline',  route: '/add-drop',           desc: 'Tambah atau hapus MK' },
  { name: 'Drop MK',         icon: 'trash-outline',            route: '/drop-subject',       desc: 'Batalkan MK yang aktif' },
  { name: 'Lihat Nilai',     icon: 'school-outline',           route: '/view-grade',         desc: 'Transkrip & IPK kamu' },
  { name: 'Jadwal Kuliah',   icon: 'calendar-outline',         route: '/view-schedule',      desc: 'Jadwal mingguan' },
  { name: 'Evaluasi Dosen',  icon: 'star-outline',             route: '/teacher-evaluation', desc: 'Beri penilaian dosen' },
  { name: 'Ospek & KKN',     icon: 'flag-outline',             route: '/ospek-kkn',          desc: 'Status kegiatan wajib' },
  { name: 'Biaya Semester',  icon: 'receipt-outline',          route: '/semester-cost',      desc: 'Rincian tagihan' },
] as const;

export default function RegistrationScreen() {
  const { user } = useAuth();

  // Susun 2 kolom
  const pairs: (typeof MENUS[number] | null)[][] = [];
  for (let i = 0; i < MENUS.length; i += 2) {
    pairs.push([MENUS[i], MENUS[i + 1] ?? null]);
  }

  return (
    <View style={s.root}>
      <PageHeader title="Akademik" subtitle={`Halo, ${user?.name?.split(' ')[0]} 👋`} showBack={false} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {pairs.map((pair, pi) => (
          <View key={pi} style={s.row}>
            {pair.map((m, ci) =>
              m ? (
                <TouchableOpacity key={ci} style={s.card} onPress={() => router.push(m.route as any)} activeOpacity={0.75}>
                  <View style={s.iconBox}>
                    <Ionicons name={m.icon as any} size={22} color={C.text} />
                  </View>
                  <Text style={s.name}>{m.name}</Text>
                  <Text style={s.desc}>{m.desc}</Text>
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
  root:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16, gap: 10 },
  row:       { flexDirection: 'row', gap: 10 },
  card:      { flex: 1, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border, gap: 8, ...SH.xs },
  cardEmpty: { flex: 1 },
  iconBox:   { width: 44, height: 44, borderRadius: R.md, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },
  name:      { fontSize: 13, fontWeight: '700', color: C.text },
  desc:      { fontSize: 11, color: C.textMuted, lineHeight: 16 },
});