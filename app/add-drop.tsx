import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, PrimaryButton, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

export default function AddDropScreen() {
  const { user } = useAuth();
  const allCourses = useQuery(api.courses.list);
  const myRegs     = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const addDropMut = useMutation(api.registrations.addDrop);

  const [addId, setAddId]   = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const [loading, setLoad]  = useState(false);

  if (!allCourses || !myRegs) return <LoadingScreen />;

  const active   = myRegs.filter(r => r.status === 'registered');
  const regIds   = new Set(active.map(r => r.courseId));
  const canAdd   = allCourses.filter(c => !regIds.has(c._id));
  const totalSKS = active.reduce((s, r) => s + (r.course?.credits ?? 0), 0);

  const handleSave = async () => {
    if (!addId && !dropId) { Alert.alert('Info', 'Pilih MK untuk ditambah atau di-drop.'); return; }
    Alert.alert('Simpan Perubahan', 'Yakin menyimpan perubahan Add/Drop?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Simpan', onPress: async () => {
          setLoad(true);
          try {
            // Hanya kirim field yang ada nilai (hindari mengirim null/undefined ke Convex)
            const args: { userId: any; addCourseId?: any; dropCourseId?: any } = {
              userId: user!._id as any,
            };
            if (addId)  args.addCourseId  = addId;
            if (dropId) args.dropCourseId = dropId;

            await addDropMut(args);
            Alert.alert('Berhasil', 'Perubahan Add/Drop disimpan.');
            setAddId(null); setDropId(null);
          } catch (e: any) { Alert.alert('Gagal', e?.message); }
          finally { setLoad(false); }
        },
      },
    ]);
  };

  return (
    <View style={s.root}>
      <PageHeader title="Add / Drop MK" subtitle={`SKS aktif: ${totalSKS}`} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Ringkasan perubahan */}
        {(addId || dropId) && (
          <View style={s.summary}>
            <Text style={s.summaryHead}>RINGKASAN PERUBAHAN</Text>
            {addId  && <Text style={s.summaryAdd}>+ {canAdd.find(c => c._id === addId)?.name}</Text>}
            {dropId && <Text style={s.summaryDrop}>− {active.find(r => r.courseId === dropId)?.course?.name}</Text>}
          </View>
        )}

        {/* Tambah MK */}
        <Text style={s.sectionTitle}>Tambah Mata Kuliah ({canAdd.length})</Text>
        {canAdd.length === 0 ? (
          <View style={s.emptyRow}><Text style={s.emptyTxt}>Tidak ada MK yang bisa ditambahkan</Text></View>
        ) : (
          canAdd.map(c => {
            const sel = addId === c._id;
            return (
              <TouchableOpacity key={c._id} style={[s.item, sel && s.itemActive]} onPress={() => setAddId(sel ? null : c._id)}>
                <View style={s.codeTag}><Text style={s.codeTxt}>{c.code}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemName}>{c.name}</Text>
                  <Text style={s.itemSub}>{c.day ?? c.schedule} · {c.credits} SKS</Text>
                </View>
                <View style={[s.chk, sel && s.chkActive]}>
                  {sel && <Ionicons name="checkmark" size={11} color={C.white} />}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Drop MK */}
        <Text style={s.sectionTitle}>Drop Mata Kuliah ({active.length})</Text>
        {active.length === 0 ? (
          <View style={s.emptyRow}><Text style={s.emptyTxt}>Belum ada MK yang terdaftar</Text></View>
        ) : (
          active.map(r => {
            const sel = dropId === r.courseId;
            return (
              <TouchableOpacity key={r._id} style={[s.item, sel && s.itemDanger]} onPress={() => setDropId(sel ? null : r.courseId)}>
                <View style={[s.codeTag, sel && { backgroundColor: C.g600 }]}><Text style={s.codeTxt}>{r.course?.code ?? '—'}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.itemName, sel && { textDecorationLine: 'line-through', color: C.textMuted }]}>{r.course?.name ?? '—'}</Text>
                  <Text style={s.itemSub}>{r.course?.credits ?? 0} SKS · {r.course?.day ?? r.course?.schedule}</Text>
                </View>
                <View style={[s.chk, sel && { backgroundColor: C.g600, borderColor: C.g600 }]}>
                  {sel && <Ionicons name="close" size={11} color={C.white} />}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ marginTop: 12 }}>
          <PrimaryButton label="Simpan Perubahan" onPress={handleSave} loading={loading} icon="save-outline" disabled={!addId && !dropId} />
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  scroll:      { padding: 16 },
  summary:     { backgroundColor: C.ink, borderRadius: R.lg, padding: 14, marginBottom: 12, gap: 6 },
  summaryHead: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  summaryAdd:  { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  summaryDrop: { fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecorationLine: 'line-through' },
  sectionTitle:{ fontSize: 13, fontWeight: '700', color: C.text, marginTop: 16, marginBottom: 8 },
  item:        { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 6, borderWidth: 1.5, borderColor: C.border, ...SH.xs },
  itemActive:  { borderColor: C.ink },
  itemDanger:  { borderColor: C.g400 },
  codeTag:     { backgroundColor: C.ink, borderRadius: R.xs, paddingHorizontal: 7, paddingVertical: 3 },
  codeTxt:     { fontSize: 9, fontWeight: '700', color: C.white },
  itemName:    { fontSize: 12, fontWeight: '600', color: C.text },
  itemSub:     { fontSize: 10, color: C.textMuted, marginTop: 1 },
  chk:         { width: 20, height: 20, borderRadius: R.xs, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  chkActive:   { backgroundColor: C.ink, borderColor: C.ink },
  emptyRow:    { backgroundColor: C.surface, borderRadius: R.md, padding: 14, borderWidth: 1, borderColor: C.border, alignItems: 'center', marginBottom: 6 },
  emptyTxt:    { fontSize: 12, color: C.textMuted, fontStyle: 'italic' },
});