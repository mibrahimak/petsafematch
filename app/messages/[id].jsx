import {
  View,
  FlatList,
  Pressable,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../contexts/AuthContext';

import { supabase } from '../../libs/supabase';

import { useTheme } from '../../hooks/useTheme';

import { useMessagingStore } from '../../src/store/useMessagingStore';

import ThemedView from '../../components/ThemedView';

import ThemedText from '../../components/ThemedText';

const formatMessageTime = (dateString) => {
  const date = new Date(dateString);

  const now = new Date();

  const time = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',

    minute: '2-digit',
  });

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);

  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return time;

  if (isYesterday) return `Dün ${time}`;

  return date.toLocaleDateString('tr-TR');
};

const ChatScreen = () => {
  const { id: otherUserId } = useLocalSearchParams();

  const { user } = useContext(AuthContext);

  const { colors } = useTheme();

  const router = useRouter();

  const flatListRef = useRef(null);

  const [otherProfile, setOtherProfile] = useState(null);

  const [messages, setMessages] = useState([]);

  const [inputText, setInputText] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchOtherProfile = useCallback(async () => {
    const { data, error } = await supabase

      .from('profiles')

      .select('id, full_name, avatar_url')

      .eq('id', otherUserId)

      .single();

    if (!error) setOtherProfile(data);
  }, [otherUserId]);

  const fetchMessages = useCallback(async () => {
    if (!user?.id || !otherUserId) return;

    try {
      const { data, error } = await supabase

        .from('messages')

        .select('*')

        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )

        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      console.error('Mesajlar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, otherUserId]);

  const markAsRead = useCallback(async () => {
    if (!user?.id || !otherUserId) return;

    const { error } = await supabase

      .from('messages')

      .update({ is_read: true })

      .eq('sender_id', otherUserId)

      .eq('receiver_id', user.id)

      .eq('is_read', false);

    if (error) {
      console.error('Okundu işaretlenirken hata:', error);

      return;
    }

    useMessagingStore.getState().fetchUnreadCount(user.id);
  }, [user?.id, otherUserId]);

  useEffect(() => {
    fetchOtherProfile();

    fetchMessages();

    markAsRead();
  }, [fetchOtherProfile, fetchMessages, markAsRead]);

  useEffect(() => {
    if (!user?.id || !otherUserId) return;

    const channel = supabase

      .channel(`chat-${user.id}-${otherUserId}`)

      .on(
        'postgres_changes',

        {
          event: 'INSERT',

          schema: 'public',

          table: 'messages',

          filter: `receiver_id=eq.${user.id}`,
        },

        (payload) => {
          if (payload.new.sender_id === otherUserId) {
            setMessages((prev) => [...prev, payload.new]);

            markAsRead();
          }
        }
      )

      .on(
        'postgres_changes',

        {
          event: 'UPDATE',

          schema: 'public',

          table: 'messages',

          filter: `sender_id=eq.${user.id}`,
        },

        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, otherUserId, markAsRead]);

  const handleSend = async () => {
    const content = inputText.trim();

    if (!content || !user?.id) return;

    setInputText('');

    const optimisticMsg = {
      id: `temp-${Date.now()}`,

      sender_id: user.id,

      receiver_id: otherUserId,

      content,

      created_at: new Date().toISOString(),

      is_read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,

        receiver_id: otherUserId,

        content,

        created_at: new Date().toISOString(),

        is_read: false,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Mesaj gönderilirken hata:', err);

      Alert.alert('Hata', 'Mesaj gönderilemedi.');

      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  const fullName = otherProfile?.full_name || 'Kullanıcı';

  const avatarUrl =
    otherProfile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === user.id;

    return (
      <View
        style={[
          styles.bubble,

          isMine
            ? [styles.bubbleMine, { backgroundColor: colors.primary }]
            : [styles.bubbleTheirs, { backgroundColor: '#1e293b' }],
        ]}
      >
        <ThemedText style={isMine ? [styles.textMine] : [styles.textTheirs]}>
          {item.content}
        </ThemedText>

        <View style={styles.metaRow}>
          <ThemedText style={styles.metaText}>
            {formatMessageTime(item.created_at)}
          </ThemedText>

          {isMine && (
            <View style={styles.readStatus}>
              <Ionicons
                name={item.is_read ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={item.is_read ? '#A5F3FC' : 'rgba(255,255,255,0.7)'}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer} safe={true}>
        <ActivityIndicator size='large' color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container} safe={true}>
      <View style={[styles.header, { borderColor: colors.borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={colors.title} />
        </Pressable>

        <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />

        <ThemedText style={[styles.headerName, { color: colors.title }]}>
          {fullName}
        </ThemedText>

        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={[styles.inputRow, { borderColor: colors.borderColor }]}>
          <TextInput
            style={[styles.input, { color: colors.title }]}
            placeholder='Mesaj yaz'
            placeholderTextColor='#9CA3AF'
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Ionicons name='send' size={20} color='#FFF' />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 12,

    paddingVertical: 12,

    borderBottomWidth: 1,

    gap: 10,
  },

  backButton: { width: 32 },

  headerAvatar: { width: 32, height: 32, borderRadius: 16 },

  headerName: { fontSize: 16, fontWeight: '700', flex: 1 },

  messagesList: { padding: 16, gap: 8 },

  bubble: {
    maxWidth: '75%',

    borderRadius: 16,

    paddingHorizontal: 14,

    paddingVertical: 10,

    marginBottom: 4,
  },

  bubbleMine: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },

  bubbleTheirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },

  textMine: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  textTheirs: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  metaRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-end',

    marginTop: 4,

    gap: 6,

    flexWrap: 'wrap',
  },

  metaText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
  },

  metaTextMine: {
    color: '#94a3b8',
  },

  readStatus: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 2,
  },

  inputRow: {
    flexDirection: 'row',

    alignItems: 'flex-end',

    paddingHorizontal: 12,

    paddingVertical: 10,

    borderTopWidth: 1,

    gap: 10,
  },

  input: {
    flex: 1,

    maxHeight: 100,

    fontSize: 15,

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderRadius: 20,

    backgroundColor: 'rgba(120,120,120,0.15)',
  },

  sendButton: {
    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: '#2B62E5',

    justifyContent: 'center',

    alignItems: 'center',
  },
});
