import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import C, { SH, R } from '../constants/Colors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  // Fungsi seedAll ada di convex/users.ts → api.users.seedAll
  const seedAll  = useMutation(api.users.seedAll);
  const loginMut = useMutation(api.users.login);

  // Seed data awal saat app dibuka
  useEffect(() => { seedAll().catch(() => {}); }, []);

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
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoArea}>
          <View style={s.logoBox}>
            <Text style={s.logoTxt}>SIU</Text>
          </View>
          <Text style={s.appName}>Universitas Klabat</Text>
          <Text style={s.appSub}>Sistem Informasi Akademik</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Masuk ke akun Anda</Text>

          {/* Username */}
          <View style={s.field}>
            <Text style={s.label}>Username</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={15} color={C.g400} />
              <TextInput
                style={s.input}
                placeholder="Masukkan username"
                placeholderTextColor={C.textDisabled}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={15} color={C.g400} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Masukkan password"
                placeholderTextColor={C.textDisabled}
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={15} color={C.g400} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={C.white} /> : <Text style={s.btnTxt}>Masuk</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.regRow} onPress={() => router.push('/register' as any)}>
            <Text style={s.regTxt}>Belum punya akun? <Text style={{ fontWeight: '700', color: C.text }}>Daftar sekarang</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Info akun demo */}
        <View style={s.demo}>
          <Text style={s.demoHead}>Akun Demo</Text>
          <View style={s.demoRow}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={s.demoRole}>Mahasiswa</Text>
              <Text style={s.demoCred}>yeremia / 12345</Text>
            </View>
            <View style={{ width: 1, height: 28, backgroundColor: C.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={s.demoRole}>Admin</Text>
              <Text style={s.demoCred}>admin / admin123</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 16;
const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  scroll:   { flexGrow: 1, padding: 24, paddingTop: PT, paddingBottom: 40, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 32, gap: 6 },
  logoBox:  { width: 56, height: 56, borderRadius: R.lg, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...SH.md },
  logoTxt:  { fontSize: 14, fontWeight: '900', color: C.white },
  appName:  { fontSize: 18, fontWeight: '800', color: C.text },
  appSub:   { fontSize: 12, color: C.textMuted },
  card:     { backgroundColor: C.surface, borderRadius: R.xl, padding: 24, borderWidth: 1, borderColor: C.border, ...SH.sm },
  cardTitle:{ fontSize: 14, fontWeight: '600', color: C.textMuted, marginBottom: 20 },
  field:    { marginBottom: 14 },
  label:    { fontSize: 11, fontWeight: '600', color: C.textMuted, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.g100, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 12, height: 46 },
  input:    { flex: 1, fontSize: 14, color: C.text },
  btn:      { height: 46, backgroundColor: C.ink, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnTxt:   { color: C.white, fontSize: 14, fontWeight: '700' },
  regRow:   { alignItems: 'center', marginTop: 16 },
  regTxt:   { fontSize: 13, color: C.textMuted },
  demo:     { marginTop: 14, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  demoHead: { fontSize: 10, fontWeight: '700', color: C.textMuted, marginBottom: 10 },
  demoRow:  { flexDirection: 'row', alignItems: 'center' },
  demoRole: { fontSize: 10, color: C.textMuted },
  demoCred: { fontSize: 12, fontWeight: '700', color: C.text },
});