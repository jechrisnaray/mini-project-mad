import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

type StatusKey = 'completed' | 'in_progress' | 'not_started';
type TypeKey = 'ospek' | 'kkn' | 'kku';

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  completed:   { label: 'Selesai',          color: Colors.success, bg: Colors.successLight, icon: 'checkmark-circle' },
  in_progress: { label: 'Sedang Berjalan',  color: Colors.warning, bg: Colors.warningLight, icon: 'time' },
  not_started: { label: 'Belum Dimulai',    color: Colors.textLight, bg: Colors.background, icon: 'ellipse-outline' },
};

const TYPE_CONFIG: Record<TypeKey, { label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; gradient: [string, string] }> = {
  ospek: {
    label: 'Ospek',
    desc: 'Orientasi Studi dan Pengenalan Kampus',
    icon: 'flag-outline',
    gradient: [Colors.primaryDark, Colors.primary],
  },
  kkn: {
    label: 'KKN',
    desc: 'Kuliah Kerja Nyata',
    icon: 'earth-outline',
    gradient: ['#1A5C42', '#2D9B6F'],
  },
  kku: {
    label: 'KKU',
    desc: 'Kuliah Kerja Usaha',
    icon: 'briefcase-outline',
    gradient: ['#553C9A', '#6B46C1'],
  },
};

export default function OspekKknScreen() {
  const { user } = useAuth();
  const data = useQuery(api.ospekKkn.listByUser, user ? { userId: user._id } : 'skip');

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);
  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Ospek & KKN / KKU</Text>
        <Text style={styles.headerSub}>Status kegiatan wajib mahasiswa</Text>
      </LinearGradient>

      {data === undefined ? (
        <View style={styles.centered}><Text style={styles.loadingText}>Memuat data...</Text></View>
      ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={56} color={Colors.border} />
          <Text style={styles.emptyText}>Belum ada data kegiatan.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const typeCfg = TYPE_CONFIG[item.type as TypeKey] ?? {
              label: item.type.toUpperCase(),
              desc: '',
              icon: 'information-circle-outline' as const,
              gradient: [Colors.primaryDark, Colors.primary],
            };
            const statusCfg = STATUS_CONFIG[item.status as StatusKey] ?? STATUS_CONFIG.not_started;

            return (
              <View style={styles.card}>
                {/* Top strip */}
                <LinearGradient
                  colors={typeCfg.gradient}
                  style={styles.cardTop}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <View style={styles.typeIcon}>
                    <Ionicons name={typeCfg.icon} size={24} color={Colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.typeLabel}>{typeCfg.label}</Text>
                    <Text style={styles.typeDesc}>{typeCfg.desc}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name={statusCfg.icon} size={14} color="#FFF" />
                    <Text style={styles.statusBadgeText}>{statusCfg.label}</Text>
                  </View>
                </LinearGradient>

                {/* Body */}
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Tahun</Text>
                      <Text style={styles.infoValue}>{item.year}</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Status</Text>
                      <Text style={[styles.infoValue, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                  </View>
                  {item.notes && (
                    <View style={styles.notesBox}>
                      <Ionicons name="document-text-outline" size={14} color={Colors.textLight} />
                      <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 22, paddingHorizontal: 20, overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(232,184,75,0.1)', top: -60, right: -40,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: Colors.textLight, fontSize: 15 },
  emptyText: { color: Colors.textLight, fontSize: 15, marginTop: 12 },
  list: { padding: 16, gap: 14 },
  card: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTop: {
    padding: 18, flexDirection: 'row',
    alignItems: 'center', gap: 14,
  },
  typeIcon: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  typeLabel: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  typeDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  cardBody: { backgroundColor: '#FFF', padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: 11, color: Colors.textLight, fontWeight: '500', marginBottom: 3 },
  infoValue: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark },
  infoDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  notesBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: Colors.background, borderRadius: 10, padding: 12,
  },
  notesText: { flex: 1, fontSize: 12, color: Colors.textMid, lineHeight: 18 },
});