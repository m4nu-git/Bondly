import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';

export const PROMPT_OPTIONS = [
  "My most irrational fear",
  "A life goal of mine",
  "This year, I really want to",
  "Biggest risk I've ever taken",
  "My love language is",
  "I get along best with people who",
  "The way to win me over is",
  "I'm looking for",
  "My simple pleasures",
  "Dating me is like",
  "I'll know it's time to delete Bondly when",
  "The key to my heart is",
  "My most controversial opinion",
  "Two truths and a lie",
  "The last great thing I watched",
];

export default function SelectPromptScreen() {
  const router = useRouter();
  const { data } = useRegistration();
  const usedQuestions = (data.prompts ?? []).map((p) => p.question);

  const select = (question: string) => {
    router.push({ pathname: '/(auth)/write-answer', params: { question } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a prompt</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {PROMPT_OPTIONS.map((q) => {
          const used = usedQuestions.includes(q);
          return (
            <TouchableOpacity
              key={q}
              style={[styles.option, used && styles.used]}
              onPress={() => !used && select(q)}
              disabled={used}
            >
              <Text style={[styles.optionText, used && styles.usedText]}>{q}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24 },
  option: { borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16, marginBottom: 10 },
  used: { opacity: 0.3 },
  optionText: { color: '#FFFFFF', fontSize: 15 },
  usedText: { color: '#555' },
});
