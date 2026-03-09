import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/ui';
import C from '../constants/Colors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { login }  = useAuth();
  const seedUsers  = useMutation(api.users.seedUsers);
  const loginMut   = useMutation(api.users.login);

  // Auto-seed saat pertama kali
  useState(() => { seedUsers().catch(() => {}); });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Username dan password wajib diisi.'); return;
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={[C.primary, C.primaryMid, '#3A8A5C']}
        style={s.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Decorative gold circles */}
        <View style={s.goldCircle1} />
        <View style={s.goldCircle2} />
        <View style={s.leafShape} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo area */}
          <View style={s.logoArea}>
            <View style={s.logoBox}>
              <Ionicons name="school" size={40} color={C.accentBright} />
            </View>
            <Text style={s.logoText}>SIU</Text>
            <Text style={s.logoSub}>Universitas Klabat</Text>
            {/* Gold divider */}
            <View style={s.goldDivider} />
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Selamat Datang</Text>
            <Text style={s.cardSub}>Masuk dengan akun akademik Anda</Text>

            {/* Username */}
            <Text style={s.label}>Username</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={17} color={C.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Masukkan username"
                placeholderTextColor={C.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={17} color={C.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Masukkan password"
                placeholderTextColor={C.textMuted}
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={{ padding: 6 }}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 6 }}>
              <PrimaryButton label="Masuk" onPress={handleLogin} loading={loading} icon="log-in-outline" />
            </View>

            {/* Gold accent line */}
            <View style={s.orRow}>
              <View style={s.orLine} />
              <Text style={s.orText}>atau</Text>
              <View style={s.orLine} />
            </View>

            <TouchableOpacity style={s.regBtn} onPress={() => router.push('/register' as any)}>
              <Text style={s.regTxt}>
                Belum punya akun?{' '}
                <Text style={{ color: C.primary, fontWeight: '800' }}>Daftar di sini</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={s.footer}>© 2025 Universitas Klabat · SIU v1.0</Text>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 24;
const s = StyleSheet.create({
  bg:          { flex: 1 },
  goldCircle1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(212,160,23,0.10)', top: -80, right: -60 },
  goldCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60,  backgroundColor: 'rgba(212,160,23,0.07)', bottom: 120, left: -40 },
  leafShape:   { position: 'absolute', width: 80,  height: 80,  borderRadius: 40,  backgroundColor: 'rgba(255,255,255,0.05)', top: 200, left: 20 },
  scroll:      { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: PT },
  logoArea:    { alignItems: 'center', marginBottom: 28 },
  logoBox:     { width: 76, height: 76, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(212,160,23,0.4)' },
  logoText:    { fontSize: 30, fontWeight: '900', color: '#FFF', letterSpacing: 4 },
  logoSub:     { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4, letterSpacing: 0.5 },
  goldDivider: { width: 50, height: 2, backgroundColor: C.accentBright, borderRadius: 2, marginTop: 14, opacity: 0.8 },
  card:        { backgroundColor: C.surface, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 12 },
  cardTitle:   { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4 },
  cardSub:     { fontSize: 12, color: C.textMuted, marginBottom: 20 },
  label:       { fontSize: 12, fontWeight: '700', color: C.textSub, marginBottom: 6 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, borderRadius: 13, borderWidth: 1.5, borderColor: C.border, marginBottom: 14, paddingHorizontal: 12 },
  inputIcon:   { marginRight: 8 },
  input:       { flex: 1, paddingVertical: 13, fontSize: 15, color: C.text },
  orRow:       { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  orLine:      { flex: 1, height: 1, backgroundColor: C.borderLight },
  orText:      { fontSize: 12, color: C.textMuted },
  regBtn:      { alignItems: 'center' },
  regTxt:      { fontSize: 13, color: C.textSub },
  footer:      { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 24 },
});