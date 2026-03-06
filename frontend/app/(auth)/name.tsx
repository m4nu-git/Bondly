import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function NameScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const onNext = () => {
    if (!firstName) return;
    update({ firstName, lastName });
    router.push('/(auth)/email');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your name?</Text>
      <TextInput style={styles.input} placeholder="First name" placeholderTextColor="#666" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last name" placeholderTextColor="#666" value={lastName} onChangeText={setLastName} />
      <TouchableOpacity style={[styles.button, !firstName && styles.disabled]} onPress={onNext} disabled={!firstName}>
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
