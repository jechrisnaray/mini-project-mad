import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const seedUsers = useMutation(api.users.seedUsers);
  const loginUser = useMutation(api.users.login);

  useEffect(() => {
    seedUsers();
  }, [seedUsers]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Username dan password harus diisi.');
      return;
    }

    try {
      const user = await loginUser({
        username,
        password,
      });

      Alert.alert('Berhasil', `Selamat datang, ${user.name}`);
      router.push('/dashboard');
    } catch (error: any) {
      Alert.alert('Login gagal', error?.message || 'Terjadi kesalahan');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef3f8" />

      <View style={styles.card}>
        <Text style={styles.logoText}>UNIVERSITAS KLABAT</Text>
        <Text style={styles.subLogo}>Login SIU</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerText}>BUAT AKUN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3f8',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    elevation: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1d3557',
    marginBottom: 6,
  },
  subLogo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2453d4',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 6,
  },
  loginText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#1d3557',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  registerText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  backText: {
    textAlign: 'center',
    color: '#2453d4',
    marginTop: 18,
    fontSize: 15,
    fontWeight: '600',
  },
  demoBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f3f6fb',
    borderRadius: 12,
  },
  demoTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#1d3557',
  },
  demoText: {
    color: '#444',
    marginBottom: 2,
  },
});