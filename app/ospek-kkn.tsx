import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingScreen } from '../components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import C from '../constants/Colors';

type OspekType = 'ospek' | 'kkn' | 'kku';
type OspekStatus = 'completed' | 'in_progress' | 'not_started';

const TYPE_CONFIG: Record<OspekType, { label: string; icon: keyof typeof Ionicons.glyphMap; colors: [string,string] }> = {
  ospek: { label: 'OSPEK',       icon: 'flag-outline',   colors: [C.primary,     C.primaryMid] },
  kkn:   { label: 'KKN',         icon: 'earth-outline',  colors: [C.accent,      '#7A5C00'] },
  kku:   { label: 'KKU',         icon: 'people-outline', colors: ['#0F766E',     '#064E3B'] },
};

const STATUS_CONFIG: Record<OspekStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  completed:   { label: 'Selesai',          color: C.success, bg: C.successBg, icon: 'checkmark-circle' },
  in_progress: { label: 'Sedang Berjalan',  color: C.warning, bg: C.warningBg, icon: 'time' },
  not_started: { label: 'Belum Dimulai',    color: C.textMuted, bg: C.borderLight, icon: 'ellipse-outline' },
};

export default function OspekKknScreen() {
  const { user } = useAuth();
  const items = useQuery(api.ospekKkn.listByUser, user ? { userId: user._id as any } : 'skip');

  if (!items) return <LoadingScreen />;

  return (
    <View style={s.root}>
      <PageHeader title="Ospek, KKN & KKU" subtitle="Status kegiatan kemahasiswaan" />

      {items.length === 0
        ? <EmptyState icon="people-outline" title="Belum Ada Data" subtitle="Data Ospek, KKN, dan KKU Anda belum tersedia" />
        : (
          <FlatList
            data={items}
            keyExtractor={i => i._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const tc = TYPE_CONFIG[item.type as OspekType] ?? TYPE_CONFIG.ospek;
              const sc = STATUS_CONFIG[item.status as OspekStatus] ?? STATUS_CONFIG.not_started;
              return (
                <View style={s.card}>
                  {/* Header strip */}
                  <LinearGradient colors={tc.colors} style={s.cardHeader} start={{x:0,y:0}} end={{x:1,y:0}}>
                    <View style={s.typeIcon}>
                      <Ionicons name={tc.icon} size={18} color={C.accentBright} />
                    </View>
                    <Text style={s.typeLabel}>{tc.label}</Text>
                    <View style={[s.statusChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                      <Ionicons name={sc.icon} size={12} color="#FFF" />
                      <Text style={s.statusChipTxt}>{sc.label}</Text>
                    </View>
                  </LinearGradient>

                  {/* Body */}
                  <View style={s.cardBody}>
                    <View style={s.infoRow}>
                      <View style={s.infoItem}>
                        <Text style={s.infoLabel}>Tahun</Text>
                        <Text style={s.infoValue}>{item.year}</Text>
                      </View>
                      <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                        <View style={[s.statusDot, { backgroundColor: sc.color }]} />
                        <Text style={[s.statusPillTxt, { color: sc.color }]}>{sc.label}</Text>
                      </View>
                    </View>

                    {item.notes ? (
                      <View style={s.notesBox}>
                        <Ionicons name="document-text-outline" size={13} color={C.textMuted} />
                        <Text style={s.notesTxt}>{item.notes}</Text>
                      </View>
                    ) : null}
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
  root:          { flex: 1, backgroundColor: C.background },
  list:          { padding: 16, gap: 12 },
  card:          { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.borderLight, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  typeIcon:      { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  typeLabel:     { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 0.5, flex: 1 },
  statusChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusChipTxt: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  cardBody:      { padding: 14 },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  infoItem:      {},
  infoLabel:     { fontSize: 10, color: C.textMuted, marginBottom: 2 },
  infoValue:     { fontSize: 16, fontWeight: '800', color: C.text },
  statusPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot:     { width: 6, height: 6, borderRadius: 3 },
  statusPillTxt: { fontSize: 11, fontWeight: '700' },
  notesBox:      { flexDirection: 'row', gap: 8, backgroundColor: C.background, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.borderLight },
  notesTxt:      { fontSize: 12, color: C.textSub, flex: 1, lineHeight: 18 },
});