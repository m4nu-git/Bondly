import { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { profileApi, PublicProfile } from '@/api/profile';
import { swipeApi } from '@/api/swipe';

export default function DecideLikeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (!id) return;
    profileApi.getProfile(id)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSwipe = async (action: 'LIKE' | 'PASS') => {
    if (!id || swiping) return;
    try {
      setSwiping(true);
      const result = await swipeApi.swipe(id, action);
      if (result.matched && result.matchId) {
        Alert.alert("It's a Match!", `You and ${profile?.name} liked each other!`, [
          { text: "Say Hi", onPress: () => router.replace(`/chat/${result.matchId}`) },
          { text: "Continue", onPress: () => router.back() },
        ]);
      } else {
        router.back();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Swipe failed');
    } finally {
      setSwiping(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E85D75" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryPhoto = profile.photos?.find((p) => p.isPrimary) ?? profile.photos?.[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {primaryPhoto && (
          <Image source={{ uri: primaryPhoto.url }} style={styles.heroPhoto} />
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.distance_km != null && (
            <Text style={styles.meta}>{profile.distance_km} km away</Text>
          )}

          {profile.prompts?.map((p, i) => (
            <View key={i} style={styles.promptCard}>
              <Text style={styles.promptQuestion}>{p.question}</Text>
              <Text style={styles.promptAnswer}>{p.answer}</Text>
            </View>
          ))}

          {profile.photos && profile.photos.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
              {profile.photos.slice(1).map((ph) => (
                <Image key={ph.id} source={{ uri: ph.url }} style={styles.stripPhoto} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.passBtn}
          onPress={() => handleSwipe('PASS')}
          disabled={swiping}
        >
          <Ionicons name="close" size={32} color="#888" />
          <Text style={styles.passBtnText}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={() => handleSwipe('LIKE')}
          disabled={swiping}
        >
          <Ionicons name="heart" size={32} color="#E85D75" />
          <Text style={styles.likeBtnText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  centered: { flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 60, left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 6 },
  heroPhoto: { width: '100%', height: 480 },
  info: { padding: 20 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  meta: { fontSize: 14, color: '#989898', marginBottom: 20 },
  promptCard: { borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16, marginBottom: 12, backgroundColor: '#1A1A1A' },
  promptQuestion: { color: '#E85D75', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  promptAnswer: { color: '#FFFFFF', fontSize: 15 },
  photoStrip: { marginTop: 8 },
  stripPhoto: { width: 140, height: 180, borderRadius: 12, marginRight: 10 },
  actions: {
    flexDirection: 'row', justifyContent: 'space-around',
    padding: 20, borderTopWidth: 1, borderTopColor: '#1E1E1E',
    backgroundColor: '#101010',
  },
  passBtn: { alignItems: 'center', gap: 4 },
  passBtnText: { color: '#888', fontSize: 13 },
  likeBtn: { alignItems: 'center', gap: 4 },
  likeBtnText: { color: '#E85D75', fontSize: 13 },
  errorText: { color: '#555', fontSize: 16, marginBottom: 16 },
  backLink: { color: '#E85D75', fontSize: 15 },
});
