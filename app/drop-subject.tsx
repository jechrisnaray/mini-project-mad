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
  const myRegs  = useQuery(api.registrations.listByUser, user ? { userId:user._id as any } : 'skip');
  const dropMut = useMutation(api.registrations.drop);
  const [sel, setSel]       = useState<string|null>(null);
  const [loading, setLoad]  = useState(false);

  if (!myRegs) return <LoadingScreen />;
  const registered = myRegs.filter(r => r.status === 'registered');
  const chosen     = registered.find(r => r.courseId === sel);

  const handleDrop = () => {
    if (!sel) { Alert.alert('Info', 'Pilih mata kuliah.'); return; }
    Alert.alert(
      'Konfirmasi Drop',
      `Batalkan "${chosen?.course?.name}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      [
        { text:'Batal', style:'cancel' },
        { text:'Drop', style:'destructive', onPress: async () => {
          setLoad(true);
          try {
            await dropMut({ userId:user!._id as any, courseId:sel as any });
            Alert.alert('Berhasil', 'Mata kuliah berhasil di-drop.');
            setSel(null);
          } catch (e: any) { Alert.alert('Gagal', e?.message); }
          finally { setLoad(false); }
        }},
      ]
    );
  };

  return (
    <View style={s.root}>
      <PageHeader title="Drop Mata Kuliah" subtitle={`${registered.length} MK aktif`} />
      {registered.length === 0
        ? <EmptyState icon="clipboard-outline" title="Tidak Ada MK Aktif" subtitle="Belum terdaftar di mata kuliah manapun" />
        : <>
            <View style={s.warn}>
              <Ionicons name="alert-circle-outline" size={16} color={C.warning} />
              <Text style={s.warnTxt}>Drop MK <Text style={{fontWeight:'700', color:C.text}}>tidak dapat dibatalkan</Text>. Pilih dengan hati-hati.</Text>
            </View>

            <FlatList
              data={registered}
              keyExtractor={i => i._id}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSel = sel === item.courseId;
                return (
                  <TouchableOpacity style={[s.card, isSel && s.cardSel]} onPress={()=>setSel(isSel?null:item.courseId)} activeOpacity={0.78}>
                    <View style={[s.radio, isSel && s.radioSel]}>{isSel && <View style={s.radioDot} />}</View>
                    <View style={{flex:1}}>
                      <View style={s.topRow}>
                        <View style={[s.code, isSel && {backgroundColor:C.danger}]}>
                          <Text style={[s.codeTxt, isSel && {color:C.white}]}>{item.course?.code ?? '—'}</Text>
                        </View>
                        <Text style={s.sks}>{item.course?.credits ?? 0} SKS</Text>
                      </View>
                      <Text style={[s.name, isSel && {textDecorationLine:'line-through', color:C.textMuted}]}>{item.course?.name ?? '—'}</Text>
                      <Text style={s.sub}>{item.course?.day} · {item.course?.time} · {item.course?.room}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={s.footer}>
              {sel && chosen && (
                <View style={s.selInfo}>
                  <Text style={s.selLbl}>Akan di-drop:</Text>
                  <Text style={s.selVal} numberOfLines={1}>{chosen.course?.name}</Text>
                </View>
              )}
              <PrimaryButton label={sel?'Drop Mata Kuliah':'Pilih MK Terlebih Dahulu'} onPress={handleDrop} loading={loading} danger icon="trash-outline" disabled={!sel} />
            </View>
          </>
      }
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:C.bg },
  warn:    { flexDirection:'row', alignItems:'flex-start', gap:10, margin:14, backgroundColor:C.goldFaint, borderRadius:R.md, padding:13, borderWidth:1, borderColor:C.goldLight },
  warnTxt: { fontSize:12, color:C.textMuted, flex:1, lineHeight:18 },
  list:    { padding:14, gap:7 },

  card:    { backgroundColor:C.surface, borderRadius:R.lg, padding:14, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1.5, borderColor:C.borderLight, ...SH.xs },
  cardSel: { borderColor:C.danger, backgroundColor:'#FDF5F5' },
  radio:   { width:20, height:20, borderRadius:10, borderWidth:2, borderColor:C.border, alignItems:'center', justifyContent:'center', flexShrink:0 },
  radioSel:{ borderColor:C.danger },
  radioDot:{ width:8, height:8, borderRadius:4, backgroundColor:C.danger },

  topRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:3 },
  code:   { backgroundColor:C.primaryFaint, borderRadius:R.xs, paddingHorizontal:7, paddingVertical:2 },
  codeTxt:{ fontSize:9, fontWeight:'700', color:C.primary },
  sks:    { fontSize:11, color:C.textMuted },
  name:   { fontSize:13, fontWeight:'600', color:C.text, marginBottom:2 },
  sub:    { fontSize:10, color:C.textMuted },

  footer:  { padding:16, paddingBottom:24, backgroundColor:C.surface, borderTopWidth:1, borderTopColor:C.borderLight, gap:10, ...SH.sm },
  selInfo: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.dangerLight, borderRadius:R.sm, padding:10, borderWidth:1, borderColor:'#F5C5C0' },
  selLbl:  { fontSize:10, color:C.danger, fontWeight:'700', flexShrink:0 },
  selVal:  { fontSize:11, fontWeight:'600', color:C.text, flex:1 },
});

export default DropSubjectScreen;