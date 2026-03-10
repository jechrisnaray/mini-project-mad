import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import C, { R } from '../constants/Colors';

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
  roles: ('student' | 'admin')[];
  subRoutes?: string[];
};

const NAV: NavItem[] = [
  { label:'Beranda',   icon:'home-outline',      iconActive:'home',      route:'/dashboard',    roles:['student','admin'], subRoutes:['/'] },
  { label:'Jadwal',    icon:'calendar-outline',  iconActive:'calendar',  route:'/view-schedule',roles:['student'] },
  { label:'Akademik',  icon:'grid-outline',       iconActive:'grid',      route:'/registration', roles:['student'], subRoutes:['/add-drop','/drop-subject','/teacher-evaluation','/ospek-kkn','/semester-cost'] },
  { label:'Nilai',     icon:'school-outline',    iconActive:'school',    route:'/view-grade',   roles:['student'] },
  { label:'Profil',    icon:'person-outline',    iconActive:'person',    route:'/profile',      roles:['student','admin'] },
  { label:'Nilai',     icon:'create-outline',    iconActive:'create',    route:'/input-grade',  roles:['admin'] },
  { label:'Rekap',     icon:'bar-chart-outline', iconActive:'bar-chart', route:'/view-grade',   roles:['admin'] },
];

const PB = Platform.OS === 'ios' ? 24 : 10;

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV.filter(n => n.roles.includes(user.role as any));
  const isActive = (item: NavItem) => pathname === item.route || (item.subRoutes ?? []).includes(pathname);

  return (
    <View style={s.wrap}>
      <View style={s.bar}>
        {items.map(item => {
          const active = isActive(item);
          return (
            <TouchableOpacity
              key={item.route + item.label}
              style={s.tab}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[s.pill, active && s.pillActive]}>
                <Ionicons name={active ? item.iconActive : item.icon} size={20} color={active ? C.white : C.textLight} />
              </View>
              <Text style={[s.lbl, active && s.lblActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor:C.surface, paddingBottom:PB, borderTopWidth:1, borderTopColor:C.borderLight, shadowColor:'#0D3820', shadowOffset:{width:0,height:-2}, shadowOpacity:0.07, shadowRadius:8, elevation:8 },
  bar:  { flexDirection:'row', paddingTop:8, paddingHorizontal:6 },
  tab:  { flex:1, alignItems:'center', gap:3 },
  pill: { width:42, height:30, borderRadius:R.full, alignItems:'center', justifyContent:'center' },
  pillActive: { backgroundColor:C.primary, shadowColor:C.primary, shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:5, elevation:3 },
  lbl:       { fontSize:9, fontWeight:'500', color:C.textLight },
  lblActive: { fontWeight:'700', color:C.primary },
});