import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const OPTIONS = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Atheist', 'Other', 'Prefer not to say'];

export default function ReligionScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [selected, setSelected] = useState('');

  const onNext = () => {
    update({ religion: selected || null });
    router.push('/(auth)/work');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>🙏</Text></View>
      <Text style={styles.title}>What's your{'\n'}religion?</Text>
      <Text style={styles.sub}>Optional</Text>
      {OPTIONS.map((o) => (
        <TouchableOpacity key={o} style={styles.row} onPress={() => setSelected(o === selected ? '' : o)}>
          <Text style={styles.label}>{o}</Text>
          <Ionicons
            name={selected === o ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selected === o ? C.primary : C.disabled}
          />
        </TouchableOpacity>
      ))}
      <NextButton onPress={onNext} disabled={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  iconText: { fontSize: 18 },
  title: { fontSize: 33, fontWeight: '800', color: C.textPrimary, lineHeight: 43, marginBottom: 4 },
  sub: { fontSize: 14, color: C.textMuted, marginBottom: 20 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.separator,
  },
  label: { fontSize: 16, color: C.textPrimary, fontWeight: '500' },
});
