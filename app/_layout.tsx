import { Stack, usePathname } from 'expo-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

// Halaman yang menampilkan bottom nav bar
const NAV_ROUTES = [
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
];

function AppShell() {
  const pathname = usePathname();
  const { user } = useAuth();
  const showNav = user != null && NAV_ROUTES.includes(pathname);

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F0F2F8' },
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
        <AppShell />
      </AuthProvider>
    </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});