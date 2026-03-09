import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, PrimaryButton, EmptyState, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C from '../constants/Colors';

export default function DropSubjectScreen() {
  const { user } = useAuth();
  const myRegs = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const dropMut = useMutation(api.registrations.drop);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoad] = useState(false);

  if (!myRegs) return <LoadingScreen />;
  const registered = myRegs.filter(r => r.status === 'registered');

  const handleDrop = () => {
    if (!selectedId) { Alert.alert('Info', 'Pilih mata kuliah yang akan di-drop.'); return; }
    const chosen = registered.find(r => r.courseId === selectedId);
    Alert.alert(
      'Konfirmasi Drop',
      `Yakin ingin membatalkan "${chosen?.course?.name}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Drop MK', style: 'destructive', onPress: async () => {
            setLoad(true);
            try {
              await dropMut({ userId: user!._id as any, courseId: selectedId as any });
              Alert.alert('Berhasil', 'Mata kuliah berhasil di-drop.');
              setSelectedId(null);
            } catch (e: any) { Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan'); }
            finally { setLoad(false); }
          }
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      <PageHeader title="Drop Mata Kuliah" subtitle="Pilih MK yang ingin dibatalkan" />

      {registered.length === 0
        ? <EmptyState icon="clipboard-outline" title="Tidak Ada MK Aktif" subtitle="Anda belum terdaftar di mata kuliah manapun" />
        : (
          <>
            <View style={s.warningBanner}>
              <Ionicons name="warning-outline" size={15} color={C.warning} />
              <Text style={s.warningTxt}>Drop MK tidak dapat dibatalkan. Pastikan keputusan Anda sudah tepat.</Text>
            </View>

            <FlatList
              data={registered}
              keyExtractor={i => i._id}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = selectedId === item.courseId;
                return (
                  <TouchableOpacity
                    style={[s.card, selected && s.cardSelected]}
                    onPress={() => setSelectedId(selected ? null : item.courseId)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.radioOuter, selected && s.radioOuterSelected]}>
                      {selected && <View style={s.radioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={s.codeRow}>
                        <View style={[s.codeChip, { backgroundColor: selected ? C.errorBg : C.accentLight }]}>
                          <Text style={[s.codeTxt, { color: selected ? C.error : C.accent }]}>{item.course?.code ?? '—'}</Text>
                        </View>
                        <Text style={s.sks}>{item.course?.credits ?? 0} SKS</Text>
                      </View>
                      <Text style={s.courseName}>{item.course?.name ?? 'Mata Kuliah'}</Text>
                      <Text style={s.lecturer}>{item.course?.lecturer ?? ''}</Text>
                    </View>
                    {selected && (
                      <View style={s.selectedBadge}>
                        <Ionicons name="close-circle" size={20} color={C.error} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <View style={s.footer}>
              <PrimaryButton
                label={selectedId ? `Drop "${registered.find(r => r.courseId === selectedId)?.course?.name?.split(' ')[0]}..."` : 'Pilih MK untuk Drop'}
                onPress={handleDrop}
                loading={loading}
                danger
                icon="trash-outline"
                disabled={!selectedId}
              />
            </View>
          </>
        )
      }
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.background },
  warningBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.warningBg, marginHorizontal: 16, marginTop: 14, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.warning + '30' },
  warningTxt:      { fontSize: 12, color: C.warning, flex: 1, lineHeight: 17 },
  list:            { padding: 16, gap: 8 },
  card:            { backgroundColor: C.surface, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: C.borderLight },
  cardSelected:    { borderColor: C.error, backgroundColor: '#FFF5F5' },
  radioOuter:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioOuterSelected:{ borderColor: C.error },
  radioDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: C.error },
  codeRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  codeChip:        { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  codeTxt:         { fontSize: 11, fontWeight: '700' },
  sks:             { fontSize: 11, color: C.textMuted },
  courseName:      { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  lecturer:        { fontSize: 11, color: C.textMuted },
  selectedBadge:   { flexShrink: 0 },
  footer:          { padding: 16, paddingBottom: 24, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.borderLight },
});