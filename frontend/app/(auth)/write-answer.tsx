import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export default function WriteAnswerScreen() {
  const router = useRouter();
  const { question } = useLocalSearchParams<{ question: string }>();
  const { data, update } = useRegistration();
  const [answer, setAnswer] = useState('');

  const onSave = () => {
    if (!answer.trim() || !question) return;
    const existing = data.prompts ?? [];
    update({ prompts: [...existing, { question, answer: answer.trim() }] });
    router.back();
    // Go back to prompts screen (back past select-prompt)
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.question}>{question}</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your answer..."
        placeholderTextColor="#555"
        value={answer}
        onChangeText={setAnswer}
        multiline
        maxLength={150}
        autoFocus
      />
      <Text style={styles.count}>{answer.length}/150</Text>
      <TouchableOpacity
        style={[styles.button, !answer.trim() && styles.disabled]}
        onPress={onSave}
        disabled={!answer.trim()}
      >
        <Text style={styles.buttonText}>Save answer</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  question: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  count: { color: '#555', fontSize: 12, textAlign: 'right', marginTop: 6, marginBottom: 16 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
