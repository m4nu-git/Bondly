import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';

export default function EmailScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [email, setEmail] = useState('');
  const valid = /\S+@\S+\.\S+/.test(email);

  const onNext = () => {
    if (!valid) return;
    update({ email });
    router.push('/(auth)/password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>✉️</Text></View>
      <Text style={styles.title}>What's your{'\n'}email?</Text>
      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor={C.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <NextButton onPress={onNext} disabled={!valid} />
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
