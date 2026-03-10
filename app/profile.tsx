import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingScreen, PageHeader } from '../components/ui';
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

const init = (n: string) =>
  n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const regs = useQuery(
    api.registrations.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );
  const grades = useQuery(
    api.grades.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );
  const ospek = useQuery(
    api.ospekKkn.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );
  const evals = useQuery(
    api.teacherEvalutions.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );

  if (!regs || !grades || !ospek || !evals) return <LoadingScreen />;

  const active = regs.filter((r) => r.status === 'registered');
  const dropped = regs.filter((r) => r.status === 'dropped');
  const totalSKS = active.reduce((s, r) => s + (r.course?.credits ?? 0), 0);
  const histSKS = grades.reduce((s, g) => s + (g.course?.credits ?? 0), 0);
  const ospekDone = ospek.filter((o) => o.status === 'completed').length;

  let ipk = 0;
  if (grades.length) {
    const wb = grades.reduce(
      (s, g) => s + (GW[g.grade] ?? 0) * (g.course?.credits ?? 0),
      0
    );
    const ws = grades.reduce((s, g) => s + (g.course?.credits ?? 0), 0);
    if (ws > 0) ipk = wb / ws;
  }

  const handleLogout = () =>
    Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);

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
        <View style={s.bgCircleBottom} />

        <PageHeader title="Profil" showBack={false} />

        <View style={s.heroContent}>
          <Text style={s.heroTitle}>Akun Saya</Text>
          <Text style={s.heroSub}>Kelola informasi pribadi dan akademik Anda</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <LinearGradient
            colors={['#2F4C8F', '#3E5FA8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.avatar}
          >
            <Text style={s.avatarTxt}>{init(user?.name ?? 'U')}</Text>
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name}</Text>
            {user?.nim ? <Text style={s.nimTxt}>{user.nim}</Text> : null}
            <View style={s.roleBadge}>
              <Text style={s.roleTxt}>
                {user?.role === 'admin' ? 'Administrator' : 'Mahasiswa'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={s.logoutIconBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {user?.role === 'student' && (
          <View style={s.statsRow}>
            {[
              { v: active.length, l: 'MK Aktif' },
              { v: totalSKS, l: 'SKS Aktif' },
              { v: grades.length, l: 'MK Selesai' },
              { v: ipk > 0 ? ipk.toFixed(2) : '–', l: 'IPK' },
            ].map((st, i) => (
              <View key={i} style={s.statBox}>
                <Text style={s.statVal}>{st.v}</Text>
                <Text style={s.statLbl}>{st.l}</Text>
              </View>
            ))}
          </View>
        )}

        <SLbl title="INFORMASI AKUN" />
        <View style={s.card}>
          {[
            { icon: 'person-outline' as const, lbl: 'Nama Lengkap', val: user?.name ?? '—' },
            { icon: 'at-outline' as const, lbl: 'Username', val: user?.username ?? '—' },
            { icon: 'card-outline' as const, lbl: 'NIM', val: user?.nim ?? '—' },
            { icon: 'book-outline' as const, lbl: 'Program Studi', val: user?.prodi ?? '—' },
            { icon: 'calendar-outline' as const, lbl: 'Angkatan', val: user?.angkatan ?? '—' },
            { icon: 'time-outline' as const, lbl: 'Masa Aktif s/d', val: user?.activeUntil ?? '—' },
            {
              icon: 'layers-outline' as const,
              lbl: 'Maks SKS/Semester',
              val: `${user?.maxSks ?? 24} SKS`,
            },
          ].map((row, i, arr) => (
            <View key={i} style={[s.infoRow, i < arr.length - 1 && s.rowBorder]}>
              <View style={s.infoIcon}>
                <Ionicons name={row.icon} size={15} color="#2F4C8F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.infoLbl}>{row.lbl}</Text>
                <Text style={s.infoVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {user?.role === 'student' && (
          <>
            <SLbl title="STATUS KEGIATAN" />
            <View style={s.card}>
              {(['ospek', 'kkn', 'kku'] as const).map((type, i, arr) => {
                const data = ospek.find((o) => o.type === type);
                const st = data?.status ?? 'not_started';
                const stLbl =
                  st === 'completed'
                    ? 'Selesai'
                    : st === 'in_progress'
                    ? 'Berlangsung'
                    : 'Belum';

                return (
                  <View key={i} style={[s.infoRow, i < arr.length - 1 && s.rowBorder]}>
                    <View style={s.infoIcon}>
                      <Ionicons name="flag-outline" size={15} color="#2F4C8F" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLbl}>{type.toUpperCase()}</Text>
                      <Text style={s.infoVal}>
                        {data?.year ?? '—'}
                        {data?.notes ? ` · ${data.notes}` : ''}
                      </Text>
                    </View>

                    <View
                      style={[
                        s.chip,
                        st === 'completed'
                          ? s.chipDone
                          : st === 'in_progress'
                          ? s.chipProgress
                          : s.chipIdle,
                      ]}
                    >
                      <Text
                        style={[
                          s.chipTxt,
                          st === 'completed' && s.chipTxtDone,
                          st === 'in_progress' && s.chipTxtProgress,
                        ]}
                      >
                        {stLbl}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {user?.role === 'student' && (
          <>
            <SLbl title="RINGKASAN AKADEMIK" />
            <View style={s.card}>
              {[
                { lbl: 'MK Aktif', val: `${active.length} MK · ${totalSKS} SKS` },
                { lbl: 'MK Di-drop', val: `${dropped.length} MK` },
                { lbl: 'MK Sudah Dinilai', val: `${grades.length} MK · ${histSKS} SKS` },
                { lbl: 'Evaluasi Diberikan', val: `${evals.length} evaluasi` },
                { lbl: 'Kegiatan Wajib', val: `${ospekDone}/3 selesai` },
              ].map((row, i, arr) => (
                <View key={i} style={[s.infoRow, i < arr.length - 1 && s.rowBorder]}>
                  <Text style={[s.infoLbl, { flex: 1 }]}>{row.lbl}</Text>
                  <Text style={s.infoVal}>{row.val}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <SLbl title="MENU CEPAT" />
        <View style={s.card}>
          {[
            { icon: 'flag-outline' as const, lbl: 'Ospek, KKN & KKU', route: '/ospek-kkn' },
            { icon: 'receipt-outline' as const, lbl: 'Biaya Semester', route: '/semester-cost' },
            { icon: 'star-outline' as const, lbl: 'Evaluasi Dosen', route: '/teacher-evaluation' },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[s.menuRow, i < arr.length - 1 && s.rowBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={s.infoIcon}>
                <Ionicons name={item.icon} size={15} color="#2F4C8F" />
              </View>
              <Text style={s.menuLbl}>{item.lbl}</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.9}>
          <LinearGradient
            colors={['#2F4C8F', '#3E5FA8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.logoutBtnInner}
          >
            <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
            <Text style={s.logoutTxt}>Keluar dari Akun</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={s.footer}>SIU v1.0 · Universitas Klabat</Text>
      </ScrollView>
    </View>
  );
}

function SLbl({ title }: { title: string }) {
  return <Text style={sl.t}>{title}</Text>;
}

const sl = StyleSheet.create({
  t: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
});

const shadowXs = SH?.xs ?? {};
const shadowSm = SH?.sm ?? {};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  heroBg: {
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },

  bgCircleTop: {
    position: 'absolute',
    top: -60,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  bgCircleBottom: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  heroSub: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
  },

  scroll: {
    padding: 18,
    paddingBottom: 40,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -8,
    ...shadowSm,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  avatarTxt: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },

  nimTxt: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  roleTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2F4C8F',
  },

  logoutIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadowXs,
  },

  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },

  statLbl: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...shadowXs,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  infoLbl: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },

  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  chipIdle: {
    backgroundColor: '#F1F5F9',
  },

  chipDone: {
    backgroundColor: '#2F4C8F',
  },

  chipProgress: {
    backgroundColor: '#E0E7FF',
  },

  chipTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },

  chipTxtDone: {
    color: '#FFFFFF',
  },

  chipTxtProgress: {
    color: '#2F4C8F',
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },

  menuLbl: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  logoutBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 18,
    ...shadowSm,
  },

  logoutBtnInner: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  logoutTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 16,
  },
});