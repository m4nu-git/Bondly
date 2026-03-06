import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Bondly</Text>
      <Text style={styles.tagline}>Designed to be deleted.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/phone')}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.loginText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#989898', marginBottom: 60 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, paddingVertical: 16, paddingHorizontal: 48, marginBottom: 16, width: '100%', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loginBtn: { padding: 16 },
  loginText: { color: '#FFFFFF', fontSize: 16 },
});
