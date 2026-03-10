import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../convex/_generated/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocus] = useState<string | null>(null);

  const { login } = useAuth();
  const seedAll = useMutation(api.users.seedAll);
  const loginMut = useMutation(api.users.login);

  useEffect(() => { seedAll().catch(() => {}); }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const u = await loginMut({ username: username.trim(), password });
      await login(u as any);
      router.replace('/dashboard');
    } catch (e: any) {
      Alert.alert('Login Gagal', e?.message ?? 'Username atau password salah.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#0D3820" />

      <LinearGradient colors={['#0D3820', '#134F2E', '#1A6B3E']} style={StyleSheet.absoluteFill} />

      {/* Decorative circles */}
      <View style={s.circleA} />
      <View style={s.circleB} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Logo & Hero */}
        <View style={s.hero}>
          <View style={s.logoWrap}>
            <View style={s.logoInner}>
              <Ionicons name="leaf" size={28} color="#1A6B3E" />
            </View>
          </View>
          <Text style={s.heroTitle}>SIA Universitas</Text>
          <Text style={s.heroSub}>Sistem Informasi Akademik</Text>
        </View>

        {/* Form Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Masuk</Text>
          <Text style={s.cardDesc}>Gunakan akun yang telah terdaftar</Text>

          {/* Username */}
          <View style={s.field}>
            <Text style={s.label}>Username</Text>
            <View style={[s.inputWrap, focusField === 'u' && s.inputFocus]}>
              <Ionicons name="person-outline" size={16} color={focusField === 'u' ? '#1A6B3E' : '#8FB09F'} />
              <TextInput
                style={s.input}
                placeholder="Masukkan username"
                placeholderTextColor="#C2D6CB"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                onFocus={() => setFocus('u')}
                onBlur={() => setFocus(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={[s.inputWrap, focusField === 'p' && s.inputFocus]}>
              <Ionicons name="lock-closed-outline" size={16} color={focusField === 'p' ? '#1A6B3E' : '#8FB09F'} />
              <TextInput
                style={s.input}
                placeholder="Masukkan password"
                placeholderTextColor="#C2D6CB"
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocus('p')}
                onBlur={() => setFocus(null)}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={10 as any}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={16} color="#8FB09F" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.88}>
            {loading
              ? <ActivityIndicator size="small" color="#FFF" />
              : <>
                  <Ionicons name="log-in-outline" size={18} color="#FFF" />
                  <Text style={s.btnTxt}>Masuk</Text>
                </>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.regRow} onPress={() => router.push('/register' as any)}>
            <Text style={s.regTxt}>Belum punya akun? <Text style={s.regLink}>Daftar sekarang</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Demo credentials */}
        <View style={s.demo}>
          <Text style={s.demoTitle}>Akun Demo</Text>
          <View style={s.demoRow}>
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
  root:    { flex:1, backgroundColor:'#0D3820' },
  scroll:  { flexGrow:1, justifyContent:'center', paddingHorizontal:22, paddingTop:PT, paddingBottom:40 },

  circleA: { position:'absolute', top:-80, right:-40, width:240, height:240, borderRadius:120, backgroundColor:'rgba(255,255,255,0.05)' },
  circleB: { position:'absolute', bottom:-60, left:-50, width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.04)' },

  hero:      { alignItems:'center', marginBottom:28 },
  logoWrap:  { width:80, height:80, borderRadius:24, backgroundColor:'rgba(255,255,255,0.12)', alignItems:'center', justifyContent:'center', marginBottom:14, borderWidth:1, borderColor:'rgba(255,255,255,0.15)' },
  logoInner: { width:60, height:60, borderRadius:18, backgroundColor:'#FFF', alignItems:'center', justifyContent:'center' },
  heroTitle: { fontSize:26, fontWeight:'800', color:'#FFF', letterSpacing:-0.5 },
  heroSub:   { fontSize:13, color:'rgba(255,255,255,0.65)', marginTop:4 },

  card:      { backgroundColor:'rgba(255,255,255,0.97)', borderRadius:24, padding:22, borderWidth:1, borderColor:'rgba(255,255,255,0.5)', shadowColor:'#0D3820', shadowOffset:{width:0,height:8}, shadowOpacity:0.2, shadowRadius:20, elevation:10 },
  cardTitle: { fontSize:22, fontWeight:'800', color:'#111D16', marginBottom:4 },
  cardDesc:  { fontSize:13, color:'#5A7D6A', marginBottom:20 },

  field:     { marginBottom:14 },
  label:     { fontSize:11, fontWeight:'700', color:'#5A7D6A', marginBottom:7, letterSpacing:0.2 },
  inputWrap: { height:50, flexDirection:'row', alignItems:'center', gap:10, borderRadius:14, backgroundColor:'#F2F6F3', borderWidth:1.5, borderColor:'#CBE0D2', paddingHorizontal:14 },
  inputFocus:{ borderColor:'#1A6B3E', backgroundColor:'#FFF' },
  input:     { flex:1, fontSize:14, color:'#111D16' },

  btn:         { height:52, backgroundColor:'#1A6B3E', borderRadius:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginTop:6, shadowColor:'#0D3820', shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:8, elevation:4 },
  btnDisabled: { opacity:0.6 },
  btnTxt:      { color:'#FFF', fontSize:15, fontWeight:'800' },

  regRow: { alignItems:'center', marginTop:16 },
  regTxt: { fontSize:13, color:'#5A7D6A' },
  regLink:{ color:'#1A6B3E', fontWeight:'800' },

  demo:       { marginTop:16, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:20, padding:16, borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  demoTitle:  { fontSize:12, fontWeight:'700', color:'#FFF', marginBottom:10, opacity:0.8 },
  demoRow:    { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.92)', borderRadius:16, overflow:'hidden' },
  demoBox:    { flex:1, paddingVertical:14, alignItems:'center', gap:3 },
  demoDivider:{ width:1, backgroundColor:'#CBE0D2' },
  demoRole:   { fontSize:10, color:'#5A7D6A' },
  demoUser:   { fontSize:14, fontWeight:'800', color:'#111D16' },
  demoPass:   { fontSize:12, fontWeight:'700', color:'#1A6B3E' },
});