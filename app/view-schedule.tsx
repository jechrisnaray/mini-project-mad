import { View, Text, StyleSheet, SectionList, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const DAY_COLORS: Record<string, string> = {
  'Senin': '#1E3A72', 'Selasa': '#1A5C42', 'Rabu': '#553C9A',
  'Kamis': '#744210', 'Jumat': '#285E61', 'Sabtu': '#9B2C2C',
};

export default function ViewScheduleScreen() {
  const { user } = useAuth();
  const schedules = useQuery(api.scheadules.listByUser, user ? { userId: user._id } : 'skip');

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);
  if (!user) return null;

  const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const today = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()];

  const grouped: Record<string, typeof schedules> = {};
  (schedules || []).forEach(s => {
    if (!grouped[s.day]) grouped[s.day] = [];
    grouped[s.day]!.push(s);
  });

  const sections = daysOrder
    .filter(d => grouped[d] && grouped[d]!.length > 0)
    .map(d => ({ title: d, data: grouped[d]! }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Jadwal Kuliah</Text>
        <Text style={styles.headerSub}>Hari ini: {today}</Text>
      </LinearGradient>

      {schedules === undefined ? (
        <View style={styles.centered}><Text style={styles.loadingText}>Memuat jadwal...</Text></View>
      ) : sections.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="calendar-outline" size={56} color={Colors.border} />
          <Text style={styles.emptyText}>Belum ada jadwal tersedia.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => {
            const isToday = section.title === today;
            return (
              <View style={styles.dayHeader}>
                <View style={[styles.dayDot, { backgroundColor: DAY_COLORS[section.title] || Colors.primary }]} />
                <Text style={styles.dayTitle}>{section.title}</Text>
                {isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Hari Ini</Text>
                  </View>
                )}
              </View>
            );
          }}
          renderItem={({ item, section }) => {
            const isToday = section.title === today;
            const dayColor = DAY_COLORS[section.title] || Colors.primary;
            return (
              <View style={[styles.scheduleCard, isToday && styles.scheduleCardToday]}>
                <LinearGradient
                  colors={[dayColor, dayColor + 'DD']}
                  style={styles.timeBar}
                >
                  <Text style={styles.timeText}>{item.time.split('-')[0]}</Text>
                  <View style={styles.timeDivider} />
                  <Text style={styles.timeText}>{item.time.split('-')[1]}</Text>
                </LinearGradient>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleCode}>{item.course?.code}</Text>
                  <Text style={styles.scheduleName}>{item.course?.name}</Text>
                  <View style={styles.scheduleMetaRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textLight} />
                    <Text style={styles.scheduleMeta}>{item.room}</Text>
                    <Text style={styles.scheduleDot}>·</Text>
                    <Ionicons name="book-outline" size={12} color={Colors.textLight} />
                    <Text style={styles.scheduleMeta}>{item.course?.credits} SKS</Text>
                  </View>
                  <View style={styles.lecturerRow}>
                    <Ionicons name="person-outline" size={12} color={Colors.textLight} />
                    <Text style={styles.scheduleMeta}>{item.course?.lecturer}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(232,184,75,0.1)', top: -60, right: -40,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: Colors.textLight, fontSize: 15 },
  emptyText: { color: Colors.textLight, fontSize: 15, marginTop: 12 },
  list: { padding: 16, paddingBottom: 32 },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 10, marginTop: 8,
  },
  dayDot: { width: 10, height: 10, borderRadius: 5 },
  dayTitle: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark },
  todayBadge: {
    backgroundColor: Colors.accent, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  todayText: { fontSize: 11, fontWeight: '700', color: Colors.primaryDark },
  scheduleCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    flexDirection: 'row', marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  scheduleCardToday: {
    borderColor: Colors.accent,
    shadowOpacity: 0.12,
  },
  timeBar: {
    width: 58, alignItems: 'center', justifyContent: 'center',
    padding: 12, gap: 4,
  },
  timeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  timeDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)' },
  scheduleInfo: { flex: 1, padding: 14 },
  scheduleCode: { fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.5 },
  scheduleName: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark, marginTop: 1 },
  scheduleMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  lecturerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  scheduleMeta: { fontSize: 11, color: Colors.textLight },
  scheduleDot: { color: Colors.border },
});