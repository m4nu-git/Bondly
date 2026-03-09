import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { matchApi, MatchPerson } from '@/api/match';
import { C } from '@/constants/Colors';

function getLastMessage(person: MatchPerson): string | null {
  const all = [...(person.chatsSent ?? []), ...(person.chatsReceived ?? [])];
  if (!all.length) return null;
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].message;
}

export default function ChatScreen() {
  const router = useRouter();
  const [people, setPeople] = useState<MatchPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchApi.getAllMatches()
      .then((res) => setPeople(res.people ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Matches</Text>
      {people.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={64} color={C.disabled} />
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptyHint}>Keep swiping to find your match!</Text>
        </View>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const photo = item.profile?.photos?.[0]?.url;
            const lastMsg = getLastMessage(item);
            return (
              <TouchableOpacity style={styles.matchRow} onPress={() => router.push(`/chat/${item.id}`)}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.noAvatar]}>
                    <Ionicons name="person" size={26} color="#ccc" />
                  </View>
                )}
                <View style={styles.matchInfo}>
                  <Text style={styles.matchName}>{item.profile?.name ?? 'Unknown'}</Text>
                  <Text style={styles.matchSub} numberOfLines={1}>
                    {lastMsg ?? 'Say hello! 👋'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.disabled} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingTop: 60, paddingHorizontal: 16 },
  centered: { flex: 1, backgroundColor: C.authBg, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 26, fontWeight: '800', color: C.textPrimary, marginBottom: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '700', color: C.textSecondary, marginTop: 16 },
  emptyHint: { fontSize: 13, color: C.textMuted, marginTop: 8 },
  matchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 14 },
  noAvatar: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  matchInfo: { flex: 1 },
  matchName: { color: C.textPrimary, fontSize: 16, fontWeight: '700' },
  matchSub: { color: C.textMuted, fontSize: 13, marginTop: 3 },
  separator: { height: 1, backgroundColor: C.separator },
});
