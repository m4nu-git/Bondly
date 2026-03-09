import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { authApi } from '@/api/auth';
import { useToken } from '@/context/TokenContext';
import { C } from '@/constants/Colors';

export default function LandingScreen() {
  const router = useRouter();
  const { setToken, setUserId } = useToken();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert('Error', 'Enter email and password');
    setLoading(true);
    try {
      const { accessToken, refreshToken, userId } = await authApi.login({ email: email.trim(), password });
      // Persist all tokens — refreshToken needed to renew expired sessions
      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await setToken(accessToken);
      await setUserId(userId);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.message ?? 'Check your connection and try again';
      Alert.alert('Login failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.top}>
            <Text style={styles.logo}>bondly</Text>
            <Text style={styles.tagline}>Designed to be deleted.</Text>
          </View>

          {!showLogin ? (
            <View style={styles.bottom}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/phone')}>
                <Text style={styles.primaryBtnText}>Create account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowLogin(true)}>
                <Text style={styles.secondaryBtnText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginBox}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={C.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="Password"
                placeholderTextColor={C.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign in</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogin(false)}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, justifyContent: 'space-between', paddingBottom: 60, paddingTop: 100 },
  top: { alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: '900', color: C.primary, letterSpacing: -1 },
  tagline: { fontSize: 16, color: C.textMuted, marginTop: 8 },
  bottom: { gap: 14 },
  loginBox: { gap: 0 },
  primaryBtn: { backgroundColor: C.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center', marginTop: 14 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { color: C.primary, fontSize: 16, fontWeight: '600' },
  input: {
    borderBottomWidth: 1.5, borderBottomColor: C.border,
    fontSize: 18, color: C.textPrimary, paddingVertical: 10,
  },
  backText: { color: C.textMuted, textAlign: 'center', marginTop: 20, fontSize: 15 },
});
