import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/Colors';

const MAX_CHARS = 250;

export default function WriteAnswerScreen() {
  const router = useRouter();
  const { question } = useLocalSearchParams<{ question: string }>();
  const [answer, setAnswer] = useState('');

  const onSave = () => {
    if (!answer.trim()) return;
    router.push({ pathname: '/(auth)/prompts', params: { question, answer } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{question}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Your answer..."
        placeholderTextColor={C.textMuted}
        value={answer}
        onChangeText={(t) => setAnswer(t.slice(0, MAX_CHARS))}
        multiline
        numberOfLines={4}
        autoFocus
      />
      <Text style={styles.counter}>{answer.length}/{MAX_CHARS}</Text>
      <TouchableOpacity
        style={[styles.saveBtn, !answer.trim() && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={!answer.trim()}
      >
        <Text style={styles.saveBtnText}>Save answer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  questionBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, marginBottom: 20 },
  questionText: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  input: { fontSize: 18, color: C.textPrimary, borderBottomWidth: 1.5, borderBottomColor: C.border, paddingVertical: 8, minHeight: 100, textAlignVertical: 'top' },
  counter: { color: C.textMuted, fontSize: 12, textAlign: 'right', marginTop: 6 },
  saveBtn: { backgroundColor: C.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { backgroundColor: C.disabled },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
