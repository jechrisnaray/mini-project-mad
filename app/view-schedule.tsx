import { View, Text, SectionList, StyleSheet, StatusBar } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingScreen, GoldChip } from '../components/ui';
import C from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

const DAY_COLOR: Record<string, string> = {
  Senin: C.primary, Selasa: C.primaryMid, Rabu: '#0F766E',
  Kamis: C.accent, Jumat: '#7C3AED', Sabtu: '#9D174D',
};

export default function ViewScheduleScreen() {
  const { user } = useAuth();
  const scheds = useQuery(api.scheadules.listByUser, user ? { userId: user._id as any } : 'skip');

  if (!scheds) return <LoadingScreen />;

  const today = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][new Date().getDay()];

  const grouped = DAYS.map(day => ({
    title: day,
    data: scheds.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time)),
  })).filter(g => g.data.length > 0);

  return (
    <View style={s.root}>
      <PageHeader title="Jadwal Kuliah" subtitle={`${scheds.length} sesi terjadwal`} />

      {grouped.length === 0
        ? <EmptyState icon="calendar-outline" title="Jadwal Kosong" subtitle="Belum ada jadwal kuliah yang tersedia" />
        : (
          <SectionList
            sections={grouped}
            keyExtractor={i => i._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section: { title } }) => {
              const isToday = title === today;
              const color = DAY_COLOR[title] ?? C.primary;
              return (
                <View style={s.dayHeader}>
                  <View style={[s.dayDot, { backgroundColor: color }]} />
                  <Text style={[s.dayTitle, { color }]}>{title}</Text>
                  {isToday && (
                    <View style={s.todayChip}>
                      <Text style={s.todayTxt}>Hari Ini</Text>
                    </View>
                  )}
                </View>
              );
            }}
            renderItem={({ item, section }) => {
              const color = DAY_COLOR[section.title] ?? C.primary;
              return (
                <View style={s.card}>
                  <View style={[s.timeBar, { backgroundColor: color }]}>
                    <Ionicons name="time-outline" size={14} color="#FFF" />
                    <Text style={s.timeTxt}>{item.time}</Text>
                  </View>
                  <View style={s.cardBody}>
                    <View style={s.codeRow}>
                      <GoldChip label={item.course?.code ?? '—'} />
                      <Text style={s.sks}>{item.course?.credits ?? 0} SKS</Text>
                    </View>
                    <Text style={s.courseName}>{item.course?.name ?? 'Mata Kuliah'}</Text>
                    <View style={s.infoRow}>
                      <View style={s.infoChip}>
                        <Ionicons name="location-outline" size={12} color={C.textMuted} />
                        <Text style={s.infoTxt}>{item.room}</Text>
                      </View>
                      <View style={s.infoChip}>
                        <Ionicons name="person-outline" size={12} color={C.textMuted} />
                        <Text style={s.infoTxt} numberOfLines={1}>{item.course?.lecturer ?? '—'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )
      }
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.background },
  list:       { padding: 16, paddingBottom: 24 },
  dayHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
  dayDot:     { width: 8, height: 8, borderRadius: 4 },
  dayTitle:   { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  todayChip:  { backgroundColor: C.accentLight, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: C.accentBright + '50' },
  todayTxt:   { fontSize: 10, fontWeight: '700', color: C.accent },
  card:       { backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: C.borderLight, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  timeBar:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7 },
  timeTxt:    { fontSize: 13, fontWeight: '700', color: '#FFF' },
  cardBody:   { padding: 14 },
  codeRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sks:        { fontSize: 11, color: C.textMuted, fontWeight: '600' },
  courseName: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  infoRow:    { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  infoChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.background, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  infoTxt:    { fontSize: 11, color: C.textSub, maxWidth: 120 },
});