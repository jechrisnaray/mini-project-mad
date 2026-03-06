import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const menus = [
  'Registration',
  'Semester Cost Estimation',
  'Add / Drop Registration Subject',
  'Drop Subject',
  'View Grade',
  'View Schedule',
  'Teacher Evaluation',
  'View Ospek & KKN/KKU',
];

export default function DashboardScreen() {
  const announcements = useQuery(api.announcements.list);
  const seedAnnouncements = useMutation(api.announcements.seed);

  useEffect(() => {
    seedAnnouncements();
  }, [seedAnnouncements]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#2453d4" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard SIU</Text>
        <Text style={styles.headerSubtitle}>Welcome back</Text>
      </View>

      <View style={styles.content}>
        {announcements === undefined ? (
          <Text style={styles.loadingText}>Loading data dari Convex...</Text>
        ) : (
          announcements.map((item) => (
            <View
              key={item._id}
              style={item.color === 'yellow' ? styles.noticeYellow : styles.noticeBlue}
            >
              <Text style={styles.noticeTitle}>{item.title}</Text>
              <Text style={styles.noticeText}>{item.message}</Text>
            </View>
          ))
        )}

        <Text style={styles.menuTitle}>Menu Akademik</Text>

        {menus.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuCard}>
            <Text style={styles.menuText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  header: {
    backgroundColor: '#2453d4',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#dfe8ff',
    fontSize: 14,
    marginTop: 6,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
  },
  noticeYellow: {
    backgroundColor: '#fff3cd',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  noticeBlue: {
    backgroundColor: '#dbeafe',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1d3557',
    marginTop: 8,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    elevation: 2,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
});