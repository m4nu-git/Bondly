import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const OPTIONS = [
  'Life partner',
  'Long-term relationship',
  'Long-term, open to short',
  'Short-term, open to long',
  'Short-term fun',
  'Figuring out my dating goals',
];

export default function DatingIntentionScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [selected, setSelected] = useState('');

  const onNext = () => {
    if (!selected) return;
    update({ datingType: selected });
    router.push('/(auth)/hometown');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>🎯</Text></View>
      <Text style={styles.title}>What are you{'\n'}looking for?</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {OPTIONS.map((o) => (
          <TouchableOpacity key={o} style={styles.row} onPress={() => setSelected(o)}>
            <Text style={styles.label}>{o}</Text>
            <Ionicons
              name={selected === o ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected === o ? C.primary : C.disabled}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <NextButton onPress={onNext} disabled={!selected} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  iconText: { fontSize: 18 },
  title: { fontSize: 33, fontWeight: '800', color: C.textPrimary, lineHeight: 43, marginBottom: 24 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: C.separator,
  },
  label: { fontSize: 16, color: C.textPrimary, fontWeight: '500', flex: 1, marginRight: 8 },
});
