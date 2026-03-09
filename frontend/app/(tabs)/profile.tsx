import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { profileApi, MyProfile } from '@/api/profile';
import { useToken } from '@/context/TokenContext';
import { authApi } from '@/api/auth';
import { C } from '@/constants/Colors';

export default function ProfileScreen() {
  const { logout } = useToken();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    profileApi.getMe().then(setProfile).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
  };

  const updateLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Please allow location access.'); return; }
    try {
      setUpdatingLocation(true);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await profileApi.updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      Alert.alert('Location updated', 'Your location has been refreshed.');
    } catch { Alert.alert('Error', 'Could not update location.'); }
    finally { setUpdatingLocation(false); }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  const primaryPhoto = profile?.photos?.find((p) => p.isPrimary) ?? profile?.photos?.[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {primaryPhoto ? (
          <Image source={{ uri: primaryPhoto.url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.noAvatar]}>
            <Ionicons name="person" size={48} color={C.disabled} />
          </View>
        )}
      </View>

      <Text style={styles.name}>{profile?.name ?? 'Your Profile'}</Text>

      {/* Prompt cards */}
      {profile?.prompts?.map((p, i) => (
        <View key={i} style={styles.promptCard}>
          <Text style={styles.promptQ}>{p.question}</Text>
          <Text style={styles.promptA}>{p.answer}</Text>
        </View>
      ))}

      {/* Actions */}
      <TouchableOpacity style={styles.actionBtn} onPress={updateLocation} disabled={updatingLocation}>
        <Ionicons name="location-outline" size={20} color={C.primary} />
        <Text style={styles.actionText}>{updatingLocation ? 'Updating...' : 'Update location'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#e53935" />
        <Text style={[styles.actionText, { color: '#e53935' }]}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.mainBg },
  content: { paddingTop: 70, paddingHorizontal: 20, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: C.mainBg, alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { alignItems: 'center', marginBottom: 14 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#fff' },
  noAvatar: { backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginBottom: 24 },
  promptCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  promptQ: { color: C.primary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  promptA: { color: C.textPrimary, fontSize: 15 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 10, elevation: 1,
  },
  actionText: { color: C.primary, fontSize: 15, fontWeight: '700' },
  logoutBtn: {},
});
