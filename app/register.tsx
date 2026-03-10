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
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const [name,    setName]    = useState('');
  const [uname,   setUname]   = useState('');
  const [pw,      setPw]      = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string|null>(null);

  const registerMut = useMutation(api.users.register);

  const handleRegister = async () => {
    if (!name.trim() || !uname.trim() || !pw.trim()) { Alert.alert('Perhatian', 'Semua kolom wajib diisi.'); return; }
    if (pw.length < 4) { Alert.alert('Perhatian', 'Password minimal 4 karakter.'); return; }
    setLoading(true);
    try {
      await registerMut({ name:name.trim(), username:uname.trim().toLowerCase(), password:pw });
      Alert.alert('Berhasil!', 'Akun berhasil dibuat. Silakan masuk.', [{ text:'Masuk', onPress:()=>router.back() }]);
    } catch (e: any) { Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan.'); }
    finally { setLoading(false); }
  };

  const fields = [
    { key:'n', label:'Nama Lengkap', ph:'Masukkan nama lengkap', icon:'person-outline' as const,      val:name,  set:setName,  caps:'words' as const, secure:false },
    { key:'u', label:'Username',      ph:'Buat username unik',    icon:'at-outline' as const,          val:uname, set:setUname, caps:'none' as const,  secure:false },
    { key:'p', label:'Password',      ph:'Minimal 4 karakter',    icon:'lock-closed-outline' as const, val:pw,    set:setPw,    caps:'none' as const,  secure:true },
  ];

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios'?'padding':'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDeep} />
      <LinearGradient colors={[C.primaryDeep, C.primaryDark, C.primary]} style={StyleSheet.absoluteFill} />
      <View style={s.circleA} />
      <View style={s.circleB} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backBtn} onPress={()=>router.back()} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={18} color="#FFF" />
        </TouchableOpacity>

        <View style={s.hero}>
          <View style={s.logoWrap}>
            <View style={s.logoInner}><Ionicons name="person-add-outline" size={22} color={C.primary} /></View>
          </View>
          <Text style={s.title}>Buat Akun Baru</Text>
          <Text style={s.sub}>Daftar sebagai mahasiswa Universitas Klabat</Text>
        </View>

        <View style={s.card}>
          {fields.map((f, i) => (
            <View key={f.key} style={i < fields.length-1 ? s.field : s.fieldLast}>
              <Text style={s.label}>{f.label}</Text>
              <View style={[s.inputRow, focused===f.key && s.inputFocus]}>
                <Ionicons name={f.icon} size={16} color={focused===f.key ? C.primary : C.textLight} />
                <TextInput
                  style={s.input}
                  placeholder={f.ph}
                  placeholderTextColor={C.textDisabled}
                  value={f.val}
                  onChangeText={f.set}
                  autoCapitalize={f.caps}
                  secureTextEntry={f.secure && !showPw}
                  onFocus={()=>setFocused(f.key)}
                  onBlur={()=>setFocused(null)}
                />
                {f.secure && (
                  <TouchableOpacity onPress={()=>setShowPw(v=>!v)} hitSlop={10 as any}>
                    <Ionicons name={showPw?'eye-off-outline':'eye-outline'} size={16} color={C.textLight} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={[s.btn, loading && {opacity:0.6}]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator size="small" color={C.white} /> : <Text style={s.btnTxt}>Buat Akun</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.backRow} onPress={()=>router.back()} activeOpacity={0.7}>
          <Text style={s.backTxt}>Sudah punya akun? <Text style={s.backLink}>Masuk</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PT = (StatusBar.currentHeight ?? 44) + 16;
const s = StyleSheet.create({
  root:      { flex:1, backgroundColor:C.primaryDeep },
  scroll:    { flexGrow:1, padding:22, paddingTop:PT, paddingBottom:40 },
  circleA:   { position:'absolute', top:-80, right:-40, width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.05)' },
  circleB:   { position:'absolute', bottom:-60, left:-50, width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.04)' },

  backBtn:   { width:38, height:38, borderRadius:R.full, backgroundColor:'rgba(255,255,255,0.14)', alignItems:'center', justifyContent:'center', marginBottom:24, borderWidth:1, borderColor:'rgba(255,255,255,0.18)' },
  hero:      { alignItems:'center', gap:8, marginBottom:24 },
  logoWrap:  { width:60, height:60, borderRadius:20, backgroundColor:'rgba(255,255,255,0.14)', alignItems:'center', justifyContent:'center', marginBottom:4, borderWidth:1, borderColor:'rgba(255,255,255,0.18)' },
  logoInner: { width:46, height:46, borderRadius:14, backgroundColor:'#FFF', alignItems:'center', justifyContent:'center' },
  title:     { fontSize:22, fontWeight:'800', color:'#FFF', letterSpacing:-0.4 },
  sub:       { fontSize:12, color:'rgba(255,255,255,0.65)', textAlign:'center' },

  card:      { backgroundColor:'rgba(255,255,255,0.97)', borderRadius:22, padding:22, borderWidth:1, borderColor:'rgba(255,255,255,0.5)', ...SH.md },
  field:     { marginBottom:14 },
  fieldLast: {},
  label:     { fontSize:11, fontWeight:'700', color:C.textMuted, marginBottom:7, letterSpacing:0.2 },
  inputRow:  { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.bg, borderRadius:12, borderWidth:1.5, borderColor:C.border, paddingHorizontal:13, height:48 },
  inputFocus:{ borderColor:C.primary, backgroundColor:C.white },
  input:     { flex:1, fontSize:14, color:C.text },

  btn:    { height:50, backgroundColor:C.primary, borderRadius:14, alignItems:'center', justifyContent:'center', marginTop:16, ...SH.sm },
  btnTxt: { color:C.white, fontSize:14, fontWeight:'800' },

  backRow:  { alignItems:'center', marginTop:18 },
  backTxt:  { fontSize:13, color:'rgba(255,255,255,0.7)' },
  backLink: { fontWeight:'800', color:'#FFF' },
});