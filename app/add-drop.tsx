import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, PrimaryButton, LoadingScreen, GoldChip } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C from '../constants/Colors';

export default function AddDropScreen() {
  const { user } = useAuth();
  const allCourses = useQuery(api.courses.list);
  const myRegs     = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const addDropMut = useMutation(api.registrations.addDrop);

  const [addId,  setAddId]  = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const [loading, setLoad]  = useState(false);

  if (!allCourses || !myRegs) return <LoadingScreen />;

  const registeredIds = new Set(myRegs.filter(r => r.status === 'registered').map(r => r.courseId));
  const canAdd  = allCourses.filter(c => !registeredIds.has(c._id));
  const canDrop = myRegs.filter(r => r.status === 'registered');

  const handleSave = async () => {
    if (!addId && !dropId) { Alert.alert('Info', 'Pilih MK untuk ditambah atau di-drop.'); return; }
    Alert.alert('Konfirmasi Add/Drop', 'Yakin ingin menyimpan perubahan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Simpan', onPress: async () => {
          setLoad(true);
          try {
            await addDropMut({ userId: user!._id as any, addCourseId: addId as any, dropCourseId: dropId as any });
            Alert.alert('Berhasil', 'Perubahan Add/Drop disimpan.');
            setAddId(null); setDropId(null);
          } catch (e: any) { Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan'); }
          finally { setLoad(false); }
        }
      },
    ]);
  };

  return (
    <View style={s.root}>
      <PageHeader title="Add / Drop Mata Kuliah" subtitle="Tambah atau batalkan pendaftaran MK" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ADD */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: C.primary }]} />
            <Text style={s.sectionTitle}>Tambah Mata Kuliah</Text>
          </View>
          {canAdd.length === 0
            ? <Text style={s.empty}>Tidak ada MK yang bisa ditambahkan.</Text>
            : canAdd.map(c => (
              <TouchableOpacity
                key={c._id}
                style={[s.item, addId === c._id && s.itemActive]}
                onPress={() => setAddId(addId === c._id ? null : c._id)}
                activeOpacity={0.7}
              >
                <View style={s.itemLeft}>
                  <GoldChip label={c.code} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName}>{c.name}</Text>
                    <Text style={s.itemSub}>{c.schedule} · {c.credits} SKS</Text>
                  </View>
                </View>
                {addId === c._id && (
                  <View style={s.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))
          }
        </View>

        {/* DROP */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: C.error }]} />
            <Text style={[s.sectionTitle, { color: C.error }]}>Drop Mata Kuliah</Text>
          </View>
          {canDrop.length === 0
            ? <Text style={s.empty}>Belum ada MK yang terdaftar.</Text>
            : canDrop.map(r => (
              <TouchableOpacity
                key={r._id}
                style={[s.item, s.itemDanger, dropId === r.courseId && s.itemDangerActive]}
                onPress={() => setDropId(dropId === r.courseId ? null : r.courseId)}
                activeOpacity={0.7}
              >
                <View style={s.itemLeft}>
                  <View style={[s.codeBox, { backgroundColor: C.errorBg }]}>
                    <Text style={[s.codeBoxTxt, { color: C.error }]}>{r.course?.code ?? '—'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName}>{r.course?.name ?? 'Mata Kuliah'}</Text>
                    <Text style={s.itemSub}>{r.course?.schedule} · {r.course?.credits ?? 0} SKS</Text>
                  </View>
                </View>
                {dropId === r.courseId && (
                  <View style={[s.checkCircle, { backgroundColor: C.error }]}>
                    <Ionicons name="close" size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))
          }
        </View>

        {/* Summary */}
        {(addId || dropId) && (
          <View style={s.summary}>
            <Text style={s.sumTitle}>Ringkasan Perubahan</Text>
            {addId && <Text style={s.sumAdd}>+ {canAdd.find(c => c._id === addId)?.name}</Text>}
            {dropId && <Text style={s.sumDrop}>− {canDrop.find(r => r.courseId === dropId)?.course?.name}</Text>}
          </View>
        )}

        <View style={s.btnWrap}>
          <PrimaryButton label="Simpan Perubahan" onPress={handleSave} loading={loading} icon="save-outline" />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.background },
  scroll:          { padding: 16 },
  section:         { marginBottom: 20 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionDot:      { width: 3, height: 18, borderRadius: 2 },
  sectionTitle:    { fontSize: 14, fontWeight: '800', color: C.text },
  empty:           { fontSize: 13, color: C.textMuted, fontStyle: 'italic', paddingVertical: 8 },
  item:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 13, padding: 13, marginBottom: 8, borderWidth: 1.5, borderColor: C.borderLight },
  itemActive:      { borderColor: C.primary, backgroundColor: C.primaryPale },
  itemDanger:      { borderColor: C.borderLight },
  itemDangerActive:{ borderColor: C.error, backgroundColor: C.errorBg + '40' },
  itemLeft:        { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  itemName:        { fontSize: 13, fontWeight: '700', color: C.text },
  itemSub:         { fontSize: 11, color: C.textMuted, marginTop: 2 },
  codeBox:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  codeBoxTxt:      { fontSize: 11, fontWeight: '700' },
  checkCircle:     { width: 24, height: 24, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summary:         { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sumTitle:        { fontSize: 12, fontWeight: '800', color: C.text, marginBottom: 8 },
  sumAdd:          { fontSize: 13, color: C.success, marginBottom: 4 },
  sumDrop:         { fontSize: 13, color: C.error },
  btnWrap:         { marginBottom: 24 },
});