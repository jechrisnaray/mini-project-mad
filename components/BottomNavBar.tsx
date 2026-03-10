/**
 * BottomNavBar.tsx — Improved bottom navigation
 * - Student: Beranda / Jadwal / Akademik / Nilai / Profil
 * - Admin:   Beranda / Input Nilai / Rekap Nilai / Profil
 */
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, Dimensions,
} from 'react-native';
import { usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import C, { SH, R } from '../constants/Colors';

type NavItem = {
  label:      string;
  icon:       keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route:      string;
  roles:      ('student' | 'admin')[];
  subRoutes?: string[];
};

const NAV: NavItem[] = [
  { label:'Beranda',     icon:'home-outline',      iconActive:'home',       route:'/dashboard',    roles:['student','admin'], subRoutes:['/'] },
  { label:'Jadwal',      icon:'calendar-outline',  iconActive:'calendar',   route:'/view-schedule',roles:['student'] },
  { label:'Akademik',    icon:'grid-outline',      iconActive:'grid',       route:'/registration', roles:['student'], subRoutes:['/add-drop','/drop-subject','/teacher-evaluation','/ospek-kkn','/semester-cost'] },
  { label:'Nilai',       icon:'school-outline',    iconActive:'school',     route:'/view-grade',   roles:['student'] },
  { label:'Profil',      icon:'person-outline',    iconActive:'person',     route:'/profile',      roles:['student','admin'] },
  { label:'Input Nilai', icon:'create-outline',    iconActive:'create',     route:'/input-grade',  roles:['admin'] },
  { label:'Rekap Nilai', icon:'bar-chart-outline', iconActive:'bar-chart',  route:'/view-grade',   roles:['admin'] },
];

const { width } = Dimensions.get('window');

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV.filter(n => n.roles.includes(user.role as any));
  const isActive = (item: NavItem) =>
    pathname === item.route || (item.subRoutes ?? []).includes(pathname);

  const pillW = Math.min(52, (width / items.length) - 8);

  return (
    <View style={s.container}>
      <View style={s.topLine} />
      <View style={s.bar}>
        {items.map(item => {
          const active = isActive(item);
          return (
            <TouchableOpacity key={item.route+item.label} style={s.tab} onPress={() => router.push(item.route as any)} activeOpacity={0.75}>
              <View style={[s.iconPill, active && s.iconPillActive, { width: pillW }]}>
                <Ionicons name={active ? item.iconActive : item.icon} size={19} color={active ? C.white : C.g500} />
              </View>
              <Text style={[s.label, active && s.labelActive]} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const PB = Platform.OS === 'ios' ? 20 : 6;
const s  = StyleSheet.create({
  container:      { backgroundColor:C.surface, paddingBottom:PB, shadowColor:'#000', shadowOffset:{width:0,height:-2}, shadowOpacity:0.06, shadowRadius:8, elevation:8 },
  topLine:        { height:1, backgroundColor:C.border, opacity:0.6 },
  bar:            { flexDirection:'row', paddingTop:8, paddingHorizontal:4 },
  tab:            { flex:1, alignItems:'center', gap:3 },
  iconPill:       { height:28, borderRadius:R.full, alignItems:'center', justifyContent:'center' },
  iconPillActive: { backgroundColor:C.ink },
  label:          { fontSize:9, fontWeight:'500', color:C.g500, letterSpacing:0.1 },
  labelActive:    { fontWeight:'700', color:C.text },
});