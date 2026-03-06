import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function PromptsScreen() {
  const router = useRouter();
  const { data } = useRegistration();
  const prompts = data.prompts ?? [];

  const onNext = () => {
    if (prompts.length < 1) return;
    router.push('/(auth)/password');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your profile</Text>
      <Text style={styles.subtitle}>
        Add at least 1 prompt answer so people know what you're about.
      </Text>

      {prompts.map((p, i) => (
        <View key={i} style={styles.promptCard}>
          <Text style={styles.promptQuestion}>{p.question}</Text>
          <Text style={styles.promptAnswer}>{p.answer}</Text>
        </View>
      ))}

      {prompts.length < 3 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(auth)/select-prompt')}
        >
          <Text style={styles.addButtonText}>+ Add a prompt</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, prompts.length < 1 && styles.disabled]}
        onPress={onNext}
        disabled={prompts.length < 1}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#989898', marginBottom: 24 },
  promptCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#1A1A1A',
  },
  promptQuestion: { color: '#E85D75', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  promptAnswer: { color: '#FFFFFF', fontSize: 15 },
  addButton: {
    borderWidth: 1,
    borderColor: '#E85D75',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: '#E85D75', fontSize: 16, fontWeight: '600' },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
