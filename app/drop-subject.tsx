/**
 * drop-subject.tsx — Halaman drop mata kuliah
 *
 * Perubahan: UI diseragamkan dengan halaman lain (gradient header,
 * kartu modern, warna soft). Sebelumnya tampilan masih polos.
 */

import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

export default function DropSubjectScreen() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Id<'courses'> | null>(null);
  const [loading, setLoading] = useState(false);

  const registrations = useQuery(
    api.registrations.listByUser,
    user ? { userId: user._id as any } : 'skip'
  );
  const drop = useMutation(api.registrations.drop);

  useEffect(() => { if (!user) router.replace('/login'); }, [user]);
  if (!user) return null;

  if (registrations === undefined) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
          <View style={styles.headerDecor} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drop Mata Kuliah</Text>
        </LinearGradient>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </View>
    );
  }

  const registered = registrations.filter((r) => r.status === 'registered');

  const handleDrop = async () => {
    if (!selected) {
      Alert.alert('Pilih mata kuliah yang akan di-drop');
      return;
    }
    Alert.alert(
      'Konfirmasi Drop',
      `Anda yakin ingin men-drop mata kuliah ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Drop', style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await drop({ userId: user._id as any, courseId: selected });
              Alert.alert('Berhasil ✓', 'Mata kuliah berhasil di-drop.');
              setSelected(null);
            } catch (error: any) {
              Alert.alert('Gagal', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drop Mata Kuliah</Text>
        <Text style={styles.headerSub}>
          {registered.length} mata kuliah terdaftar
        </Text>
      </LinearGradient>

      {registered.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle-outline" size={60} color={Colors.success} />
          <Text style={styles.emptyTitle}>Tidak Ada Mata Kuliah</Text>
          <Text style={styles.emptySub}>Anda belum mendaftar mata kuliah apapun.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={registered}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selected === item.courseId;
              return (
                <TouchableOpacity
                  style={[styles.courseCard, isSelected && styles.courseCardSelected]}
                  onPress={() => setSelected(isSelected ? null : item.courseId)}
                  activeOpacity={0.8}
                >
                  {/* Badge kode */}
                  <View style={[
                    styles.codeBadge,
                    { backgroundColor: isSelected ? Colors.error : Colors.primaryLight },
                  ]}>
                    <Text style={[
                      styles.codeText,
                      { color: isSelected ? '#FFF' : Colors.primaryDark },
                    ]}>
                      {item.course?.code}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{item.course?.name}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="book-outline" size={12} color={Colors.textLight} />
                      <Text style={styles.metaText}>{item.course?.credits} SKS</Text>
                      <Text style={styles.dot}>·</Text>
                      <Ionicons name="person-outline" size={12} color={Colors.textLight} />
                      <Text style={styles.metaText}>{item.course?.lecturer}</Text>
                    </View>
                  </View>

                  {/* Indikator seleksi */}
                  <Ionicons
                    name={isSelected ? 'close-circle' : 'ellipse-outline'}
                    size={24}
                    color={isSelected ? Colors.error : Colors.border}
                  />
                </TouchableOpacity>
              );
            }}
          />

          {/* Tombol drop */}
          <View style={styles.footer}>
            {selected && (
              <View style={styles.selectedInfo}>
                <Ionicons name="warning-outline" size={16} color={Colors.error} />
                <Text style={styles.selectedInfoText}>
                  Siap di-drop: {registered.find((r) => r.courseId === selected)?.course?.name}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.dropBtn, (!selected || loading) && styles.dropBtnDisabled]}
              onPress={handleDrop}
              disabled={!selected || loading}
              activeOpacity={0.85}
            >
              <Ionicons
                name={loading ? 'hourglass-outline' : 'trash-outline'}
                size={20} color="#FFF"
              />
              <Text style={styles.dropBtnText}>
                {loading ? 'Memproses...' : 'Drop Mata Kuliah'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingBottom: 22, paddingHorizontal: 20, overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(240,192,64,0.1)', top: -60, right: -40,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: Colors.textLight, fontSize: 15 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 16 },
  emptySub:    { fontSize: 13, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
  list:        { padding: 16, gap: 10 },

  courseCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#1A3A9C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1.5, borderColor: Colors.borderLight,
  },
  courseCardSelected: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  codeBadge: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  codeText:   { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 5 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaText:   { fontSize: 11, color: Colors.textLight },
  dot:        { color: Colors.border, fontSize: 11 },

  footer: {
    padding: 16, paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    gap: 10,
  },
  selectedInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: '#FCA5A5',
  },
  selectedInfoText: { flex: 1, fontSize: 12, color: Colors.error, fontWeight: '600' },
  dropBtn: {
    backgroundColor: Colors.error, borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  dropBtnDisabled: { backgroundColor: Colors.textLight },
  dropBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});