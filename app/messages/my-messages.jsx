import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../libs/supabase';
import { useTheme } from '../../hooks/useTheme';
import {
  isMessageVisibleForUser,
  softDeleteConversationForUser,
} from '../../libs/messageUtils';
import { blockUser, getBlockedUserIds } from '../../libs/blockUtils';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import SwipeableConversationRow from '../../components/messages/SwipeableConversationRow';
import { FlashList } from '@shopify/flash-list';

const MessagesList = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockedIds, setBlockedIds] = useState(new Set());
  const swipeableRefs = useRef({});

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const visibleMessages = (data || []).filter((msg) =>
        isMessageVisibleForUser(msg, user.id)
      );

      const lastMessageMap = new Map();
      visibleMessages.forEach((msg) => {
        const otherId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!lastMessageMap.has(otherId)) {
          lastMessageMap.set(otherId, msg);
        }
      });

      const otherIds = Array.from(lastMessageMap.keys());
      if (otherIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', otherIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

      const list = otherIds
        .map((id) => ({
          otherUserId: id,
          lastMessage: lastMessageMap.get(id),
          profile: profileMap.get(id),
        }))
        .sort(
          (a, b) =>
            new Date(b.lastMessage.created_at) -
            new Date(a.lastMessage.created_at)
        );

      setConversations(list);

      const blocked = await getBlockedUserIds(supabase, user.id);
      setBlockedIds(new Set(blocked));
    } catch (err) {
      console.error('[fetchConversations] Konuşmalar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleBlockUser = useCallback(
    async (otherUserId) => {
      if (!user?.id) return;

      try {
        await blockUser(supabase, user.id, otherUserId);
        setBlockedIds((prev) => new Set([...prev, otherUserId]));
      } catch (error) {
        console.error('[handleBlockUser] Engelleme hatası:', error);
        Alert.alert('Hata', 'Kullanıcı engellenemedi. Lütfen tekrar deneyin.');
      }
    },
    [user?.id]
  );

  const handleDeleteConversation = useCallback(
    async (otherUserId) => {
      if (!user?.id) return;

      setConversations((prev) =>
        prev.filter((item) => item.otherUserId !== otherUserId)
      );

      try {
        await softDeleteConversationForUser(supabase, user.id, otherUserId);
      } catch (error) {
        console.error(
          '[handleDeleteConversation] Konuşma silinirken hata:',
          error
        );
        Alert.alert('Hata', 'Konuşma silinemedi. Lütfen tekrar deneyin.');
        fetchConversations();
      }
    },
    [user?.id, fetchConversations]
  );

  const handleSwipeableWillOpen = useCallback((otherUserId) => {
    Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
      if (id !== otherUserId && ref?.close) {
        ref.close();
      }
    });
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <SwipeableConversationRow
        item={item}
        userId={user.id}
        colors={colors}
        isBlocked={blockedIds.has(item.otherUserId)}
        swipeableRef={(ref) => {
          swipeableRefs.current[item.otherUserId] = ref;
        }}
        onPress={() => router.push(`/messages/${item.otherUserId}`)}
        onDelete={handleDeleteConversation}
        onBlock={handleBlockUser}
        onSwipeableWillOpen={() => handleSwipeableWillOpen(item.otherUserId)}
      />
    ),
    [user.id, colors, router, blockedIds, handleDeleteConversation, handleBlockUser, handleSwipeableWillOpen]
  );

  return (
    <ThemedView style={styles.container} safe={true}>
      <View style={[styles.header, { borderColor: colors.borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={colors.title} />
        </Pressable>
        <ThemedText style={styles.headerTitle} title={true}>
          Mesajlar
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name='chatbubble-ellipses-outline'
            size={64}
            color='#9CA3AF'
          />
          <ThemedText style={styles.emptyText}>
            Henüz bir mesajınız yok
          </ThemedText>
        </View>
      ) : (
        <FlashList
          data={conversations}
          keyExtractor={(item) => item.otherUserId}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
};

export default MessagesList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
});
