import { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { profileApi, PublicProfile } from '@/api/profile';
import { swipeApi } from '@/api/swipe';
import { matchApi } from '@/api/match';
import { C } from '@/constants/Colors';

export default function DecideLikeScreen() {
  // fromLike=1 means they already liked us, so we accept/reject
  const { id, fromLike } = useLocalSearchParams<{ id: string; fromLike?: string }>();
  const isFromLike = fromLike === '1';
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!id) return;
    profileApi.getProfile(id).then(setProfile).finally(() => setLoading(false));
  }, [id]);

  const handlePass = async () => {
    if (!id || acting) return;
    try {
      setActing(true);
      await swipeApi.reject(id);
      router.back();
    } catch { Alert.alert('Error', 'Could not pass.'); }
    finally { setActing(false); }
  };

  // Used when liking a feed profile (send imageLiked)
  const handleLikePhoto = async () => {
    if (!id || acting) return;
    const primaryPhoto = profile?.photos?.find((p) => p.isPrimary) ?? profile?.photos?.[0];
    if (!primaryPhoto) {
      Alert.alert('No photo', 'This profile has no photos to like.');
      return;
    }
    try {
      setActing(true);
      await swipeApi.imageLiked(id, primaryPhoto.id, comment);
      setShowModal(false);
      setComment('');
      router.back();
    } catch { Alert.alert('Error', 'Could not send like.'); }
    finally { setActing(false); }
  };

  // Used when accepting someone who liked us (creates a match)
  const handleAccept = async () => {
    if (!id || acting) return;
    try {
      setActing(true);
      await matchApi.accept(id, comment);
      setShowModal(false);
      setComment('');
      Alert.alert("It's a Match! 🎉", `You and ${profile?.name} are now connected!`, [
        { text: 'Say Hi', onPress: () => router.replace(`/chat/${id}`) },
        { text: 'Continue', onPress: () => router.back() },
      ]);
    } catch { Alert.alert('Error', 'Could not accept.'); }
    finally { setActing(false); }
  };

  const handleLikePrompt = async (promptId: string) => {
    if (!id || acting) return;
    try {
      setActing(true);
      await swipeApi.behaviourLiked(id, promptId, '');
      router.back();
    } catch { Alert.alert('Error', 'Could not like prompt.'); }
    finally { setActing(false); }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.primary} /></View>;
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
  const onPositivePress = isFromLike ? handleAccept : handleLikePhoto;
  const positiveLabel = isFromLike ? 'Accept' : 'Send Like';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={C.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {primaryPhoto && (
          <Image source={{ uri: primaryPhoto.url }} style={styles.heroPhoto} />
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{profile.name}</Text>

          {profile.prompts?.map((p, i) => (
            <View key={i} style={styles.promptCard}>
              <Text style={styles.promptQ}>{p.question}</Text>
              <Text style={styles.promptA}>{p.answer}</Text>
              {!isFromLike && (
                <TouchableOpacity style={styles.promptHeart} onPress={() => handleLikePrompt(p.id)} disabled={acting}>
                  <Ionicons name="heart" size={20} color={C.gold} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {profile.photos && profile.photos.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {profile.photos.slice(1).map((ph) => (
                <Image key={ph.id} source={{ uri: ph.url }} style={styles.stripPhoto} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.passBtn} onPress={handlePass} disabled={acting}>
          <MaterialCommunityIcons name="sword-cross" size={28} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={() => setShowModal(true)} disabled={acting}>
          <Ionicons name="heart" size={28} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {primaryPhoto && <Image source={{ uri: primaryPhoto.url }} style={styles.modalPhoto} />}
            <View style={styles.likedBadge}>
              <Ionicons name="heart" size={14} color={C.primary} />
              <Text style={styles.likedBadgeText}>
                {isFromLike ? `Accept ${profile.name}` : `You liked ${profile.name}`}
              </Text>
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={C.textMuted}
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.sendLikeBtn} onPress={onPositivePress} disabled={acting}>
              {acting
                ? <ActivityIndicator color={C.primary} />
                : <Text style={styles.sendLikeBtnText}>{positiveLabel}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F1EF' },
  centered: { flex: 1, backgroundColor: '#F2F1EF', alignItems: 'center', justifyContent: 'center' },
  closeBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: '#fff', borderRadius: 20, padding: 6, elevation: 2,
  },
  heroPhoto: { width: '100%', height: 460 },
  info: { padding: 20 },
  name: { fontSize: 28, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  promptCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  promptQ: { color: C.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  promptA: { color: C.textPrimary, fontSize: 18, fontWeight: '700', lineHeight: 26 },
  promptHeart: { position: 'absolute', bottom: 12, right: 12 },
  stripPhoto: { width: 140, height: 180, borderRadius: 12, marginRight: 10 },
  actions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 20, paddingBottom: 40,
    backgroundColor: '#F2F1EF', borderTopWidth: 1, borderTopColor: C.separator,
  },
  passBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  likeBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.peach, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalPhoto: { width: '100%', height: 160, borderRadius: 14, marginBottom: 16 },
  likedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.peach, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 16 },
  likedBadgeText: { fontSize: 13, fontWeight: '700', color: C.primary },
  commentInput: { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, fontSize: 15, color: C.textPrimary, marginBottom: 14 },
  sendLikeBtn: { backgroundColor: C.peach, borderRadius: 100, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  sendLikeBtnText: { color: C.primary, fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: C.textMuted, fontSize: 15 },
  errorText: { fontSize: 16, color: C.textMuted, marginBottom: 16 },
  backLink: { color: C.primary, fontSize: 15, fontWeight: '600' },
});
