import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import C from '../constants/Colors';
import { AuthProvider, useAuth } from '../context/AuthContext';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const WITH_NAV = [
  '/dashboard',
  '/view-grade',
  '/view-schedule',
  '/registration',
  '/add-drop',
  '/drop-subject',
  '/teacher-evaluation',
  '/ospek-kkn',
  '/semester-cost',
  '/input-grade',
  '/profile',
  '/students',
];

function Shell() {
  const path = usePathname();
  const { user } = useAuth();
  const showNav = !!user && WITH_NAV.includes(path);

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: C.bg },
        }}
      />

      {showNav && <BottomNavBar />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ConvexProvider>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
});