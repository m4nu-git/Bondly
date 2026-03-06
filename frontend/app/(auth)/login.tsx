import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '@/api/auth';
import { useToken } from '@/context/TokenContext';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken, setUserId } = useToken();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Enter email and password');
    setLoading(true);
    try {
      const { accessToken, userId } = await authApi.login({ email, password });
      await setToken(accessToken);
      await setUserId(userId);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login failed', err.response?.data?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 32 },
  input: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, color: '#FFFFFF', marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  back: { color: '#989898', textAlign: 'center', marginTop: 24, fontSize: 15 },
});
