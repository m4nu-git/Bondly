import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { C } from '@/constants/Colors';

const PROMPTS = [
  'My most irrational fear',
  'Dating me is like',
  'The way to win me over is',
  'I get way too excited about',
  'My love language is',
  'A life goal of mine',
  'I go crazy for',
  'My simple pleasures',
  'We will get along if',
  'I want someone who',
  'Typical Sunday',
];

export default function SelectPromptScreen() {
  const router = useRouter();

  const select = (q: string) => {
    router.push({ pathname: '/(auth)/write-answer', params: { question: q } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}><Text style={styles.badgeText}>About me</Text></View>
        <Text style={styles.title}>Choose a prompt</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {PROMPTS.map((p) => (
          <TouchableOpacity key={p} style={styles.row} onPress={() => select(p)}>
            <Text style={styles.label}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg },
  header: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 16 },
  badge: { backgroundColor: C.primary, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', color: C.textPrimary },
  list: { paddingHorizontal: 25, paddingBottom: 40 },
  row: {
    paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: C.separator,
  },
  label: { fontSize: 17, color: C.textPrimary, fontWeight: '500' },
});
