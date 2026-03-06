import { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  Animated, PanResponder, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { discoveryApi, FeedProfile } from '@/api/discovery';
import { swipeApi } from '@/api/swipe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

export default function HomeScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<FeedProfile[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [locationStale, setLocationStale] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    loadFeed(1);
  }, []);

  const loadFeed = async (p: number) => {
    try {
      setLoading(true);
      const data = await discoveryApi.getFeed(p, 20);
      setProfiles((prev) => (p === 1 ? data.profiles : [...prev, ...data.profiles]));
      setLocationStale(data.locationStale ?? false);
      setPage(p);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'LOCATION_REQUIRED' || code === 'LOCATION_STALE') {
        Alert.alert(
          'Location needed',
          err?.response?.data?.message ?? 'Please update your location.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        swipeCard('LIKE');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        swipeCard('PASS');
      } else {
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    },
  });

  const swipeCard = async (action: 'LIKE' | 'PASS') => {
    const current = profiles[0];
    if (!current) return;

    const direction = action === 'LIKE' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

    Animated.timing(position, {
      toValue: { x: direction, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      position.setValue({ x: 0, y: 0 });
      setProfiles((prev) => prev.slice(1));

      try {
        const result = await swipeApi.swipe(current.userId, action);
        if (result.matched && result.matchId) {
          Alert.alert("It's a Match!", "You both liked each other!", [
            { text: "Say Hi", onPress: () => router.push(`/chat/${result.matchId}`) },
            { text: "Keep swiping" },
          ]);
        }
      } catch (err) {
        // swipe failed silently — could retry
      }

      // Load more when nearing end
      if (profiles.length <= 3) {
        loadFeed(page + 1);
      }
    });
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  if (loading && profiles.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E85D75" />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="heart-dislike-outline" size={64} color="#333" />
        <Text style={styles.emptyText}>No more profiles nearby</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadFeed(1)}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = profiles[0];
  const primaryPhoto = card.photos?.find((p) => p.isPrimary) ?? card.photos?.[0];

  return (
    <View style={styles.container}>
      {locationStale && (
        <View style={styles.staleBanner}>
          <Text style={styles.staleBannerText}>Your location may be outdated. Update for better matches.</Text>
        </View>
      )}

      <Animated.View
        style={[styles.card, { transform: [...position.getTranslateTransform(), { rotate }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.95} onPress={() => router.push(`/decide-like/${card.userId}`)}>
          {primaryPhoto ? (
            <Image source={{ uri: primaryPhoto.url }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.noPhoto]}>
              <Ionicons name="person" size={80} color="#333" />
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.cardMeta}>{card.distance_km} km away</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.passBtn} onPress={() => swipeCard('PASS')}>
          <Ionicons name="close" size={32} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={() => swipeCard('LIKE')}>
          <Ionicons name="heart" size={32} color="#E85D75" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', alignItems: 'center', paddingTop: 60 },
  centered: { flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center' },
  staleBanner: { backgroundColor: '#2A1A1E', borderRadius: 8, padding: 10, marginHorizontal: 16, marginBottom: 12 },
  staleBannerText: { color: '#E85D75', fontSize: 13, textAlign: 'center' },
  card: {
    width: SCREEN_WIDTH - 32,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardImage: { width: '100%', height: 480 },
  noPhoto: { backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 16 },
  cardName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  cardMeta: { fontSize: 14, color: '#989898', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 40, marginTop: 24 },
  passBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center',
  },
  likeBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#2A1A1E', borderWidth: 1, borderColor: '#E85D75',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { color: '#555', fontSize: 16, marginTop: 16, marginBottom: 24 },
  refreshBtn: { backgroundColor: '#E85D75', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12 },
  refreshBtnText: { color: '#FFFFFF', fontWeight: '600' },
});
