import { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Animated, PanResponder, Dimensions, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { discoveryApi, FeedProfile } from '@/api/discovery';
import { swipeApi } from '@/api/swipe';
import { C } from '@/constants/Colors';

const { width: SW } = Dimensions.get('window');
const SWIPE_THRESHOLD = SW * 0.35;

export default function HomeScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<FeedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await discoveryApi.getFeed();
      setProfiles(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD) swipeCard('LIKE');
      else if (g.dx < -SWIPE_THRESHOLD) swipeCard('PASS');
      else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  });

  const swipeCard = async (action: 'LIKE' | 'PASS') => {
    const current = profiles[0];
    if (!current) return;
    const dir = action === 'LIKE' ? SW * 1.5 : -SW * 1.5;
    Animated.timing(position, { toValue: { x: dir, y: 0 }, duration: 250, useNativeDriver: false }).start(async () => {
      position.setValue({ x: 0, y: 0 });
      setProfiles((p) => p.slice(1));
      try {
        if (action === 'LIKE') {
          const photo = current.photos?.find((p) => p.isPrimary) ?? current.photos?.[0];
          if (photo) await swipeApi.imageLiked(current.userId, photo.id);
        } else {
          await swipeApi.reject(current.userId);
        }
      } catch { /* silent */ }
      if (profiles.length <= 3) loadFeed();
    });
  };

  const rotate = position.x.interpolate({
    inputRange: [-SW / 2, 0, SW / 2],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  if (loading && profiles.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>🥺</Text>
        <Text style={styles.emptyText}>No Match Found</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadFeed}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = profiles[0];
  const primaryPhoto = card.photos?.find((p) => p.isPrimary) ?? card.photos?.[0];

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.bannerIconWrap}>
          <Ionicons name="heart" size={18} color={C.primary} />
        </View>
        <Text style={styles.bannerText}>Your daily picks are here</Text>
      </View>

      <Animated.View
        style={[styles.card, { transform: [...position.getTranslateTransform(), { rotate }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.97} onPress={() => router.push(`/decide-like/${card.userId}`)}>
          {primaryPhoto ? (
            <Image source={{ uri: primaryPhoto.url }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.noPhoto]}>
              <Ionicons name="person" size={80} color="#ccc" />
            </View>
          )}
          <TouchableOpacity style={styles.heartBtn} onPress={() => swipeCard('LIKE')}>
            <Ionicons name="heart" size={22} color={C.gold} />
          </TouchableOpacity>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{card.name}</Text>
            {card.age != null && (
              <Text style={styles.cardMeta}>{card.age} years old</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => swipeCard('PASS')}>
          <MaterialCommunityIcons name="sword-cross" size={28} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={() => swipeCard('LIKE')}>
          <Ionicons name="heart" size={28} color={C.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.mainBg, paddingTop: 60, alignItems: 'center' },
  centered: { flex: 1, backgroundColor: C.mainBg, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: C.textSecondary },
  refreshBtn: { marginTop: 20, backgroundColor: C.primary, borderRadius: 100, paddingHorizontal: 24, paddingVertical: 12 },
  refreshBtnText: { color: '#fff', fontWeight: '700' },
  banner: {
    backgroundColor: C.banner, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 16, marginBottom: 14, width: SW - 32,
  },
  bannerIconWrap: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: C.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  bannerText: { fontSize: 14, fontWeight: '600', color: C.textPrimary, flex: 1 },
  card: {
    width: SW - 32, borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#fff', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8,
  },
  cardImage: { width: '100%', height: 400 },
  noPhoto: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  heartBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    elevation: 2,
  },
  cardInfo: { padding: 14 },
  cardName: { fontSize: 22, fontWeight: '800', color: C.textPrimary },
  cardMeta: { fontSize: 13, color: C.textMuted, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 48, marginTop: 20 },
  rejectBtn: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  likeBtn: { width: 58, height: 58, borderRadius: 29, backgroundColor: C.peach, alignItems: 'center', justifyContent: 'center', elevation: 2 },
});
