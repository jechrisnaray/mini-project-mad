import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b2c52" />

      <View style={styles.overlay}>
        <Text style={styles.title}>Klik button dibawah untuk masuk ke SIU</Text>

        <Text style={styles.subtitle}>
          Login untuk S1/Akademi dan Pascasarjana
        </Text>

        <TouchableOpacity
          style={styles.redButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>S1 dan Akademi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.yellowButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>S2 dan Profesi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b2c52',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#d9e6f2',
    textAlign: 'center',
    marginBottom: 30,
  },
  redButton: {
    backgroundColor: '#d62828',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  yellowButton: {
    backgroundColor: '#f4b400',
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});