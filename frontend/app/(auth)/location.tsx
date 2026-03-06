import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useRegistration } from '@/context/RegistrationContext';

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
        Alert.alert('Permission denied', 'Location access is required to find matches near you.');
        return;
      }
      // Try precise location first; fall back to last known on simulator
      let pos = await Location.getLastKnownPositionAsync();
      if (!pos) {
        pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }
      update({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setGranted(true);
    } catch {
      Alert.alert('Error', 'Could not get location. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you located?</Text>
      <Text style={styles.sub}>We use your location to show you people nearby.</Text>

      {!granted ? (
        <TouchableOpacity style={styles.button} onPress={requestLocation} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Allow location access</Text>}
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.success}>✓ Location captured</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/gender')}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  sub: { fontSize: 14, color: '#989898', marginBottom: 32 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  success: { color: '#4CAF50', fontSize: 16, marginBottom: 24 },
});
