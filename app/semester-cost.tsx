import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingScreen } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

const COST_PER_SKS = 150_000;
const BASE_SPP     = 2_500_000;
const LAB          = 500_000;
const KEMAHASISWAAN= 250_000;
const ASURANSI     = 100_000;
const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function SemesterCostScreen() {
  const { user } = useAuth();
  const regs = useQuery(api.registrations.listByUser, user ? { userId:user._id as any } : 'skip');
  if (!regs) return <LoadingScreen />;

  const active   = regs.filter(r => r.status === 'registered');
  const totalSKS = active.reduce((s,r) => s+(r.course?.credits??0), 0);
  const sksFee   = totalSKS * COST_PER_SKS;
  const total    = BASE_SPP + sksFee + LAB + KEMAHASISWAAN + ASURANSI;

  const items = [
    { label:'SPP Tetap',      desc:'Per semester',                          amount:BASE_SPP,      icon:'school-outline' as const },
    { label:'Biaya SKS',      desc:`${totalSKS} SKS × ${fmt(COST_PER_SKS)}`, amount:sksFee,      icon:'book-outline' as const },
    { label:'Biaya Lab',      desc:'Praktikum & fasilitas',                  amount:LAB,          icon:'flask-outline' as const },
    { label:'Kemahasiswaan',  desc:'Kegiatan & organisasi',                  amount:KEMAHASISWAAN,icon:'people-outline' as const },
    { label:'Asuransi',       desc:'Perlindungan mahasiswa',                 amount:ASURANSI,     icon:'shield-checkmark-outline' as const },
  ];

  return (
    <View style={s.root}>
      <PageHeader title="Biaya Semester" subtitle="Rincian tagihan akademik" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Total Hero */}
        <View style={s.totalCard}>
          <View style={s.totalTop}>
            <Text style={s.totalLabel}>Total Tagihan Semester</Text>
            <View style={s.periodBadge}><Text style={s.periodTxt}>2024/2025 Ganjil</Text></View>
          </View>
          <Text style={s.totalAmt}>{fmt(total)}</Text>
          <View style={s.totalMeta}>
            <View style={s.metaChip}><Ionicons name="book-outline" size={11} color="rgba(255,255,255,0.6)" /><Text style={s.metaTxt}>{totalSKS} SKS</Text></View>
            <View style={s.metaChip}><Ionicons name="list-outline" size={11} color="rgba(255,255,255,0.6)" /><Text style={s.metaTxt}>{active.length} Mata Kuliah</Text></View>
          </View>
        </View>

        {/* Active Courses */}
        {active.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Mata Kuliah Aktif</Text>
            <View style={s.mkTable}>
              <View style={s.mkHead}>
                <Text style={[s.mkHdr, {flex:1}]}>Mata Kuliah</Text>
                <Text style={[s.mkHdr, {width:32, textAlign:'center'}]}>SKS</Text>
                <Text style={[s.mkHdr, {width:90, textAlign:'right'}]}>Biaya</Text>
              </View>
              {active.map((r,i) => (
                <View key={r._id} style={[s.mkRow, i<active.length-1 && s.mkBorder]}>
                  <View style={s.codeTag}><Text style={s.codeTxt}>{r.course?.code ?? '—'}</Text></View>
                  <Text style={[s.mkName, {flex:1}]} numberOfLines={1}>{r.course?.name ?? '—'}</Text>
                  <Text style={[s.mkCell, {width:32, textAlign:'center'}]}>{r.course?.credits ?? 0}</Text>
                  <Text style={[s.mkAmt, {width:90, textAlign:'right'}]}>{fmt((r.course?.credits??0)*COST_PER_SKS)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Breakdown */}
        <View style={s.section}>
          <Text style={s.secTitle}>Rincian Biaya</Text>
          <View style={s.breakCard}>
            {items.map((item, i) => (
              <View key={i} style={[s.row, i<items.length-1 && s.rowBorder]}>
                <View style={s.rowIcon}><Ionicons name={item.icon} size={14} color={C.primary} /></View>
                <View style={{flex:1}}>
                  <Text style={s.rowLabel}>{item.label}</Text>
                  <Text style={s.rowDesc}>{item.desc}</Text>
                </View>
                <Text style={s.rowAmt}>{fmt(item.amount)}</Text>
              </View>
            ))}
            <View style={s.totalRow}>
              <Text style={s.totalRowLbl}>Total</Text>
              <Text style={s.totalRowAmt}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={s.section}>
          <Text style={s.secTitle}>Metode Pembayaran</Text>
          <View style={s.payRow}>
            {['BNI','BRI','Mandiri','BCA'].map(b => (
              <View key={b} style={s.payCard}>
                <Ionicons name="card-outline" size={14} color={C.textSub} />
                <Text style={s.payTxt}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.info}>
          <Ionicons name="information-circle-outline" size={14} color={C.textMuted} />
          <Text style={s.infoTxt}>Biaya bersifat indikatif. Hubungi Bagian Keuangan untuk informasi lebih lanjut.</Text>
        </View>
        <View style={{height:32}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex:1, backgroundColor:C.bg },
  scroll: { padding:16 },

  totalCard:   { backgroundColor:C.primary, borderRadius:R.xl, padding:20, marginBottom:14, ...SH.md },
  totalTop:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  totalLabel:  { fontSize:10, color:'rgba(255,255,255,0.65)', fontWeight:'600', letterSpacing:0.3 },
  periodBadge: { backgroundColor:'rgba(255,255,255,0.16)', borderRadius:R.full, paddingHorizontal:9, paddingVertical:4 },
  periodTxt:   { fontSize:10, color:'rgba(255,255,255,0.8)', fontWeight:'600' },
  totalAmt:    { fontSize:30, fontWeight:'900', color:C.white, letterSpacing:-1, marginBottom:12 },
  totalMeta:   { flexDirection:'row', gap:12 },
  metaChip:    { flexDirection:'row', alignItems:'center', gap:5 },
  metaTxt:     { fontSize:11, color:'rgba(255,255,255,0.65)' },

  section:  { marginBottom:12 },
  secTitle: { fontSize:12, fontWeight:'700', color:C.textMuted, marginBottom:8, letterSpacing:0.2 },

  mkTable:  { backgroundColor:C.surface, borderRadius:R.lg, borderWidth:1, borderColor:C.borderLight, overflow:'hidden', ...SH.xs },
  mkHead:   { flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:12, paddingVertical:9, backgroundColor:C.g50, borderBottomWidth:1, borderBottomColor:C.borderLight },
  mkHdr:    { fontSize:9, fontWeight:'700', color:C.textMuted, letterSpacing:0.5 },
  mkRow:    { flexDirection:'row', alignItems:'center', gap:8, padding:11 },
  mkBorder: { borderBottomWidth:1, borderBottomColor:C.borderLight },
  codeTag:  { backgroundColor:C.primaryFaint, borderRadius:R.xs, paddingHorizontal:6, paddingVertical:2 },
  codeTxt:  { fontSize:8, fontWeight:'700', color:C.primary },
  mkName:   { fontSize:11, color:C.text },
  mkCell:   { fontSize:11, color:C.textMuted },
  mkAmt:    { fontSize:10, fontWeight:'700', color:C.text },

  breakCard: { backgroundColor:C.surface, borderRadius:R.lg, borderWidth:1, borderColor:C.borderLight, overflow:'hidden', ...SH.xs },
  row:       { flexDirection:'row', alignItems:'center', padding:13, gap:10 },
  rowBorder: { borderBottomWidth:1, borderBottomColor:C.borderLight },
  rowIcon:   { width:30, height:30, borderRadius:R.sm, backgroundColor:C.primaryFaint, alignItems:'center', justifyContent:'center' },
  rowLabel:  { fontSize:12, fontWeight:'600', color:C.text },
  rowDesc:   { fontSize:10, color:C.textMuted, marginTop:1 },
  rowAmt:    { fontSize:12, fontWeight:'700', color:C.text },
  totalRow:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:13, backgroundColor:C.primary },
  totalRowLbl:{ fontSize:12, fontWeight:'700', color:'rgba(255,255,255,0.7)' },
  totalRowAmt:{ fontSize:16, fontWeight:'900', color:C.white },

  payRow:  { flexDirection:'row', gap:8 },
  payCard: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor:C.surface, borderRadius:R.md, paddingVertical:12, borderWidth:1, borderColor:C.borderLight, ...SH.xs },
  payTxt:  { fontSize:12, fontWeight:'700', color:C.text },

  info:    { flexDirection:'row', gap:8, alignItems:'flex-start', backgroundColor:C.surface, borderRadius:R.md, padding:12, borderWidth:1, borderColor:C.borderLight },
  infoTxt: { fontSize:11, color:C.textMuted, flex:1, lineHeight:17 },
});