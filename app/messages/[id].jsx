import {
  View,
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
import * as Clipboard from 'expo-clipboard';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../libs/supabase';
import { useTheme } from '../../hooks/useTheme';
import { useMessagingStore } from '../../src/store/useMessagingStore';
import {
  isMessageVisibleForUser,
  fetchMessagesWithReplies,
  softDeleteMessageForUser,
  deleteMessageForEveryone,
} from '../../libs/messageUtils';
import { isUserBlocked } from '../../libs/blockUtils';
import { FlashList } from '@shopify/flash-list';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import MessageBubble from '../../components/messages/MessageBubble';
import MessageActionMenu from '../../components/messages/MessageActionMenu';
import ReplyPreviewBar from '../../components/messages/ReplyPreviewBar';

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

  const flashListRef = useRef(null);
  const inputRef = useRef(null);

  const [otherProfile, setOtherProfile] = useState(null);

  const [messages, setMessages] = useState([]);

  const [inputText, setInputText] = useState('');

  const [loading, setLoading] = useState(true);

  const [isBlocked, setIsBlocked] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);

  const [actionMenu, setActionMenu] = useState({
    visible: false,
    message: null,
    anchor: null,
    isMine: false,
  });

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
      const data = await fetchMessagesWithReplies(
        supabase,
        user.id,
        otherUserId
      );

      setMessages(data);

      const blocked = await isUserBlocked(supabase, user.id, otherUserId);
      setIsBlocked(blocked);
    } catch (err) {
      console.error('[fetchMessages] Mesajlar yüklenirken hata:', err);
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
      console.error('[markAsRead] Okundu işaretlenirken hata:', error);

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

        async (payload) => {
          if (payload.new.sender_id === otherUserId) {
            const blocked = await isUserBlocked(supabase, user.id, otherUserId);
            if (blocked) return;

            if (isMessageVisibleForUser(payload.new, user.id)) {
              setMessages((prev) => [...prev, payload.new]);
            }

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
          setMessages((prev) => {
            if (!isMessageVisibleForUser(payload.new, user.id)) {
              return prev.filter((m) => m.id !== payload.new.id);
            }

            return prev.map((m) =>
              m.id === payload.new.id ? payload.new : m
            );
          });
        }
      )

      .on(
        'postgres_changes',

        {
          event: 'UPDATE',

          schema: 'public',

          table: 'messages',

          filter: `receiver_id=eq.${user.id}`,
        },

        (payload) => {
          if (
            payload.new.sender_id !== otherUserId &&
            payload.new.receiver_id !== otherUserId
          ) {
            return;
          }

          setMessages((prev) => {
            if (!isMessageVisibleForUser(payload.new, user.id)) {
              return prev.filter((m) => m.id !== payload.new.id);
            }

            const exists = prev.some((m) => m.id === payload.new.id);
            if (!exists) {
              return [...prev, payload.new];
            }

            return prev.map((m) =>
              m.id === payload.new.id ? payload.new : m
            );
          });
        }
      )

      .on(
        'postgres_changes',

        {
          event: 'DELETE',

          schema: 'public',

          table: 'messages',
        },

        (payload) => {
          const deleted = payload.old;
          const isInThisChat =
            (deleted.sender_id === user.id &&
              deleted.receiver_id === otherUserId) ||
            (deleted.sender_id === otherUserId &&
              deleted.receiver_id === user.id);

          if (!isInThisChat) return;

          setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, otherUserId, markAsRead]);

  const handleSend = async () => {
    const content = inputText.trim();

    if (!content || !user?.id || isBlocked) return;

    const replyToId = replyingTo?.id ?? null;

    setInputText('');
    setReplyingTo(null);

    const optimisticMsg = {
      id: `temp-${Date.now()}`,

      sender_id: user.id,

      receiver_id: otherUserId,

      content,

      created_at: new Date().toISOString(),

      is_read: false,

      deleted_for_sender: false,

      deleted_for_receiver: false,

      reply_to_id: replyToId,

      reply_to: replyingTo
        ? {
            id: replyingTo.id,
            content: replyingTo.content,
            sender_id: replyingTo.sender_id,
          }
        : null,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,

        receiver_id: otherUserId,

        content,

        created_at: new Date().toISOString(),

        is_read: false,

        reply_to_id: replyToId,
      });

      if (error) throw error;

      fetchMessages();
    } catch (err) {
      console.error('[handleSend] Mesaj gönderilirken hata:', err);

      Alert.alert('Hata', 'Mesaj gönderilemedi.');

      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  const handleDeleteForMe = useCallback(
    async (message) => {
      if (!user?.id) return;

      setMessages((prev) => prev.filter((m) => m.id !== message.id));

      try {
        await softDeleteMessageForUser(supabase, message, user.id);
        useMessagingStore.getState().fetchUnreadCount(user.id);
      } catch (error) {
        console.error('[handleDeleteForMe] Mesaj silinirken hata:', error);
        Alert.alert('Hata', 'Mesaj silinemedi. Lütfen tekrar deneyin.');
        fetchMessages();
      }
    },
    [user?.id, fetchMessages]
  );

  const handleDeleteForEveryone = useCallback(
    async (message) => {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));

      try {
        await deleteMessageForEveryone(supabase, message.id);
      } catch (error) {
        console.error(
          '[handleDeleteForEveryone] Mesaj silinirken hata:',
          error
        );
        Alert.alert('Hata', 'Mesaj herkesten silinemedi. Lütfen tekrar deneyin.');
        fetchMessages();
      }
    },
    [fetchMessages]
  );

  const handleShowDeleteOptions = useCallback(
    (message) => {
      const isMine = message.sender_id === user.id;
      const options = [
        {
          text: 'Benden sil',
          onPress: () => handleDeleteForMe(message),
        },
        { text: 'İptal', style: 'cancel' },
      ];

      if (isMine) {
        options.unshift({
          text: 'Herkesten sil',
          style: 'destructive',
          onPress: () => handleDeleteForEveryone(message),
        });
      }

      Alert.alert('Mesajı sil', 'Bu mesajı nasıl silmek istiyorsunuz?', options);
    },
    [user.id, handleDeleteForMe, handleDeleteForEveryone]
  );

  const handleReply = useCallback((message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  }, []);

  const handleLongPress = useCallback((message, anchor) => {
    setActionMenu({
      visible: true,
      message,
      anchor,
      isMine: message.sender_id === user.id,
    });
  }, [user.id]);

  const handleCopy = useCallback(async (content) => {
    try {
      await Clipboard.setStringAsync(content);
    } catch (error) {
      console.error('[handleCopy] Kopyalama hatası:', error);
      Alert.alert('Hata', 'Mesaj kopyalanamadı.');
    }
  }, []);

  const closeActionMenu = useCallback(() => {
    setActionMenu({
      visible: false,
      message: null,
      anchor: null,
      isMine: false,
    });
  }, []);

  const fullName = otherProfile?.full_name || 'Kullanıcı';

  const avatarUrl =
    otherProfile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;

  const renderMessage = useCallback(
    ({ item }) => {
      const isMine = item.sender_id === user.id;

      return (
        <MessageBubble
          message={item}
          isMine={isMine}
          colors={colors}
          currentUserId={user.id}
          otherUserName={fullName}
          formatMessageTime={formatMessageTime}
          onLongPress={handleLongPress}
          onReply={handleReply}
        />
      );
    },
    [user.id, colors, fullName, handleLongPress, handleReply]
  );

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
        <FlashList
          ref={flashListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flashListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {isBlocked && (
          <View style={styles.blockedBanner}>
            <ThemedText style={styles.blockedText}>
              Bu kullanıcıyla mesajlaşma engellendi.
            </ThemedText>
          </View>
        )}

        <ReplyPreviewBar
          message={replyingTo}
          senderName={
            replyingTo?.sender_id === user.id ? 'Sen' : fullName
          }
          colors={colors}
          onCancel={() => setReplyingTo(null)}
        />

        <View style={[styles.inputRow, { borderColor: colors.borderColor }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.title }]}
            placeholder={isBlocked ? 'Mesaj gönderilemez' : 'Mesaj yaz'}
            placeholderTextColor='#9CA3AF'
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isBlocked}
          />

          <Pressable
            onPress={handleSend}
            style={[styles.sendButton, isBlocked && styles.sendButtonDisabled]}
            disabled={isBlocked}
          >
            <Ionicons name='send' size={20} color='#FFF' />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <MessageActionMenu
        visible={actionMenu.visible}
        anchor={actionMenu.anchor}
        isMine={actionMenu.isMine}
        onClose={closeActionMenu}
        onReply={() => handleReply(actionMenu.message)}
        onCopy={() => handleCopy(actionMenu.message?.content)}
        onDelete={() => handleShowDeleteOptions(actionMenu.message)}
      />
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

  blockedBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },

  blockedText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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

  sendButtonDisabled: {
    opacity: 0.4,
  },
});
