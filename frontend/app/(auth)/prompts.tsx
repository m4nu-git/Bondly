import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const MAX_PROMPTS = 3;

export default function PromptsScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const params = useLocalSearchParams<{ question?: string; answer?: string }>();
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => {
    if (params.question && params.answer) {
      setPrompts((prev) => {
        const exists = prev.find((p) => p.question === params.question);
        if (exists) return prev;
        if (prev.length >= MAX_PROMPTS) return prev;
        return [...prev, { question: params.question!, answer: params.answer! }];
      });
    }
  }, [params.question, params.answer]);

  const removePrompt = (i: number) => setPrompts((p) => p.filter((_, idx) => idx !== i));

  const onNext = () => {
    update({ prompts });
    router.push('/(auth)/final');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>💬</Text></View>
      <Text style={styles.title}>Your prompts</Text>
      <Text style={styles.sub}>Add up to 3 prompts to show your personality.</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {prompts.map((p, i) => (
          <View key={i} style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Text style={styles.promptQ}>{p.question}</Text>
              <TouchableOpacity onPress={() => removePrompt(i)}>
                <Ionicons name="close-circle" size={20} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.promptA}>{p.answer}</Text>
          </View>
        ))}

        {prompts.length < MAX_PROMPTS && (
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(auth)/select-prompt')}>
            <Ionicons name="add-circle-outline" size={22} color={C.primary} />
            <Text style={styles.addBtnText}>Add a prompt</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <NextButton onPress={onNext} disabled={prompts.length === 0} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  iconText: { fontSize: 18 },
  title: { fontSize: 28, fontWeight: '800', color: C.textPrimary, marginBottom: 6 },
  sub: { fontSize: 13, color: C.textMuted, marginBottom: 24 },
  promptCard: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, marginBottom: 12 },
  promptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  promptQ: { fontSize: 13, fontWeight: '700', color: C.primary, flex: 1, marginRight: 8 },
  promptA: { fontSize: 15, color: C.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: C.primary, borderStyle: 'dashed', borderRadius: 12, padding: 16 },
  addBtnText: { color: C.primary, fontSize: 16, fontWeight: '600' },
});
