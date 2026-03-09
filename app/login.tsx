import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const seedUsers = useMutation(api.users.seedUsers);
  const loginUser = useMutation(api.users.login);

  useEffect(() => { seedUsers(); }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Username dan password harus diisi.');
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser({ username, password });
      await login(user);
      router.replace('/dashboard');
    } catch (error: any) {
      Alert.alert('Login Gagal', error?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, Colors.primaryLight]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoBadge}>
              <Ionicons name="school" size={36} color={Colors.accent} />
            </View>
            <Text style={styles.university}>UNIVERSITAS KLABAT</Text>
            <Text style={styles.systemName}>Sistem Informasi Universitas</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk</Text>
            <Text style={styles.cardSub}>Gunakan akun SIU Anda</Text>

            {/* Username */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={Colors.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
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
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.btnLogin, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading
                  ? <Text style={styles.btnText}>Memuat...</Text>
                  : <Text style={styles.btnText}>MASUK</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={styles.btnRegister}
              onPress={() => router.push('/register')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnRegisterText}>BUAT AKUN BARU</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>© 2025 Universitas Klabat · SIU v1.0</Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: (StatusBar.currentHeight || 44) + 20,
  },
  circle1: {
    position: 'absolute', width: 300, height: 300,
    borderRadius: 150, backgroundColor: 'rgba(232,184,75,0.08)',
    top: -80, right: -80,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 60, left: -60,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoBadge: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(232,184,75,0.4)',
  },
  university: {
    fontSize: 20, fontWeight: '800', color: '#FFFFFF',
    letterSpacing: 0.5, textAlign: 'center',
  },
  systemName: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28, padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 24,
    elevation: 12,
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: Colors.primaryDark, letterSpacing: -0.5 },
  cardSub: { fontSize: 13, color: Colors.textLight, marginTop: 4, marginBottom: 24 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: 14, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, paddingVertical: 14,
    fontSize: 15, color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  eyeBtn: { padding: 6 },
  btnLogin: {
    borderRadius: 14, overflow: 'hidden',
    marginTop: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: Colors.textLight },
  btnRegister: {
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary,
    paddingVertical: 15, alignItems: 'center',
  },
  btnRegisterText: { color: Colors.primary, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 28 },
});
