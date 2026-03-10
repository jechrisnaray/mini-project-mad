// ===== drop-subject.tsx =====
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, PrimaryButton, EmptyState, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

export function DropSubjectScreen() {
  const { user } = useAuth();
  const myRegs  = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const dropMut = useMutation(api.registrations.drop);
  const [sel, setSel] = useState<string | null>(null);
  const [loading, setLoad] = useState(false);

  if (!myRegs) return <LoadingScreen />;
  const registered = myRegs.filter(r => r.status === 'registered');
  const chosen     = registered.find(r => r.courseId === sel);

  const handleDrop = () => {
    if (!sel) { Alert.alert('Info', 'Pilih mata kuliah.'); return; }
    Alert.alert('Konfirmasi Drop', `Batalkan "${chosen?.course?.name}"?\n\nTidak dapat dibatalkan.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Drop', style: 'destructive', onPress: async () => {
        setLoad(true);
        try {
          await dropMut({ userId: user!._id as any, courseId: sel as any });
          Alert.alert('Berhasil', 'Mata kuliah berhasil di-drop.');
          setSel(null);
        } catch (e: any) { Alert.alert('Gagal', e?.message); }
        finally { setLoad(false); }
      }},
    ]);
  };

  return (
    <View style={ds.root}>
      <PageHeader title="Drop Mata Kuliah" subtitle={`${registered.length} MK aktif`} />
      {registered.length === 0
        ? <EmptyState icon="clipboard-outline" title="Tidak Ada MK Aktif" subtitle="Belum terdaftar di mata kuliah manapun" />
        : (
          <>
            <View style={ds.warn}>
              <Ionicons name="warning-outline" size={13} color={C.textMuted} />
              <Text style={ds.warnTxt}>Drop MK <Text style={{ fontWeight: '700', color: C.text }}>tidak dapat dibatalkan</Text>. Pilih dengan hati-hati.</Text>
            </View>
            <FlatList
              data={registered}
              keyExtractor={i => i._id}
              contentContainerStyle={ds.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSel = sel === item.courseId;
                return (
                  <TouchableOpacity style={[ds.card, isSel && ds.cardSel]} onPress={() => setSel(isSel ? null : item.courseId)} activeOpacity={0.75}>
                    <View style={[ds.radio, isSel && ds.radioSel]}>{isSel && <View style={ds.radioDot} />}</View>
                    <View style={{ flex: 1 }}>
                      <View style={ds.topRow}>
                        <View style={[ds.code, isSel && ds.codeSel]}><Text style={[ds.codeTxt, isSel && { color: C.white }]}>{item.course?.code ?? '—'}</Text></View>
                        <Text style={ds.sks}>{item.course?.credits ?? 0} SKS</Text>
                      </View>
                      <Text style={[ds.name, isSel && { textDecorationLine: 'line-through', color: C.textMuted }]}>{item.course?.name ?? '—'}</Text>
                      <Text style={ds.sub}>{item.course?.day} · {item.course?.time} · {item.course?.room}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            <View style={ds.footer}>
              {sel && chosen && (
                <View style={ds.selInfo}>
                  <Text style={ds.selLbl}>Akan di-drop:</Text>
                  <Text style={ds.selVal} numberOfLines={1}>{chosen.course?.name}</Text>
                </View>
              )}
              <PrimaryButton label={sel ? 'Drop Mata Kuliah' : 'Pilih MK'} onPress={handleDrop} loading={loading} danger icon="trash-outline" disabled={!sel} />
            </View>
          </>
        )
      }
    </View>
  );
}

const ds = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  warn:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, margin: 16, marginBottom: 0, backgroundColor: C.surface, borderRadius: R.md, padding: 12, borderWidth: 1, borderColor: C.border },
  warnTxt: { fontSize: 12, color: C.textMuted, flex: 1, lineHeight: 18 },
  list:    { padding: 16, gap: 7 },
  card:    { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: C.border, ...SH.xs },
  cardSel: { borderColor: C.g700 },
  radio:   { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioSel:{ borderColor: C.g700 },
  radioDot:{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.g700 },
  topRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  code:    { backgroundColor: C.g100, borderRadius: R.xs, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: C.border },
  codeSel: { backgroundColor: C.g700 },
  codeTxt: { fontSize: 9, fontWeight: '700', color: C.textMuted },
  sks:     { fontSize: 11, color: C.textMuted },
  name:    { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 2 },
  sub:     { fontSize: 10, color: C.textMuted },
  footer:  { padding: 16, paddingBottom: 24, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, gap: 8, ...SH.md },
  selInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.g100, borderRadius: R.sm, padding: 10, borderWidth: 1, borderColor: C.border },
  selLbl:  { fontSize: 10, color: C.textMuted, fontWeight: '600', flexShrink: 0 },
  selVal:  { fontSize: 11, fontWeight: '600', color: C.text, flex: 1 },
});

export default DropSubjectScreen;