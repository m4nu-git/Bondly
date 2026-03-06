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

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useToken();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const { sendMessage } = useSocket({
    conversationId: id,
    onMessage: (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
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
    sendMessage(id, text.trim());
    setText('');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E85D75" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
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
                {item.content}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#555"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color={text.trim() ? '#E85D75' : '#333'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  centered: { flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 60,
    paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 12, marginBottom: 8 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#E85D75', borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: '#1A1A1A', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15 },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTextTheirs: { color: '#FFFFFF' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    borderTopWidth: 1, borderTopColor: '#1E1E1E',
    padding: 12, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: '#1A1A1A', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, color: '#FFFFFF', fontSize: 15, maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
