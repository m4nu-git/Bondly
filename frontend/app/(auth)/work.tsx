import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function WorkScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [occupation, setOccupation] = useState('');

  const onNext = () => {
    update({ occupation: occupation.trim() || null });
    router.push('/(auth)/images');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What do you do for work?</Text>
      <Text style={styles.subtitle}>Optional — you can skip this.</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Software Engineer at Google"
        placeholderTextColor="#555"
        value={occupation}
        onChangeText={setOccupation}
        autoFocus
      />
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>{occupation.trim() ? 'Continue' : 'Skip'}</Text>
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
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
