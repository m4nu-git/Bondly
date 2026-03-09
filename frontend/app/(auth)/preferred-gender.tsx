import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const OPTIONS = ['Man', 'Woman', 'Non-binary', 'Everyone'];

export default function PreferredGenderScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [selected, setSelected] = useState('');

  const onNext = () => {
    if (!selected) return;
    update({ preferredGender: selected === 'Everyone' ? 'any' : selected });
    router.push('/(auth)/dating-intention');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>❤️</Text></View>
      <Text style={styles.title}>Who do you{'\n'}want to date?</Text>
      <View style={styles.list}>
        {OPTIONS.map((g) => (
          <TouchableOpacity key={g} style={styles.row} onPress={() => setSelected(g)}>
            <Text style={styles.label}>{g}</Text>
            <Ionicons
              name={selected === g ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected === g ? C.primary : C.disabled}
            />
          </TouchableOpacity>
        ))}
      </View>
      <NextButton onPress={onNext} disabled={!selected} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  iconText: { fontSize: 18 },
  title: { fontSize: 33, fontWeight: '800', color: C.textPrimary, lineHeight: 43, marginBottom: 32 },
  list: { gap: 0 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: C.separator,
  },
  label: { fontSize: 18, color: C.textPrimary, fontWeight: '500' },
});
