import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function LocationScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      update({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setGranted(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onNext = () => router.push('/(auth)/gender');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>📍</Text></View>
      <Text style={styles.title}>Where are{'\n'}you located?</Text>
      <Text style={styles.sub}>We use your location to show people nearby.</Text>

      <TouchableOpacity style={[styles.locationBtn, granted && styles.locationBtnGranted]} onPress={requestLocation} disabled={loading || granted}>
        {loading ? (
          <ActivityIndicator color={C.primary} />
        ) : (
          <>
            <Ionicons name={granted ? 'checkmark-circle' : 'location-outline'} size={22} color={granted ? '#4CAF50' : C.primary} />
            <Text style={[styles.locationBtnText, granted && { color: '#4CAF50' }]}>
              {granted ? 'Location captured' : 'Allow location access'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <NextButton onPress={onNext} disabled={!granted} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  iconText: { fontSize: 18 },
  title: { fontSize: 33, fontWeight: '800', color: C.textPrimary, lineHeight: 43, marginBottom: 8 },
  sub: { fontSize: 14, color: C.textMuted, marginBottom: 40 },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: C.primary, borderRadius: 12,
    padding: 16,
  },
  locationBtnGranted: { borderColor: '#4CAF50', backgroundColor: '#F0FFF4' },
  locationBtnText: { fontSize: 16, fontWeight: '600', color: C.primary },
});
