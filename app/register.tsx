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
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const registerUser = useMutation(api.users.register);

  const handleRegister = async () => {
    if (!name.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Nama, username, dan password harus diisi.');
      return;
    }

    try {
      await registerUser({
        name,
        username,
        password,
      });

      Alert.alert('Berhasil', 'Akun berhasil dibuat. Silakan login.');
      router.back();
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Terjadi kesalahan');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef3f8" />

      <View style={styles.card}>
        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>Daftar akun SIU baru</Text>

        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>DAFTAR</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Kembali ke Login</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1d3557',
    marginBottom: 6,
  },
  subtitle: {
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
  button: {
    backgroundColor: '#2453d4',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 6,
  },
  buttonText: {
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
});