import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

export default function ViewScheduleScreen() {
  const { user } = useAuth();
  const scheds = useQuery(api.scheadules.listByUser, user ? { userId:user._id as any } : 'skip');

  if (!scheds) return <LoadingScreen />;

  const todayStr = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][new Date().getDay()];

  const grouped = DAYS
    .map(day => ({
      title: day, isToday: day===todayStr,
      data: scheds.filter(s => s.day===day).sort((a,b)=>a.time.localeCompare(b.time)),
    }))
    .filter(g => g.data.length > 0);

  return (
    <View style={s.root}>
      <PageHeader title="Jadwal Kuliah" subtitle={`${scheds.length} sesi terdaftar`} showBack={false} />

      {grouped.length === 0
        ? <EmptyState icon="calendar-outline" title="Jadwal Kosong" subtitle="Daftarkan mata kuliah terlebih dahulu" />
        : (
          <SectionList
            sections={grouped}
            keyExtractor={i => i._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <View style={s.dayHead}>
                <View style={[s.dayBar, section.isToday && s.dayBarActive]} />
                <Text style={[s.dayName, section.isToday && s.dayNameActive]}>{section.title}</Text>
                {section.isToday && <View style={s.todayPill}><Text style={s.todayTxt}>Hari Ini</Text></View>}
                <Text style={s.dayCount}>{section.data.length} sesi</Text>
              </View>
            )}
            renderItem={({ item, index, section }) => (
              <View style={[
                s.card,
                index===0 && s.cardFirst,
                index===section.data.length-1 && s.cardLast,
                section.isToday && s.cardToday,
                index>0 && { borderTopWidth:1, borderTopColor:C.borderLight },
              ]}>
                <View style={s.timeCol}>
                  <Text style={s.t1}>{item.time.split('-')[0]?.trim()}</Text>
                  <View style={s.timeDash} />
                  <Text style={s.t2}>{item.time.split('-')[1]?.trim()}</Text>
                </View>
                <View style={s.vLine} />
                <View style={s.body}>
                  <View style={s.bodyTop}>
                    <View style={s.codeTag}><Text style={s.codeTxt}>{item.course?.code ?? '—'}</Text></View>
                    <Text style={s.sks}>{item.course?.credits ?? 0} SKS</Text>
                  </View>
                  <Text style={s.courseName} numberOfLines={2}>{item.course?.name ?? '—'}</Text>
                  <View style={s.meta}>
                    <Ionicons name="location-outline" size={10} color={C.textMuted} />
                    <Text style={s.metaTxt}>{item.room}</Text>
                    <Text style={s.dot}>·</Text>
                    <Ionicons name="person-outline" size={10} color={C.textMuted} />
                    <Text style={s.metaTxt} numberOfLines={1}>{item.course?.lecturer ?? '—'}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        )
      }
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },
  list: { padding:16, paddingBottom:32 },

  dayHead:      { flexDirection:'row', alignItems:'center', gap:8, marginTop:16, marginBottom:6 },
  dayBar:       { width:3, height:12, borderRadius:2, backgroundColor:C.g300 },
  dayBarActive: { backgroundColor:C.primary },
  dayName:      { fontSize:12, fontWeight:'700', color:C.textMuted },
  dayNameActive:{ color:C.text },
  todayPill:    { backgroundColor:C.primary, borderRadius:R.full, paddingHorizontal:8, paddingVertical:2 },
  todayTxt:     { fontSize:8, fontWeight:'700', color:C.white },
  dayCount:     { flex:1, textAlign:'right', fontSize:10, color:C.textMuted },

  card:      { backgroundColor:C.surface, flexDirection:'row', alignItems:'stretch', padding:12, borderLeftWidth:1, borderRightWidth:1, borderColor:C.borderLight },
  cardFirst: { borderTopWidth:1, borderTopLeftRadius:R.lg, borderTopRightRadius:R.lg },
  cardLast:  { borderBottomWidth:1, borderBottomLeftRadius:R.lg, borderBottomRightRadius:R.lg, ...SH.xs, marginBottom:4 },
  cardToday: { borderLeftColor:C.primary, borderLeftWidth:3 },

  timeCol:  { width:46, alignItems:'center', gap:2 },
  t1:       { fontSize:11, fontWeight:'800', color:C.text },
  timeDash: { width:12, height:1, backgroundColor:C.g300 },
  t2:       { fontSize:9, color:C.textMuted },
  vLine:    { width:1, backgroundColor:C.borderLight, marginHorizontal:10 },

  body:     { flex:1 },
  bodyTop:  { flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 },
  codeTag:  { backgroundColor:C.primaryFaint, borderRadius:6, paddingHorizontal:6, paddingVertical:2 },
  codeTxt:  { fontSize:8, fontWeight:'800', color:C.primary },
  sks:      { fontSize:9, color:C.textMuted },
  courseName:{ fontSize:12, fontWeight:'600', color:C.text, marginBottom:4, lineHeight:17 },
  meta:     { flexDirection:'row', alignItems:'center', gap:4, flexWrap:'wrap' },
  metaTxt:  { fontSize:10, color:C.textMuted, maxWidth:100 },
  dot:      { fontSize:9, color:C.g400 },
});