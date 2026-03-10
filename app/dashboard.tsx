import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SH } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../convex/_generated/api';

const GW: Record<string, number> = {
  A: 4,
  'A-': 3.7,
  'B+': 3.3,
  B: 3,
  'B-': 2.7,
  'C+': 2.3,
  C: 2,
  D: 1,
  E: 0,
};

const MENUS = [
  { name: 'Registrasi', icon: 'clipboard-outline', route: '/registration', roles: ['student'] },
  { name: 'Add/Drop', icon: 'swap-horizontal-outline', route: '/add-drop', roles: ['student'] },
  { name: 'Drop MK', icon: 'trash-outline', route: '/drop-subject', roles: ['student'] },
  { name: 'Nilai', icon: 'school-outline', route: '/view-grade', roles: ['student', 'admin'] },
  { name: 'Jadwal', icon: 'calendar-outline', route: '/view-schedule', roles: ['student'] },
  { name: 'Eval. Dosen', icon: 'star-outline', route: '/teacher-evaluation', roles: ['student'] },
  { name: 'Ospek/KKN', icon: 'flag-outline', route: '/ospek-kkn', roles: ['student'] },
  { name: 'Biaya SMT', icon: 'receipt-outline', route: '/semester-cost', roles: ['student'] },
  { name: 'Input Nilai', icon: 'create-outline', route: '/input-grade', roles: ['admin'] },
] as const;

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const greet = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const initials = (n: string) =>
  n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function DashboardScreen() {
  const { user, isLoading } = useAuth();

  const regs =
    useQuery(
      api.registrations.listByUser,
      user ? { userId: user._id as any } : 'skip'
    ) ?? [];

  const grades =
    useQuery(
      api.grades.listByUser,
      user ? { userId: user._id as any } : 'skip'
    ) ?? [];

  const scheds =
    useQuery(
      api.scheadules.listByUser,
      user ? { userId: user._id as any } : 'skip'
    ) ?? [];

  const anns = useQuery(api.announcements.list) ?? [];

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  const active = regs.filter((r: any) => r.status === 'registered');
  const totalSKS = active.reduce(
    (sum: number, r: any) => sum + (r.course?.credits ?? 0),
    0
  );

  const maxSks = (user as any)?.maxSks ?? 24;

  let ipk = 0;
  if (grades.length > 0) {
    const weightedBobot = grades.reduce(
      (sum: number, g: any) => sum + (GW[g.grade] ?? 0) * (g.course?.credits ?? 0),
      0
    );
    const weightedSks = grades.reduce(
      (sum: number, g: any) => sum + (g.course?.credits ?? 0),
      0
    );
    if (weightedSks > 0) ipk = weightedBobot / weightedSks;
  }

  const todayStr = DAYS[new Date().getDay()];
  const todayScheds = scheds
    .filter((s: any) => s.day === todayStr)
    .sort((a: any, b: any) => a.time.localeCompare(b.time));

  const menus = MENUS.filter((m) =>
    (m.roles as readonly string[]).includes((user as any).role)
  );

  const stats = [
    { val: active.length, lbl: 'MK Aktif', icon: 'layers-outline' },
    { val: `${totalSKS}/${maxSks}`, lbl: 'Total SKS', icon: 'library-outline' },
    { val: ipk > 0 ? ipk.toFixed(2) : '–', lbl: 'IPK', icon: 'trophy-outline' },
    { val: todayScheds.length, lbl: 'Hari Ini', icon: 'today-outline' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1E2749" />

      <LinearGradient
        colors={['#1E2749', '#25315C', '#33406E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroBg}
      >
        <View style={s.bgCircleTop} />
        <View style={s.bgCircleMid} />

        <View style={s.header}>
          <View style={s.hrow}>
            <View style={{ flex: 1 }}>
              <Text style={s.greeting}>{greet()}</Text>
              <Text style={s.name}>{user.name.split(' ')[0]} 👋</Text>
              <Text style={s.subhead}>Semoga harimu produktif dan menyenangkan</Text>
            </View>

            <TouchableOpacity
              style={s.avatarBtn}
              onPress={() => router.push('/profile' as any)}
            >
              <Text style={s.avatarTxt}>{initials(user.name)}</Text>
            </TouchableOpacity>
          </View>

          {(user as any).role === 'student' && (
            <View style={s.statsRow}>
              {stats.map((st, i) => (
                <View key={i} style={s.statCard}>
                  <View style={s.statIcon}>
                    <Ionicons name={st.icon as any} size={16} color="#2F4C8F" />
                  </View>
                  <Text style={s.statVal}>{st.val}</Text>
                  <Text style={s.statLbl}>{st.lbl}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {(user as any).role === 'student' && (
          <View style={s.banner}>
            <View style={s.bannerIcon}>
              <Ionicons name="time-outline" size={16} color="#2F4C8F" />
            </View>
            <Text style={s.bannerTxt}>
              Masa studi aktif hingga{' '}
              <Text style={s.bannerStrong}>{(user as any).activeUntil ?? '—'}</Text>
            </Text>
          </View>
        )}

        {anns.length > 0 && (
          <View style={s.section}>
            <View style={s.secHead}>
              <Text style={s.secTitle}>Pengumuman</Text>
              <View style={s.secBadge}>
                <Text style={s.secBadgeTxt}>{anns.length}</Text>
              </View>
            </View>

            {anns.map((a: any) => (
              <View key={a._id} style={s.annCard}>
                <LinearGradient
                  colors={['#EEF2FF', '#F8FAFC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.annIconWrap}
                >
                  <Ionicons name="megaphone-outline" size={18} color="#2F4C8F" />
                </LinearGradient>

                <View style={{ flex: 1 }}>
                  <Text style={s.annTitle}>{a.title}</Text>
                  <Text style={s.annMsg}>{a.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {(user as any).role === 'student' && (
          <View style={s.section}>
            <View style={s.secRow}>
              <Text style={s.secTitle}>Jadwal {todayStr}</Text>
              <TouchableOpacity onPress={() => router.push('/view-schedule' as any)}>
                <Text style={s.seeAll}>Lihat semua</Text>
              </TouchableOpacity>
            </View>

            {todayScheds.length === 0 ? (
              <View style={s.emptyCard}>
                <View style={s.emptyIcon}>
                  <Ionicons
                    name="calendar-clear-outline"
                    size={22}
                    color="#64748B"
                  />
                </View>
                <Text style={s.emptyTitle}>Belum ada jadwal</Text>
                <Text style={s.emptyTxt}>
                  Tidak ada kelas yang terjadwal untuk hari ini
                </Text>
              </View>
            ) : (
              todayScheds.map((sc: any) => (
                <View key={sc._id} style={s.schedCard}>
                  <LinearGradient
                    colors={['#2F4C8F', '#3E5FA8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.schedTime}
                  >
                    <Text style={s.schedStart}>{sc.time?.split('-')[0] ?? '--'}</Text>
                    <Text style={s.schedEnd}>{sc.time?.split('-')[1] ?? '--'}</Text>
                  </LinearGradient>

                  <View style={s.schedBody}>
                    <View style={s.schedTopRow}>
                      <Text style={s.schedName} numberOfLines={1}>
                        {sc.course?.name ?? '—'}
                      </Text>
                      <View style={s.schedCode}>
                        <Text style={s.schedCodeTxt}>{sc.course?.code ?? '-'}</Text>
                      </View>
                    </View>

                    <Text style={s.schedRoom}>
                      {sc.room ?? '-'} · {sc.course?.lecturer ?? '-'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.secTitle}>Layanan Akademik</Text>

          <View style={s.grid}>
            {menus.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={s.menuCard}
                activeOpacity={0.9}
                onPress={() => router.push(m.route as any)}
              >
                <LinearGradient
                  colors={['#F8FAFC', '#EEF2FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.menuIcon}
                >
                  <Ionicons name={m.icon as any} size={21} color="#2F4C8F" />
                </LinearGradient>

                <Text style={s.menuLbl}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 10;
const MCOL = '47.5%';

const shadowXs = SH?.xs ?? {};
const shadowSm = SH?.sm ?? {};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  heroBg: {
    paddingTop: PT,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },

  bgCircleTop: {
    position: 'absolute',
    top: -60,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  bgCircleMid: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  header: {
    paddingHorizontal: 20,
  },

  hrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 2,
  },

  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subhead: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },

  avatarBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...shadowSm,
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  statLbl: {
    marginTop: 2,
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },

  scrollContent: {
    paddingBottom: 28,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadowXs,
  },

  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerTxt: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  bannerStrong: {
    fontWeight: '800',
    color: '#0F172A',
  },

  section: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  secHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },

  secTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  secBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  secBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2F4C8F',
  },

  secRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  seeAll: {
    fontSize: 12,
    color: '#2F4C8F',
    fontWeight: '700',
  },

  annCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadowXs,
  },

  annIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  annTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  annMsg: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    ...shadowXs,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  emptyTxt: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  schedCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    ...shadowXs,
  },

  schedTime: {
    width: 68,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  schedStart: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  schedEnd: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },

  schedBody: {
    flex: 1,
  },

  schedTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },

  schedName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  schedRoom: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  schedCode: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  schedCodeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2F4C8F',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  menuCard: {
    width: MCOL,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadowXs,
  },

  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  menuLbl: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 17,
  },
});