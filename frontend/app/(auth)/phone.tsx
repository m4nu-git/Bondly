import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function PhoneScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [phone, setPhone] = useState('');

  const onNext = () => {
    if (phone.length < 10) return;
    update({ phone });
    router.push('/(auth)/name');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your phone number?</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        placeholderTextColor="#666"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={15}
      />
      <TouchableOpacity style={[styles.button, phone.length < 10 && styles.disabled]} onPress={onNext} disabled={phone.length < 10}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 32 },
  input: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
