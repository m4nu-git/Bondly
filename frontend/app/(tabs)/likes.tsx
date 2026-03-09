import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { swipeApi, LikeReceivedItem } from '@/api/swipe';
import { C } from '@/constants/Colors';

export default function LikesScreen() {
  const router = useRouter();
  const [likes, setLikes] = useState<LikeReceivedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    swipeApi.getAllLikes().then(setLikes).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  const first = likes[0];
  const rest = likes.slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Likes You</Text>
        <View style={styles.boostBadge}><Text style={styles.boostText}>⚡ Boost</Text></View>
      </View>

      {likes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={C.disabled} />
          <Text style={styles.emptyText}>No likes yet</Text>
          <Text style={styles.emptyHint}>Keep your profile updated to attract more people!</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            first ? (
              <TouchableOpacity style={styles.firstCard} onPress={() => router.push(`/decide-like/${first.likedBy.id}?fromLike=1`)}>
                {first.likedBy.profile?.photos?.[0]?.url ? (
                  <Image source={{ uri: first.likedBy.profile.photos[0].url }} style={styles.firstPhoto} />
                ) : (
                  <View style={[styles.firstPhoto, styles.noPhoto]}>
                    <Ionicons name="person" size={60} color="#ccc" />
                  </View>
                )}
                <View style={styles.firstOverlay}>
                  <View style={styles.likedBadge}>
                    <Ionicons name="heart" size={14} color={C.primary} />
                    <Text style={styles.likedBadgeText}>Liked your profile</Text>
                  </View>
                  <Text style={styles.firstName}>{first.likedBy.profile?.name ?? 'Someone'}</Text>
                  {first.comment ? <Text style={styles.firstComment}>"{first.comment}"</Text> : null}
                </View>
              </TouchableOpacity>
            ) : null
          }
          numColumns={2}
          columnWrapperStyle={rest.length > 0 ? styles.row : undefined}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/decide-like/${item.likedBy.id}?fromLike=1`)}>
              {item.likedBy.profile?.photos?.[0]?.url ? (
                <Image source={{ uri: item.likedBy.profile.photos[0].url }} style={styles.photo} blurRadius={10} />
              ) : (
                <View style={[styles.photo, styles.noPhoto]}>
                  <Ionicons name="person" size={32} color="#ccc" />
                </View>
              )}
              <View style={styles.overlay}>
                <Text style={styles.name}>{item.likedBy.profile?.name ?? 'Someone'}</Text>
                <Ionicons name="heart" size={14} color={C.gold} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingTop: 60, paddingHorizontal: 16 },
  centered: { flex: 1, backgroundColor: C.authBg, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  header: { fontSize: 26, fontWeight: '800', color: C.textPrimary },
  boostBadge: { backgroundColor: '#b4debe', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  boostText: { fontSize: 13, fontWeight: '700', color: '#2e7d32' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '700', color: C.textSecondary, marginTop: 16 },
  emptyHint: { fontSize: 13, color: C.textMuted, marginTop: 8, textAlign: 'center' },
  firstCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, height: 460 },
  firstPhoto: { width: '100%', height: '100%' },
  firstOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.3)' },
  likedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.peach, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 8 },
  likedBadgeText: { fontSize: 12, fontWeight: '700', color: C.primary },
  firstName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  firstComment: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontStyle: 'italic' },
  row: { justifyContent: 'space-between', marginBottom: 10 },
  card: { width: '48%', borderRadius: 14, overflow: 'hidden', height: 180 },
  photo: { width: '100%', height: '100%' },
  noPhoto: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  name: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
