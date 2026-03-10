import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import C, { SH, R } from '../constants/Colors';

// Header halaman dengan tombol back opsional
export function PageHeader({ title, subtitle, showBack = true, right }: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerInner}>
        {showBack && (
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color={C.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
        </View>
        {right && <View>{right}</View>}
      </View>
    </View>
  );
}

// Tampilan loading
export function LoadingScreen() {
  return (
    <View style={s.loading}>
      <ActivityIndicator size="small" color={C.text} />
      <Text style={s.loadingTxt}>Memuat...</Text>
    </View>
  );
}

// Tampilan kosong / empty state
export function EmptyState({ icon, title, subtitle }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={22} color={C.g400} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle && <Text style={s.emptySub}>{subtitle}</Text>}
    </View>
  );
}

// Tombol utama
export function PrimaryButton({ label, onPress, loading = false, icon, danger = false, disabled = false }: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  disabled?: boolean;
}) {
  const off = loading || disabled;
  return (
    <TouchableOpacity
      style={[s.btn, danger && s.btnDanger, off && s.btnOff]}
      onPress={onPress}
      disabled={off}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={C.white} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={15} color={C.white} />}
          <Text style={s.btnTxt}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const PT = (StatusBar.currentHeight ?? 0);

const s = StyleSheet.create({
  // PageHeader
  header:      { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, paddingTop: PT },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:     { width: 34, height: 34, borderRadius: R.sm, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  title:       { fontSize: 16, fontWeight: '700', color: C.text },
  subtitle:    { fontSize: 11, color: C.textMuted, marginTop: 1 },

  // LoadingScreen
  loading:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, gap: 10 },
  loadingTxt: { fontSize: 12, color: C.textMuted },

  // EmptyState
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  emptyIcon:  { width: 52, height: 52, borderRadius: R.lg, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: C.text, textAlign: 'center' },
  emptySub:   { fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 18 },

  // PrimaryButton
  btn:       { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.ink, borderRadius: R.md, ...SH.sm },
  btnDanger: { backgroundColor: C.g700 },
  btnOff:    { opacity: 0.45 },
  btnTxt:    { color: C.white, fontSize: 14, fontWeight: '700' },
});