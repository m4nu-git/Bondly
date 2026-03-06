import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { matchApi, Match } from '@/api/match';

export default function ChatScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchApi.getMatches()
      .then(setMatches)
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
      <Text style={styles.header}>Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptyHint}>Keep swiping to find your match!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.matchRow}
              onPress={() => router.push(`/chat/${item.conversationId}`)}
            >
              {item.otherUser?.primaryPhoto ? (
                <Image source={{ uri: item.otherUser.primaryPhoto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.noAvatar]}>
                  <Ionicons name="person" size={24} color="#333" />
                </View>
              )}
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{item.otherUser?.name ?? 'Unknown'}</Text>
                <Text style={styles.matchSub} numberOfLines={1}>
                  {item.lastMessage ?? 'Say hello!'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  emptyHint: { color: '#444', fontSize: 13, marginTop: 8 },
  matchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  noAvatar: { backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  matchInfo: { flex: 1 },
  matchName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  matchSub: { color: '#555', fontSize: 13, marginTop: 3 },
  separator: { height: 1, backgroundColor: '#1E1E1E' },
});
