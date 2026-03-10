/**
 * BottomNavBar.tsx — Botanical Premium Navigation
 */
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
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
  { label:'Beranda',     icon:'home-outline',      iconActive:'home',      route:'/dashboard',    roles:['student','admin'], subRoutes:['/'] },
  { label:'Jadwal',      icon:'calendar-outline',  iconActive:'calendar',  route:'/view-schedule',roles:['student'] },
  { label:'Akademik',    icon:'grid-outline',       iconActive:'grid',      route:'/registration', roles:['student'], subRoutes:['/add-drop','/drop-subject','/teacher-evaluation','/ospek-kkn','/semester-cost'] },
  { label:'Nilai',       icon:'school-outline',    iconActive:'school',    route:'/view-grade',   roles:['student'] },
  { label:'Profil',      icon:'person-outline',    iconActive:'person',    route:'/profile',      roles:['student','admin'] },
  { label:'Input Nilai', icon:'create-outline',    iconActive:'create',    route:'/input-grade',  roles:['admin'] },
  { label:'Rekap',       icon:'bar-chart-outline', iconActive:'bar-chart', route:'/view-grade',   roles:['admin'] },
];

const { width } = Dimensions.get('window');
const PB = Platform.OS === 'ios' ? 22 : 8;

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user }  = useAuth();
  if (!user) return null;

  const items    = NAV.filter(n => n.roles.includes(user.role as any));
  const isActive = (item: NavItem) =>
    pathname === item.route || (item.subRoutes ?? []).includes(pathname);

  return (
    <View style={s.wrap}>
      {/* Decorative top border with gradient tint */}
      <View style={s.topBorder} />
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
              {/* Floating active pill */}
              <View style={[s.pill, active && s.pillActive]}>
                <Ionicons
                  name={active ? item.iconActive : item.icon}
                  size={20}
                  color={active ? C.white : C.g400}
                />
              </View>
              <Text style={[s.lbl, active && s.lblActive]} numberOfLines={1}>
                {item.label}
              </Text>
              {/* Active dot indicator */}
              {active && <View style={s.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: C.surface,
    paddingBottom: PB,
    shadowColor: '#0A2015',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 12,
  },
  topBorder: {
    height: 1.5,
    backgroundColor: C.border,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  pill: {
    width: 44, height: 32,
    borderRadius: R.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  lbl:      { fontSize: 9, fontWeight: '500', color: C.g400, letterSpacing: 0.1 },
  lblActive:{ fontWeight: '700', color: C.primary },
  dot:      {
    position: 'absolute',
    bottom: -2,
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: C.primaryLight,
  },
});