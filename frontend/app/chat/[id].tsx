import { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chatApi, Message } from '@/api/chat';
import { useToken } from '@/context/TokenContext';
import { useSocket } from '@/hooks/useSocket';
import { C } from '@/constants/Colors';

export default function ChatRoomScreen() {
  // id = the other user's userId
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useToken();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const { sendMessage } = useSocket({
    onMessage: (payload) => {
      // Payload from WS: { senderId, message }
      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: payload.senderId,
        receiverId: userId ?? '',
        message: payload.message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      flatListRef.current?.scrollToEnd({ animated: true });
    },
  });

  useEffect(() => {
    if (!id) return;
    chatApi.getMessages(id)
      .then((data) => {
        setMessages(data);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const send = () => {
    if (!text.trim() || !id) return;
    const msg = text.trim();
    setText('');
    // Optimistic update
    const optimistic: Message = {
      id: Date.now().toString(),
      senderId: userId ?? '',
      receiverId: id,
      message: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    flatListRef.current?.scrollToEnd({ animated: true });
    sendMessage(id, msg);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMine = item.senderId === userId;
          return (
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                {item.message}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={C.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxHeight={100}
        />
        <TouchableOpacity
          style={[styles.sendBtn, text.trim() && styles.sendBtnActive]}
          onPress={send}
          disabled={!text.trim()}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 60, paddingBottom: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: C.separator, backgroundColor: '#fff',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 12, marginBottom: 8 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: C.senderBubble, borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: C.receiverBubble, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: C.textPrimary },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    borderTopWidth: 1, borderTopColor: C.separator,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8, backgroundColor: '#fff',
  },
  input: {
    flex: 1, backgroundColor: '#F5F5F5', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: C.textPrimary,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.disabled, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: C.primary },
});
