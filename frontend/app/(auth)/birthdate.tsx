import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';

export default function BirthDateScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [dob, setDob] = useState('');

  const formatDob = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
  };

  const valid = dob.length === 10;

  const onNext = () => {
    if (!valid) return;
    const [d, m, y] = dob.split('-');
    update({ dob: new Date(`${y}-${m}-${d}`).toISOString() });
    router.push('/(auth)/location');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>🎂</Text></View>
      <Text style={styles.title}>When's your{'\n'}birthday?</Text>
      <Text style={styles.sub}>You won't be able to change this later.</Text>
      <TextInput
        style={styles.input}
        placeholder="DD-MM-YYYY"
        placeholderTextColor={C.textMuted}
        value={dob}
        onChangeText={(t) => setDob(formatDob(t))}
        keyboardType="numeric"
        maxLength={10}
      />
      <NextButton onPress={onNext} disabled={!valid} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  iconText: { fontSize: 18 },
  title: { fontSize: 33, fontWeight: '800', color: C.textPrimary, lineHeight: 43, marginBottom: 8 },
  sub: { fontSize: 14, color: C.textMuted, marginBottom: 32 },
  input: { borderBottomWidth: 1.5, borderBottomColor: C.border, fontSize: 30, color: C.textPrimary, fontWeight: '600', paddingVertical: 8, letterSpacing: 2 },
});
