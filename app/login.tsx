import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SH } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../convex/_generated/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const seedAll = useMutation(api.users.seedAll);
  const loginMut = useMutation(api.users.login);

  useEffect(() => {
    seedAll().catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const u = await loginMut({ username: username.trim(), password });
      await login(u as any);
      router.replace('/dashboard');
    } catch (e: any) {
      Alert.alert('Login Gagal', e?.message ?? 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E2749" />

      <LinearGradient
        colors={['#1E2749', '#25315C', '#33406E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.bgCircleTop} />
      <View style={s.bgCircleBottom} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <View style={s.logoWrap}>
            <LinearGradient
              colors={['#FFFFFF', '#EEF2FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.logoInner}
            >
              <Ionicons name="school-outline" size={28} color="#2D3A67" />
            </LinearGradient>
          </View>

          <Text style={s.heroTitle}>Sistem Informasi Akademik</Text>
          <Text style={s.heroSubtitle}>
            Masuk untuk melanjutkan ke layanan akademik Anda
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Masuk</Text>
          <Text style={s.cardDesc}>
            Gunakan username dan password yang telah terdaftar
          </Text>

          <View style={s.field}>
            <Text style={s.label}>Username</Text>
            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#64748B" />
              <TextInput
                style={s.input}
                placeholder="Masukkan username"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
              <TextInput
                style={s.input}
                placeholder="Masukkan password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#2F4C8F', '#3E5FA8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.btnGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                  <Text style={s.btnTxt}>Masuk</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.regRow} onPress={() => router.push('/register' as any)}>
            <Text style={s.regTxt}>
              Belum punya akun? <Text style={s.regLink}>Daftar sekarang</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.demoCard}>
          <Text style={s.demoTitle}>Akun Demo</Text>

          <View style={s.demoGrid}>
            <View style={s.demoBox}>
              <Text style={s.demoRole}>Mahasiswa</Text>
              <Text style={s.demoUser}>yeremia</Text>
              <Text style={s.demoPass}>12345</Text>
            </View>

            <View style={s.demoDivider} />

            <View style={s.demoBox}>
              <Text style={s.demoRole}>Admin</Text>
              <Text style={s.demoUser}>admin</Text>
              <Text style={s.demoPass}>admin123</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 16;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1E2749',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: PT,
    paddingBottom: 40,
  },

  bgCircleTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  bgCircleBottom: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoWrap: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 18,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 22,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },

  inputWrap: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  eyeBtn: {
    paddingLeft: 6,
    paddingVertical: 4,
  },

  btn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    ...SH.sm,
  },

  btnGradient: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  btnDisabled: {
    opacity: 0.75,
  },

  btnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  regRow: {
    alignItems: 'center',
    marginTop: 18,
  },

  regTxt: {
    fontSize: 13,
    color: '#64748B',
  },

  regLink: {
    color: '#2F4C8F',
    fontWeight: '800',
  },

  demoCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  demoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  demoGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    overflow: 'hidden',
  },

  demoBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  demoDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },

  demoRole: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },

  demoUser: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  demoPass: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F4C8F',
    marginTop: 2,
  },
});