import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';

export default function NameScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const onNext = () => {
    if (!firstName.trim()) return;
    update({ firstName: firstName.trim(), lastName: lastName.trim() });
    router.push('/(auth)/email');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>👤</Text></View>
      <Text style={styles.title}>What's your{'\n'}name?</Text>
      <TextInput
        style={styles.input}
        placeholder="First name"
        placeholderTextColor={C.textMuted}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={[styles.input, { marginTop: 20 }]}
        placeholder="Last name"
        placeholderTextColor={C.textMuted}
        value={lastName}
        onChangeText={setLastName}
      />
      <NextButton onPress={onNext} disabled={!firstName.trim()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  iconText: { fontSize: 18 },
  title: { fontSize: 33, fontWeight: '800', color: C.textPrimary, lineHeight: 43, marginBottom: 32 },
  input: { borderBottomWidth: 1.5, borderBottomColor: C.border, fontSize: 25, color: C.textPrimary, fontWeight: '600', paddingVertical: 8 },
});
