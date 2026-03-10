import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Alert, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

export default function RegisterScreen() {
  const [name,    setName]    = useState('');
  const [uname,   setUname]   = useState('');
  const [pw,      setPw]      = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const registerMut = useMutation(api.users.register);

  const handleRegister = async () => {
    if (!name.trim() || !uname.trim() || !pw.trim()) {
      Alert.alert('Peringatan', 'Semua kolom wajib diisi.');
      return;
    }
    if (pw.length < 4) {
      Alert.alert('Peringatan', 'Password minimal 4 karakter.');
      return;
    }
    setLoading(true);
    try {
      await registerMut({ name: name.trim(), username: uname.trim().toLowerCase(), password: pw });
      Alert.alert('Berhasil!', 'Akun berhasil dibuat. Silakan masuk.', [
        { text: 'Masuk', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan.');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'n', label: 'Nama Lengkap',  ph: 'Masukkan nama lengkap', icon: 'person-outline' as const,      val: name,  set: setName,  caps: 'words' as const, secure: false },
    { key: 'u', label: 'Username',       ph: 'Buat username unik',    icon: 'at-outline' as const,          val: uname, set: setUname, caps: 'none' as const,  secure: false },
    { key: 'p', label: 'Password',       ph: 'Minimal 4 karakter',    icon: 'lock-closed-outline' as const, val: pw,    set: setPw,    caps: 'none' as const,  secure: true  },
  ];

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={16} color={C.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Ionicons name="person-add-outline" size={20} color={C.white} />
          </View>
          <Text style={s.title}>Buat Akun Baru</Text>
          <Text style={s.sub}>Daftar sebagai mahasiswa Universitas Klabat</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          {fields.map((f, i) => (
            <View key={f.key} style={i < fields.length - 1 ? s.field : {}}>
              <Text style={s.label}>{f.label}</Text>
              <View style={[s.inputRow, focused === f.key && s.inputFocus]}>
                <Ionicons name={f.icon} size={15} color={focused === f.key ? C.text : C.g400} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder={f.ph}
                  placeholderTextColor={C.textDisabled}
                  value={f.val}
                  onChangeText={f.set}
                  autoCapitalize={f.caps}
                  secureTextEntry={f.secure && !showPw}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused(null)}
                />
                {f.secure && (
                  <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={10 as any}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={15} color={C.g400} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator size="small" color={C.white} />
              : <Text style={s.btnTxt}>Buat Akun</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.backRow} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backTxt}>Sudah punya akun? <Text style={{ fontWeight: '700', color: C.text }}>Masuk</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 16;
const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  scroll:   { flexGrow: 1, padding: 24, paddingTop: PT, paddingBottom: 40 },

  backBtn:  { width: 36, height: 36, borderRadius: R.sm, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 28 },
  header:   { alignItems: 'center', gap: 8, marginBottom: 24 },
  logoBox:  { width: 52, height: 52, borderRadius: R.lg, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 6, ...SH.md },
  title:    { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  sub:      { fontSize: 12, color: C.textMuted, textAlign: 'center' },

  card:     { backgroundColor: C.surface, borderRadius: R.xl, padding: 24, borderWidth: 1, borderColor: C.border, ...SH.sm, gap: 0 },
  field:    { marginBottom: 14 },
  label:    { fontSize: 11, fontWeight: '600', color: C.textMuted, marginBottom: 6, letterSpacing: 0.2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.g100, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 12, height: 46 },
  inputFocus:{ borderColor: C.ink, backgroundColor: C.white },
  input:    { flex: 1, fontSize: 14, color: C.text },

  btn:      { height: 46, backgroundColor: C.ink, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginTop: 16, ...SH.sm },
  btnTxt:   { color: C.white, fontSize: 14, fontWeight: '700' },

  backRow:  { alignItems: 'center', marginTop: 20 },
  backTxt:  { fontSize: 13, color: C.textMuted },
});