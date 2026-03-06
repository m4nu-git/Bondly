import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

const OPTIONS = ['Men', 'Women', 'Everyone'];

export default function PreferredGenderScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [selected, setSelected] = useState('');

  const onNext = () => {
    if (!selected) return;
    // Map to backend value
    const map: Record<string, string> = { Men: 'Man', Women: 'Woman', Everyone: 'any' };
    update({ preferredGender: map[selected] });
    router.push('/(auth)/dating-intention');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who do you want to date?</Text>
      {OPTIONS.map((o) => (
        <TouchableOpacity
          key={o}
          style={[styles.option, selected === o && styles.selected]}
          onPress={() => setSelected(o)}
        >
          <Text style={[styles.optionText, selected === o && styles.selectedText]}>{o}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.button, !selected && styles.disabled]} onPress={onNext} disabled={!selected}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 32 },
  option: { borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16, marginBottom: 12 },
  selected: { borderColor: '#E85D75', backgroundColor: '#2A1A1E' },
  optionText: { color: '#989898', fontSize: 16 },
  selectedText: { color: '#FFFFFF' },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 16 },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
