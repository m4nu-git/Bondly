import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

const OPTIONS = [
  'Agnostic', 'Atheist', 'Buddhist', 'Catholic', 'Christian',
  'Hindu', 'Jewish', 'Muslim', 'Sikh', 'Spiritual', 'Other', 'Prefer not to say',
];

export default function ReligionScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [selected, setSelected] = useState('');

  const onNext = () => {
    update({ religion: selected || null });
    router.push('/(auth)/work');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your religion?</Text>
      <Text style={styles.subtitle}>Optional — you can skip this.</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {OPTIONS.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.option, selected === o && styles.selected]}
            onPress={() => setSelected(selected === o ? '' : o)}
          >
            <Text style={[styles.optionText, selected === o && styles.selectedText]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>{selected ? 'Continue' : 'Skip'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#989898', marginBottom: 24 },
  scroll: { flex: 1 },
  option: { borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16, marginBottom: 10 },
  selected: { borderColor: '#E85D75', backgroundColor: '#2A1A1E' },
  optionText: { color: '#989898', fontSize: 16 },
  selectedText: { color: '#FFFFFF' },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
