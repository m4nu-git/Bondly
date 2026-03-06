import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function BirthDateScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [dob, setDob] = useState(''); // DD-MM-YYYY

  const formatDob = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
  };

  const isValid = dob.length === 10;

  const onNext = () => {
    if (!isValid) return;
    // Convert DD-MM-YYYY to ISO for backend
    const [d, m, y] = dob.split('-');
    update({ dob: new Date(`${y}-${m}-${d}`).toISOString() });
    router.push('/(auth)/location');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>When's your birthday?</Text>
      <Text style={styles.sub}>You won't be able to change this later.</Text>
      <TextInput
        style={styles.input}
        placeholder="DD-MM-YYYY"
        placeholderTextColor="#666"
        value={dob}
        onChangeText={(t) => setDob(formatDob(t))}
        keyboardType="numeric"
        maxLength={10}
      />
      <TouchableOpacity style={[styles.button, !isValid && styles.disabled]} onPress={onNext} disabled={!isValid}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  sub: { fontSize: 14, color: '#989898', marginBottom: 32 },
  input: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
