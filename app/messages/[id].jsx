import {
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { groupMessagesWithDateSeparators } from '../../utils/messageGrouping';
import { FlashList } from '@shopify/flash-list';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import MessageBubble from '../../components/messages/MessageBubble';
import MessageActionMenu from '../../components/messages/MessageActionMenu';
import ReplyPreviewBar from '../../components/messages/ReplyPreviewBar';
import ChatHeader from '../../components/messages/ChatHeader';
import ChatPetContextBanner from '../../components/messages/ChatPetContextBanner';
import ChatInputBar from '../../components/messages/ChatInputBar';
import MessageDateSeparator from '../../components/messages/MessageDateSeparator';
import { getVisibleLastSeen } from '../../utils/privacyUtils';

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
  const {
    id: otherUserId,
    listingId: listingIdParam,
    myPetId,
    matchedPetId,
  } = useLocalSearchParams();

  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const flashListRef = useRef(null);
  const inputRef = useRef(null);
  const swipeableRefs = useRef({});

  const [otherProfile, setOtherProfile] = useState(null);
  const [listing, setListing] = useState(null);
  const [matchPetNames, setMatchPetNames] = useState(null);
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

  const activeListingId = useMemo(() => {
    if (listingIdParam) return listingIdParam;
    const withListing = [...messages].reverse().find((msg) => msg.listing_id);
    return withListing?.listing_id ?? null;
  }, [listingIdParam, messages]);

  const fetchOtherProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, last_seen_at, show_online_status')
      .eq('id', otherUserId)
      .single();

    if (!error) setOtherProfile(data);
  }, [otherUserId]);

  const fetchMatchPetNames = useCallback(async () => {
    if (!myPetId || !matchedPetId) {
      setMatchPetNames(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_pets')
        .select('id, name')
        .in('id', [myPetId, matchedPetId]);

      if (error) throw error;

      const petMap = new Map((data || []).map((pet) => [pet.id, pet.name]));
      setMatchPetNames({
        myPetName: petMap.get(myPetId),
        matchedPetName: petMap.get(matchedPetId),
      });
    } catch (error) {
      console.error(
        '[fetchMatchPetNames] Eşleşme pet bilgisi yüklenirken hata:',
        error
      );
      setMatchPetNames(null);
    }
  }, [myPetId, matchedPetId]);

  const fetchListing = useCallback(async (listingId) => {
    if (!listingId) {
      setListing(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, name, city')
        .eq('id', listingId)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('[fetchListing] İlan yüklenirken hata:', error);
      setListing(null);
    }
  }, []);

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
    fetchMatchPetNames();
  }, [fetchMatchPetNames]);

  useEffect(() => {
    fetchListing(activeListingId);
  }, [activeListingId, fetchListing]);

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

            return prev.map((m) => (m.id === payload.new.id ? payload.new : m));
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

            return prev.map((m) => (m.id === payload.new.id ? payload.new : m));
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
    const listingId = activeListingId ?? null;

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
      listing_id: listingId,
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
        listing_id: listingId,
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
        Alert.alert(
          'Hata',
          'Mesaj herkesten silinemedi. Lütfen tekrar deneyin.'
        );
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

      Alert.alert(
        'Mesajı sil',
        'Bu mesajı nasıl silmek istiyorsunuz?',
        options
      );
    },
    [user.id, handleDeleteForMe, handleDeleteForEveryone]
  );

  const handleReply = useCallback((message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  }, []);

  const handleSwipeableWillOpen = useCallback((messageId) => {
    Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
      if (id !== messageId && ref?.close) {
        ref.close();
      }
    });
  }, []);

  const handleLongPress = useCallback((message, anchor) => {
    setActionMenu({
      visible: true,
      message,
      anchor,
      isMine: message.sender_id === user.id,
    });
  }, []);

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
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5046e5&color=fff&size=150`;

  const listItems = useMemo(
    () => groupMessagesWithDateSeparators(messages),
    [messages]
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === 'date') {
        return <MessageDateSeparator label={item.dateLabel} />;
      }

      const message = item.message;
      const isMine = message.sender_id === user.id;

      return (
        <MessageBubble
          message={message}
          isMine={isMine}
          colors={colors}
          currentUserId={user.id}
          otherUserName={fullName}
          formatMessageTime={formatMessageTime}
          onLongPress={handleLongPress}
          onReply={handleReply}
          swipeableRef={(ref) => {
            swipeableRefs.current[message.id] = ref;
          }}
          onSwipeableWillOpen={() => handleSwipeableWillOpen(message.id)}
        />
      );
    },
    [
      user.id,
      colors,
      fullName,
      handleLongPress,
      handleReply,
      handleSwipeableWillOpen,
    ]
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer} safe={true}>
        <ActivityIndicator size='large' color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.container} safe={true}>
        <ChatHeader
          fullName={fullName}
          avatarUrl={avatarUrl}
          lastSeenAt={getVisibleLastSeen(otherProfile)}
          onBack={() => router.back()}
        />

        <ChatPetContextBanner
          petName={listing?.name}
          myPetName={matchPetNames?.myPetName}
          matchedPetName={matchPetNames?.matchedPetName}
          listingCity={listing?.city}
        />

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FlashList
            ref={flashListRef}
            data={listItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flashListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {isBlocked ? (
            <View style={styles.blockedBanner}>
              <ThemedText style={styles.blockedText}>
                Bu kullanıcıyla mesajlaşma engellendi.
              </ThemedText>
            </View>
          ) : null}

          <ReplyPreviewBar
            message={replyingTo}
            senderName={replyingTo?.sender_id === user.id ? 'Sen' : fullName}
            colors={colors}
            onCancel={() => setReplyingTo(null)}
          />
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

      <ChatInputBar
        inputRef={inputRef}
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        editable={!isBlocked}
        placeholder={isBlocked ? 'Mesaj gönderilemez' : 'Mesaj yaz'}
      />
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
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
});
