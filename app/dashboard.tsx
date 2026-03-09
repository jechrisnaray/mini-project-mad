import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Dimensions, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 40 - 32) / 4;

type MenuItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  roles: string[];
};

const menus: MenuItem[] = [
  { name: 'Registrasi MK', icon: 'clipboard-outline',      route: '/registration',       color: '#1E3A72', roles: ['student'] },
  { name: 'Add / Drop',    icon: 'swap-horizontal-outline', route: '/add-drop',           color: '#1A5C42', roles: ['student'] },
  { name: 'Drop Subject',  icon: 'trash-outline',           route: '/drop-subject',       color: '#7A1C2C', roles: ['student'] },
  { name: 'Lihat Nilai',   icon: 'school-outline',          route: '/view-grade',         color: '#5C3A0A', roles: ['student', 'admin'] },
  { name: 'Jadwal',        icon: 'calendar-outline',        route: '/view-schedule',      color: '#1A3A6C', roles: ['student'] },
  { name: 'Eval. Dosen',   icon: 'star-outline',            route: '/teacher-evaluation', color: '#3A1C7A', roles: ['student'] },
  { name: 'Ospek & KKN',   icon: 'people-outline',          route: '/ospek-kkn',          color: '#1A4A4A', roles: ['student'] },
  { name: 'Biaya',         icon: 'cash-outline',            route: '/semester-cost',      color: '#5C1A3A', roles: ['student'] },
  { name: 'Input Nilai',   icon: 'create-outline',          route: '/input-grade',        color: '#1E3A72', roles: ['admin'] },
];

export default function DashboardScreen() {
  const { user, isLoading, logout } = useAuth();

  const registrations = useQuery(
    api.registrations.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );
  const grades = useQuery(
    api.grades.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );
  const schedules = useQuery(
    api.scheadules.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );
  // ✅ Pengumuman dari Convex — bukan hardcode
  const announcements = useQuery(api.announcements.list);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  const filteredMenus = menus.filter((m) => m.roles.includes(user.role));
  const registeredCount = registrations?.filter((r) => r.status === 'registered').length ?? 0;
  const totalSKS = registrations
    ?.filter((r) => r.status === 'registered')
    .reduce((sum, r) => sum + (r.course?.credits ?? 0), 0) ?? 0;

  let ipk = '—';
  if (grades && grades.length > 0) {
    const gradeMap: Record<string, number> = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0,
      'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'E': 0.0,
    };
    const totalBobot = grades.reduce(
      (sum, g) => sum + (gradeMap[g.grade] ?? 0) * (g.course?.credits ?? 0), 0
    );
    const totalSksGraded = grades.reduce((sum, g) => sum + (g.course?.credits ?? 0), 0);
    if (totalSksGraded > 0) ipk = (totalBobot / totalSksGraded).toFixed(2);
  }

  const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = daysId[new Date().getDay()];
  const todayCount = schedules?.filter((s) => s.day === todayName).length ?? 0;

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/login'); },
      },
    ]);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();

  // Warna badge pengumuman
  const badgeStyle = (color: string) => {
    const map: Record<string, { bg: string; iconColor: string; textColor: string; iconName: keyof typeof Ionicons.glyphMap }> = {
      yellow: { bg: Colors.warningLight,  iconColor: Colors.warning, textColor: Colors.warning, iconName: 'warning-outline' },
      blue:   { bg: Colors.primaryLight,  iconColor: Colors.primary, textColor: Colors.primary, iconName: 'information-circle-outline' },
      red:    { bg: Colors.errorLight,    iconColor: Colors.error,   textColor: Colors.error,   iconName: 'alert-circle-outline' },
      green:  { bg: Colors.successLight,  iconColor: Colors.success, textColor: Colors.success, iconName: 'checkmark-circle-outline' },
    };
    return map[color] ?? map.blue;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ── Header gradient ── */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />

        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Selamat datang 👋</Text>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>
                  {user.role === 'admin' ? '⚙ Administrator' : '🎓 Mahasiswa'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {/* Stats — student only */}
        {user.role === 'student' && (
          <View style={styles.statsRow}>
            {[
              { val: String(registeredCount), lbl: 'MK Aktif' },
              { val: String(totalSKS),        lbl: 'Total SKS' },
              { val: ipk,                     lbl: 'IPK' },
              { val: String(todayCount),      lbl: 'Hari Ini' },
            ].map((s, i, arr) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLbl}>{s.lbl}</Text>
                {i < arr.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* ── Body ── */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Pengumuman dari Convex */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengumuman</Text>
          {!announcements ? (
            <Text style={styles.hint}>Memuat pengumuman...</Text>
          ) : announcements.length === 0 ? (
            <Text style={styles.hint}>Tidak ada pengumuman.</Text>
          ) : announcements.map((ann) => {
            const bs = badgeStyle(ann.color);
            return (
              <View key={ann._id} style={styles.announceCard}>
                <View style={[styles.announceBadge, { backgroundColor: bs.bg }]}>
                  <Ionicons name={bs.iconName} size={16} color={bs.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.announceTitle, { color: bs.textColor }]}>{ann.title}</Text>
                  <Text style={styles.announceMsg}>{ann.message}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Grid menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Layanan</Text>
          <View style={styles.menuGrid}>
            {filteredMenus.map((menu, i) => (
              <TouchableOpacity
                key={i}
                style={styles.menuCard}
                onPress={() => router.push(menu.route as any)}
                activeOpacity={0.75}
              >
                <View style={[styles.menuIcon, { backgroundColor: menu.color }]}>
                  <Ionicons name={menu.icon} size={26} color={Colors.accent} />
                </View>
                <Text style={styles.menuLabel}>{menu.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(240,192,64,0.08)', top: -80, right: -60,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 18,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '800', color: Colors.primaryDark },
  greeting:   { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  userName:   { fontSize: 17, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
  rolePill: {
    marginTop: 4, backgroundColor: 'rgba(240,192,64,0.2)',
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(240,192,64,0.3)',
  },
  roleText: { fontSize: 10, color: Colors.accentLight, fontWeight: '600' },
  logoutBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem:    { flex: 1, alignItems: 'center', position: 'relative' },
  statVal:     { fontSize: 20, fontWeight: '800', color: '#FFF' },
  statLbl:     { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: '500' },
  statDivider: {
    position: 'absolute', right: 0, top: 4,
    width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)',
  },

  body:         { flex: 1 },
  section:      { paddingHorizontal: 18, paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  hint:         { color: Colors.textLight, fontSize: 13 },

  announceCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, flexDirection: 'row', gap: 12,
    marginBottom: 8, alignItems: 'flex-start',
    shadowColor: '#1A3A9C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  announceBadge: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  announceTitle: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  announceMsg:   { fontSize: 12, color: Colors.textMid, lineHeight: 18 },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuCard: {
    width: CARD_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 12, alignItems: 'center',
    shadowColor: '#1A3A9C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  menuIcon: {
    width: 50, height: 50, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  menuLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textMid,
    textAlign: 'center', lineHeight: 14,
  },
});