import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import C from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

type Tab = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  route: string;
  roles: ('student' | 'admin')[];
};

const TABS: Tab[] = [
  { label: 'Beranda',     icon: 'home-outline',     iconFilled: 'home',     route: '/dashboard',    roles: ['student', 'admin'] },
  { label: 'Nilai',       icon: 'school-outline',   iconFilled: 'school',   route: '/view-grade',   roles: ['student', 'admin'] },
  { label: 'Jadwal',      icon: 'calendar-outline', iconFilled: 'calendar', route: '/view-schedule',roles: ['student'] },
  { label: 'Layanan',     icon: 'grid-outline',     iconFilled: 'grid',     route: '/registration', roles: ['student'] },
  { label: 'Input Nilai', icon: 'create-outline',   iconFilled: 'create',   route: '/input-grade',  roles: ['admin'] },
];

export default function BottomNavBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const tabs = TABS.filter(t => t.roles.includes(user.role));

  return (
    <View style={s.bar}>
      {tabs.map(tab => {
        const active = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            style={s.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <View style={[s.iconWrap, active && s.iconActive]}>
              <Ionicons
                name={active ? tab.iconFilled : tab.icon}
                size={20}
                color={active ? '#FFF' : C.navInactive}
              />
            </View>
            <Text style={[s.label, active && s.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.navBg,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 12,
    paddingHorizontal: 6,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 14,
  },
  tab:         { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap:    { width: 42, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconActive:  { backgroundColor: C.primary },
  label:       { fontSize: 10, color: C.navInactive, fontWeight: '500' },
  labelActive: { color: C.navActive, fontWeight: '700' },
});