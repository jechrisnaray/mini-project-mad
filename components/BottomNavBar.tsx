import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
  roles: string[];
};

const STUDENT_ITEMS: NavItem[] = [
  { label: 'Beranda',  icon: 'home-outline',   iconActive: 'home',   route: '/dashboard',    roles: ['student','admin'] },
  { label: 'Nilai',    icon: 'school-outline',  iconActive: 'school', route: '/view-grade',   roles: ['student','admin'] },
  { label: 'Jadwal',   icon: 'calendar-outline',iconActive: 'calendar',route: '/view-schedule',roles: ['student'] },
  { label: 'Layanan',  icon: 'grid-outline',    iconActive: 'grid',   route: '/registration', roles: ['student'] },
  { label: 'Biaya',    icon: 'wallet-outline',  iconActive: 'wallet', route: '/semester-cost',roles: ['student'] },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Beranda',     icon: 'home-outline',   iconActive: 'home',   route: '/dashboard',   roles: ['admin'] },
  { label: 'Lihat Nilai', icon: 'school-outline',  iconActive: 'school', route: '/view-grade',  roles: ['admin'] },
  { label: 'Input Nilai', icon: 'create-outline',  iconActive: 'create', route: '/input-grade', roles: ['admin'] },
];

export default function BottomNavBar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = user.role === 'admin' ? ADMIN_ITEMS : STUDENT_ITEMS;

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.tab}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.indicator} />}
            <Ionicons
              name={isActive ? item.iconActive : item.icon}
              size={22}
              color={isActive ? Colors.navActive : Colors.navInactive}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.navBg,
    borderTopWidth: 1,
    borderTopColor: Colors.navBorder,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.navActive,
  },
  label: {
    fontSize: 10,
    color: Colors.navInactive,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.navActive,
    fontWeight: '700',
  },
});