import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { swipeApi, LikeReceived } from '@/api/swipe';

export default function LikesScreen() {
  const router = useRouter();
  const [likes, setLikes] = useState<LikeReceived[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    swipeApi.getLikesReceived()
      .then(setLikes)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E85D75" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Likes You</Text>
      {likes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>No likes yet</Text>
        </View>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item) => item.userId}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/decide-like/${item.userId}`)}
            >
              {item.primaryPhoto ? (
                <Image source={{ uri: item.primaryPhoto }} style={styles.photo} blurRadius={8} />
              ) : (
                <View style={[styles.photo, styles.noPhoto]}>
                  <Ionicons name="person" size={40} color="#333" />
                </View>
              )}
              <View style={styles.overlay}>
                <Text style={styles.name}>{item.name}</Text>
                <Ionicons name="heart" size={16} color="#E85D75" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', paddingTop: 60, paddingHorizontal: 16 },
  centered: { flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#555', fontSize: 16, marginTop: 16 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48%', borderRadius: 16, overflow: 'hidden', backgroundColor: '#1A1A1A' },
  photo: { width: '100%', height: 200 },
  noPhoto: { backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  name: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
