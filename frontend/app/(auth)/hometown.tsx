import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function HometownScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [hometown, setHometown] = useState('');

  const onNext = () => {
    if (!hometown.trim()) return;
    update({ hometown: hometown.trim() });
    router.push('/(auth)/religion');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you from?</Text>
      <Text style={styles.subtitle}>Your hometown helps others connect with you.</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mumbai, Maharashtra"
        placeholderTextColor="#555"
        value={hometown}
        onChangeText={setHometown}
        autoFocus
      />
      <TouchableOpacity
        style={[styles.button, !hometown.trim() && styles.disabled]}
        onPress={onNext}
        disabled={!hometown.trim()}
      >
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
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
