import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { profileApi, MyProfile } from '@/api/profile';
import { useToken } from '@/context/TokenContext';
import { authApi } from '@/api/auth';

export default function ProfileScreen() {
  const { logout } = useToken();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    profileApi.getMe()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // ignore — still logout locally
    }
    logout();
  };

  const updateLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow location access.');
      return;
    }

    try {
      setUpdatingLocation(true);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await profileApi.updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      Alert.alert('Location updated', 'Your location has been refreshed.');
    } catch (err) {
      Alert.alert('Error', 'Could not update location.');
    } finally {
      setUpdatingLocation(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E85D75" />
      </View>
    );
  }

  const primaryPhoto = profile?.photos?.find((p) => p.isPrimary) ?? profile?.photos?.[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrapper}>
        {primaryPhoto ? (
          <Image source={{ uri: primaryPhoto.url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.noAvatar]}>
            <Ionicons name="person" size={48} color="#555" />
          </View>
        )}
      </View>

      <Text style={styles.name}>{profile?.name ?? 'Your Profile'}</Text>

      {profile?.prompts?.map((p, i) => (
        <View key={i} style={styles.promptCard}>
          <Text style={styles.promptQuestion}>{p.question}</Text>
          <Text style={styles.promptAnswer}>{p.answer}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.actionBtn} onPress={updateLocation} disabled={updatingLocation}>
        <Ionicons name="location-outline" size={20} color="#E85D75" />
        <Text style={styles.actionBtnText}>
          {updatingLocation ? 'Updating location...' : 'Update location'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF4444" />
        <Text style={[styles.actionBtnText, styles.logoutText]}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { paddingTop: 80, paddingHorizontal: 24, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center' },
  avatarWrapper: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  noAvatar: { backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 24 },
  promptCard: {
    borderWidth: 1, borderColor: '#333', borderRadius: 12,
    padding: 16, marginBottom: 12, backgroundColor: '#1A1A1A',
  },
  promptQuestion: { color: '#E85D75', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  promptAnswer: { color: '#FFFFFF', fontSize: 15 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#333', borderRadius: 12,
    padding: 16, marginTop: 12, backgroundColor: '#1A1A1A',
  },
  actionBtnText: { color: '#E85D75', fontSize: 15, fontWeight: '600' },
  logoutBtn: { borderColor: '#FF4444' },
  logoutText: { color: '#FF4444' },
});
