import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function PasswordScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid = password.length >= 8 && password === confirm;

  const onNext = () => {
    if (!isValid) return;
    update({ password });
    router.push('/(auth)/final');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a password</Text>
      <Text style={styles.subtitle}>At least 8 characters.</Text>

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#555"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.toggle}>
        <Text style={styles.toggleText}>{showPassword ? 'Hide password' : 'Show password'}</Text>
      </TouchableOpacity>

      {confirm.length > 0 && password !== confirm && (
        <Text style={styles.error}>Passwords don't match</Text>
      )}

      <TouchableOpacity style={[styles.button, !isValid && styles.disabled]} onPress={onNext} disabled={!isValid}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#989898', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#1A1A1A',
  },
  toggle: { marginBottom: 12 },
  toggleText: { color: '#E85D75', fontSize: 14 },
  error: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
