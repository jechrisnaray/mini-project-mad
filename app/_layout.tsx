import { Stack, usePathname } from 'expo-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import C from '../constants/Colors';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const WITH_NAV = [
  '/dashboard', '/view-grade', '/view-schedule', '/registration',
  '/add-drop', '/drop-subject', '/teacher-evaluation',
  '/ospek-kkn', '/semester-cost', '/input-grade',
];

function Shell() {
  const path = usePathname();
  const { user } = useAuth();
  const showNav = !!user && WITH_NAV.includes(path);

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: C.background },
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
        <StatusBar style="light" />
        <Shell />
      </AuthProvider>
    </ConvexProvider>
  );
}