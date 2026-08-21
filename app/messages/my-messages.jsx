import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../libs/supabase';
import { useTheme } from '../../hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import {
  isMessageVisibleForUser,
  softDeleteConversationForUser,
} from '../../libs/messageUtils';
import { blockUser, getBlockedUserIds } from '../../libs/blockUtils';

import ThemedView from '../../components/ThemedView';
import MessagesListHeader from '../../components/messages/MessagesListHeader';
import MessagesSearchBar from '../../components/messages/MessagesSearchBar';
import OnlineUsersStrip from '../../components/messages/OnlineUsersStrip';
import MatchesSection from '../../components/messages/MatchesSection';
import MessagesEmptyState from '../../components/messages/MessagesEmptyState';
import SwipeableConversationRow from '../../components/messages/SwipeableConversationRow';
import { fetchUserMatches } from '../../libs/matchUtils';

const MessagesList = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const swipeableRefs = useRef({});

  const fetchMatches = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await fetchUserMatches(supabase, user.id);
      setMatches(data);
    } catch (err) {
      console.error('[fetchMatches] Eşleşmeler yüklenirken hata:', err);
    }
  }, [user?.id]);

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
      const unreadCountMap = new Map();
      const listingIdMap = new Map();

      visibleMessages.forEach((msg) => {
        const otherId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        if (!lastMessageMap.has(otherId)) {
          lastMessageMap.set(otherId, msg);
          if (msg.listing_id) {
            listingIdMap.set(otherId, msg.listing_id);
          }
        }

        if (msg.receiver_id === user.id && !msg.is_read) {
          unreadCountMap.set(
            msg.sender_id,
            (unreadCountMap.get(msg.sender_id) || 0) + 1
          );
        }
      });

      const otherIds = Array.from(lastMessageMap.keys());
      if (otherIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, last_seen_at, show_online_status')
        .in('id', otherIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

      const listingIds = Array.from(new Set(listingIdMap.values())).filter(
        Boolean
      );
      let listingMap = new Map();

      if (listingIds.length > 0) {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, name')
          .in('id', listingIds);

        if (listingsError) throw listingsError;
        listingMap = new Map((listingsData || []).map((l) => [l.id, l]));
      }

      const list = otherIds
        .map((id) => ({
          otherUserId: id,
          lastMessage: lastMessageMap.get(id),
          profile: profileMap.get(id),
          listing: listingIdMap.get(id)
            ? listingMap.get(listingIdMap.get(id))
            : null,
          unreadCount: unreadCountMap.get(id) || 0,
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
    }
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchConversations(), fetchMatches()]);
      setLoading(false);
    };
    loadData();
  }, [fetchConversations, fetchMatches]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`pet-matches-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pet_matches',
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchMatches]);

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, item) => sum + item.unreadCount, 0),
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((item) =>
      (item.profile?.full_name || '').toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const handleBlockUser = useCallback(
    async (otherUserId) => {
      if (!user?.id) return;

      try {
        await blockUser(supabase, user.id, otherUserId);
        setBlockedIds((prev) => new Set([...prev, otherUserId]));
      } catch (error) {
        console.error('[handleBlockUser] Engelleme hatası:', error);
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
        console.error('[handleDeleteConversation] Konuşma silinirken hata:', error);
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

  const handleOpenMatch = useCallback(
    (match) => {
      router.push({
        pathname: '/messages/[id]',
        params: {
          id: match.otherUserId,
          myPetId: match.myPetId ?? '',
          matchedPetId: match.matchedPetId ?? '',
        },
      });
    },
    [router]
  );

  const handleOpenConversation = useCallback(
    (otherUserId) => {
      router.push(`/messages/${otherUserId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <SwipeableConversationRow
        item={item}
        userId={user.id}
        colors={colors}
        isBlocked={blockedIds.has(item.otherUserId)}
        listing={item.listing}
        unreadCount={item.unreadCount}
        swipeableRef={(ref) => {
          swipeableRefs.current[item.otherUserId] = ref;
        }}
        onPress={() => handleOpenConversation(item.otherUserId)}
        onDelete={handleDeleteConversation}
        onBlock={handleBlockUser}
        onSwipeableWillOpen={() => handleSwipeableWillOpen(item.otherUserId)}
      />
    ),
    [
      user.id,
      colors,
      blockedIds,
      handleOpenConversation,
      handleDeleteConversation,
      handleBlockUser,
      handleSwipeableWillOpen,
    ]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <MessagesSearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <MatchesSection matches={matches} onPressMatch={handleOpenMatch} />
        <OnlineUsersStrip
          conversations={conversations}
          onPressConversation={handleOpenConversation}
        />
        {conversations.length > 0 || matches.length > 0 ? (
          <View
            style={[styles.divider, { backgroundColor: colors.borderColor }]}
          />
        ) : null}
      </View>
    ),
    [searchQuery, conversations, matches, colors.borderColor, handleOpenMatch, handleOpenConversation]
  );

  return (
    <ThemedView style={styles.container} safe={true}>
      <MessagesListHeader
        unreadCount={totalUnreadCount}
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      ) : conversations.length === 0 && matches.length === 0 ? (
        <MessagesEmptyState />
      ) : conversations.length === 0 && matches.length > 0 ? (
        listHeader
      ) : filteredConversations.length === 0 && conversations.length > 0 ? (
        <>
          {listHeader}
          <MessagesEmptyState isSearchResult searchQuery={searchQuery} />
        </>
      ) : (
        <FlashList
          data={filteredConversations}
          keyExtractor={(item) => item.otherUserId}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginBottom: 4,
  },
});
