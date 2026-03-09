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
import { PrimaryButton } from '../components/ui';
import C from '../constants/Colors';

export default function RegisterScreen() {
  const [name,     setName]     = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const registerMut = useMutation(api.users.register);

  const handleRegister = async () => {
    if (!name.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Semua kolom wajib diisi.'); return;
    }
    if (password.length < 4) {
      Alert.alert('Peringatan', 'Password minimal 4 karakter.'); return;
    }
    setLoading(true);
    try {
      await registerMut({ name: name.trim(), username: username.trim().toLowerCase(), password });
      Alert.alert('Berhasil!', 'Akun berhasil dibuat. Silakan login.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[C.primary, C.primaryMid, '#3A8A5C']} style={s.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={s.goldCircle} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.logoArea}>
            <View style={s.logoBox}>
              <Ionicons name="person-add" size={34} color={C.accentBright} />
            </View>
            <Text style={s.title}>Buat Akun Baru</Text>
            <Text style={s.sub}>Daftar sebagai mahasiswa Universitas Klabat</Text>
          </View>

          <View style={s.card}>
            {[
              { label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap', icon: 'person-outline' as const, value: name, onChange: setName, caps: 'words' as const },
              { label: 'Username',     placeholder: 'Buat username unik',     icon: 'at-outline' as const,     value: username, onChange: setUsername, caps: 'none' as const },
            ].map(f => (
              <View key={f.label}>
                <Text style={s.label}>{f.label}</Text>
                <View style={s.inputRow}>
                  <Ionicons name={f.icon} size={17} color={C.textMuted} style={s.inputIcon} />
                  <TextInput
                    style={s.input} placeholder={f.placeholder} placeholderTextColor={C.textMuted}
                    value={f.value} onChangeText={f.onChange} autoCapitalize={f.caps} autoCorrect={false}
                  />
                </View>
              </View>
            ))}

            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={17} color={C.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]} placeholder="Minimal 4 karakter" placeholderTextColor={C.textMuted}
                secureTextEntry={!showPw} value={password} onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={{ padding: 6 }}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 6 }}>
              <PrimaryButton label="Daftar Sekarang" onPress={handleRegister} loading={loading} icon="checkmark-circle-outline" />
            </View>

            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back-outline" size={15} color={C.primary} />
              <Text style={s.backTxt}>Kembali ke Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 24;
const s = StyleSheet.create({
  bg:         { flex: 1 },
  goldCircle: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(212,160,23,0.09)', top: -70, right: -50 },
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: PT },
  logoArea:   { alignItems: 'center', marginBottom: 28 },
  logoBox:    { width: 68, height: 68, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(212,160,23,0.35)' },
  title:      { fontSize: 22, fontWeight: '800', color: '#FFF' },
  sub:        { fontSize: 12, color: 'rgba(255,255,255,0.62)', marginTop: 4, textAlign: 'center' },
  card:       { backgroundColor: C.surface, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 10 },
  label:      { fontSize: 12, fontWeight: '700', color: C.textSub, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, borderRadius: 13, borderWidth: 1.5, borderColor: C.border, marginBottom: 14, paddingHorizontal: 12 },
  inputIcon:  { marginRight: 8 },
  input:      { flex: 1, paddingVertical: 13, fontSize: 15, color: C.text },
  backBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  backTxt:    { fontSize: 13, color: C.primary, fontWeight: '600' },
});