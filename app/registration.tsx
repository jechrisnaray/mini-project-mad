import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Badge, GoldChip, EmptyState, LoadingScreen } from '../components/ui';
import C from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function RegistrationScreen() {
  const { user } = useAuth();
  const allCourses = useQuery(api.courses.list);
  const myRegs     = useQuery(api.registrations.listByUser, user ? { userId: user._id as any } : 'skip');
  const registerMut = useMutation(api.registrations.register);

  if (!allCourses || !myRegs) return <LoadingScreen />;

  const registeredIds = new Set(
    myRegs.filter(r => r.status === 'registered').map(r => r.courseId)
  );
  const available = allCourses.filter(c => !registeredIds.has(c._id));

  const handleRegister = (courseId: string, name: string) => {
    Alert.alert('Konfirmasi', `Daftar mata kuliah "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Daftar', onPress: async () => {
          try {
            await registerMut({ userId: user!._id as any, courseId: courseId as any });
            Alert.alert('Berhasil', `Berhasil mendaftar ${name}`);
          } catch (e: any) { Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan'); }
        }
      },
    ]);
  };

  return (
    <View style={s.root}>
      <PageHeader title="Registrasi Mata Kuliah" subtitle={`${available.length} MK tersedia`} />

      {available.length === 0
        ? <EmptyState icon="checkmark-circle-outline" title="Semua MK Sudah Didaftarkan" subtitle="Anda telah terdaftar di semua mata kuliah yang tersedia" />
        : (
          <FlatList
            data={available}
            keyExtractor={i => i._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const filled = item.quota - (item.quota ?? 0);
              const quotaColor = item.quota > 5 ? C.success : C.warning;
              return (
                <View style={s.card}>
                  <View style={s.cardTop}>
                    <GoldChip label={item.code} />
                    <Badge label={`${item.credits} SKS`} color={C.primary} bg={C.primaryLight} />
                  </View>
                  <Text style={s.courseName}>{item.name}</Text>

                  <View style={s.infoRow}>
                    <Ionicons name="time-outline" size={13} color={C.textMuted} />
                    <Text style={s.infoTxt}>{item.schedule}</Text>
                  </View>
                  <View style={s.infoRow}>
                    <Ionicons name="person-outline" size={13} color={C.textMuted} />
                    <Text style={s.infoTxt}>{item.lecturer}</Text>
                  </View>

                  <View style={s.cardBottom}>
                    <View style={[s.quotaChip, { backgroundColor: quotaColor + '18' }]}>
                      <Ionicons name="people-outline" size={12} color={quotaColor} />
                      <Text style={[s.quotaTxt, { color: quotaColor }]}>Kuota: {item.quota}</Text>
                    </View>
                    <TouchableOpacity style={s.addBtn} onPress={() => handleRegister(item._id, item.name)} activeOpacity={0.8}>
                      <LinearGradient colors={[C.primary, C.primaryMid]} style={s.addGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                        <Ionicons name="add" size={16} color="#FFF" />
                        <Text style={s.addTxt}>Daftar</Text>
                      </LinearGradient>
                    </TouchableOpacity>
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

import { LinearGradient } from 'expo-linear-gradient';
const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.background },
  list:       { padding: 16, gap: 10 },
  card:       { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.borderLight, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  courseName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 8 },
  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  infoTxt:    { fontSize: 12, color: C.textSub },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  quotaChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  quotaTxt:   { fontSize: 11, fontWeight: '600' },
  addBtn:     { borderRadius: 10, overflow: 'hidden' },
  addGrad:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8 },
  addTxt:     { fontSize: 13, fontWeight: '700', color: '#FFF' },
});