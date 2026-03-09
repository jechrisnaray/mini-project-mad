import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerUser = useMutation(api.users.register);

  const handleRegister = async () => {
    if (!name.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Semua field harus diisi.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ name, username, password });
      Alert.alert('Berhasil', 'Akun berhasil dibuat! Silakan login.');
      router.back();
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#0F3D2E', '#1A5C42', '#2D9B6F']}
        style={styles.container}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.circle1} />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <View style={styles.logoBadge}>
              <Ionicons name="person-add" size={34} color="#A7F3D0" />
            </View>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>Daftar sebagai mahasiswa SIU</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="at-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={Colors.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 6 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnRegister, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1A5C42', '#2D9B6F']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.btnText}>{loading ? 'Mendaftar...' : 'DAFTAR SEKARANG'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back-outline" size={16} color={Colors.success} />
              <Text style={styles.backText}>Kembali ke Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1, justifyContent: 'center', padding: 24,
    paddingTop: (StatusBar.currentHeight || 44) + 20,
  },
  circle1: {
    position: 'absolute', width: 300, height: 300,
    borderRadius: 150, backgroundColor: 'rgba(45,155,111,0.15)',
    top: -80, right: -80,
  },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoBadge: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(167,243,208,0.4)',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 28, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 12,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: 14, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text,
  },
  btnRegister: {
    borderRadius: 14, overflow: 'hidden', marginTop: 6,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginTop: 18, gap: 6,
  },
  backText: { color: Colors.success, fontSize: 14, fontWeight: '600' },
});