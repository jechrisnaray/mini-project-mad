import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

type OType   = 'ospek'|'kkn'|'kku';
type OStatus = 'completed'|'in_progress'|'not_started';

const TYPE_CFG: Record<OType,{ label:string; icon:keyof typeof Ionicons.glyphMap; desc:string }> = {
  ospek: { label:'OSPEK', icon:'flag-outline',   desc:'Orientasi Studi dan Pengenalan Kampus' },
  kkn:   { label:'KKN',   icon:'earth-outline',  desc:'Kuliah Kerja Nyata' },
  kku:   { label:'KKU',   icon:'people-outline', desc:'Kuliah Kerja Usaha' },
};

const STATUS_CFG: Record<OStatus,{ label:string; icon:keyof typeof Ionicons.glyphMap; bg:string; txt:string }> = {
  completed:   { label:'Selesai',       icon:'checkmark-circle', bg:C.primaryFaint,   txt:C.primary },
  in_progress: { label:'Berlangsung',   icon:'time-outline',     bg:C.goldFaint,      txt:C.gold },
  not_started: { label:'Belum Dimulai', icon:'ellipse-outline',  bg:C.g100,           txt:C.textMuted },
};

export default function OspekKknScreen() {
  const { user } = useAuth();
  const items = useQuery(api.ospekKkn.listByUser, user ? { userId:user._id as any } : 'skip');

  if (!items) return <LoadingScreen />;
  const done = items.filter(i => i.status === 'completed').length;

  return (
    <View style={s.root}>
      <PageHeader title="Ospek, KKN & KKU" subtitle={`${done}/3 kegiatan selesai`} />

      {items.length === 0
        ? <EmptyState icon="people-outline" title="Belum Ada Data" subtitle="Data kegiatan kemahasiswaan belum tersedia" />
        : (
          <FlatList
            data={items}
            keyExtractor={i => i._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={s.progressCard}>
                <Text style={s.progTitle}>Progress Kegiatan Wajib</Text>
                <View style={s.track}>
                  <View style={[s.fill, { width:`${(done/3)*100}%` as any }]} />
                </View>
                <View style={s.steps}>
                  {(['ospek','kkn','kku'] as OType[]).map((type, i) => {
                    const item = items.find(x => x.type === type);
                    const ok   = item?.status === 'completed';
                    return (
                      <View key={type} style={s.step}>
                        <View style={[s.stepDot, ok && s.stepDotDone]}>
                          {ok ? <Ionicons name="checkmark" size={12} color={C.white} /> : <Text style={s.stepNum}>{i+1}</Text>}
                        </View>
                        <Text style={[s.stepLbl, ok && {color:C.primary}]}>{TYPE_CFG[type].label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            }
            renderItem={({ item }) => {
              const tc = TYPE_CFG[item.type as OType] ?? TYPE_CFG.ospek;
              const sc = STATUS_CFG[item.status as OStatus] ?? STATUS_CFG.not_started;
              const ok = item.status === 'completed';
              return (
                <View style={s.card}>
                  <View style={s.cardHead}>
                    <View style={[s.typeIcon, ok && s.typeIconDone]}>
                      <Ionicons name={tc.icon} size={18} color={ok ? C.white : C.textMuted} />
                    </View>
                    <View style={{flex:1}}>
                      <Text style={s.typeLabel}>{tc.label}</Text>
                      <Text style={s.typeDesc}>{tc.desc}</Text>
                    </View>
                    <View style={[s.statusChip, {backgroundColor:sc.bg}]}>
                      <Ionicons name={sc.icon} size={11} color={sc.txt} />
                      <Text style={[s.statusTxt, {color:sc.txt}]}>{sc.label}</Text>
                    </View>
                  </View>
                  <View style={s.cardBody}>
                    <View style={s.metaRow}>
                      <Ionicons name="calendar-outline" size={11} color={C.textMuted} />
                      <Text style={s.metaTxt}>Tahun {item.year}</Text>
                    </View>
                    {item.notes && (
                      <View style={s.notes}>
                        <Ionicons name="document-text-outline" size={11} color={C.textMuted} />
                        <Text style={s.notesTxt}>{item.notes}</Text>
                      </View>
                    )}
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
  root: { flex:1, backgroundColor:C.bg },
  list: { padding:14, gap:8, paddingBottom:24 },

  progressCard: { backgroundColor:C.surface, borderRadius:R.xl, padding:16, marginBottom:6, borderWidth:1, borderColor:C.borderLight, ...SH.xs },
  progTitle:    { fontSize:12, fontWeight:'700', color:C.text, marginBottom:12 },
  track:        { height:4, backgroundColor:C.g200, borderRadius:2, overflow:'hidden', marginBottom:14 },
  fill:         { height:4, backgroundColor:C.primary, borderRadius:2 },
  steps:        { flexDirection:'row', justifyContent:'space-around' },
  step:         { alignItems:'center', gap:5 },
  stepDot:      { width:30, height:30, borderRadius:R.md, backgroundColor:C.g100, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:C.border },
  stepDotDone:  { backgroundColor:C.primary, borderColor:C.primary },
  stepNum:      { fontSize:11, fontWeight:'700', color:C.textMuted },
  stepLbl:      { fontSize:9, color:C.textMuted, fontWeight:'600', letterSpacing:0.3 },

  card:         { backgroundColor:C.surface, borderRadius:R.lg, borderWidth:1, borderColor:C.borderLight, overflow:'hidden', ...SH.xs },
  cardHead:     { flexDirection:'row', alignItems:'center', padding:14, gap:12 },
  typeIcon:     { width:38, height:38, borderRadius:R.md, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center', flexShrink:0, borderWidth:1, borderColor:C.primaryPale },
  typeIconDone: { backgroundColor:C.primary, borderColor:C.primary },
  typeLabel:    { fontSize:14, fontWeight:'700', color:C.text },
  typeDesc:     { fontSize:10, color:C.textMuted, marginTop:1 },
  statusChip:   { flexDirection:'row', alignItems:'center', gap:4, borderRadius:R.full, paddingHorizontal:9, paddingVertical:4 },
  statusTxt:    { fontSize:9, fontWeight:'700' },
  cardBody:     { paddingHorizontal:14, paddingBottom:14, gap:7 },
  metaRow:      { flexDirection:'row', alignItems:'center', gap:6 },
  metaTxt:      { fontSize:11, color:C.textMuted },
  notes:        { flexDirection:'row', gap:7, backgroundColor:C.g50, borderRadius:R.sm, padding:9, borderWidth:1, borderColor:C.borderLight },
  notesTxt:     { fontSize:11, color:C.textMuted, flex:1, lineHeight:17 },
});