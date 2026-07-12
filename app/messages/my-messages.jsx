import {
  View,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../libs/supabase';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';

const MessagesList = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const lastMessageMap = new Map();
      (data || []).forEach((msg) => {
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
    } catch (err) {
      console.error('Konuşmalar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const renderItem = ({ item }) => {
    const fullName = item.profile?.full_name || 'Kullanıcı';
    const avatarUrl =
      item.profile?.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;
    const isUnread =
      !item.lastMessage.is_read && item.lastMessage.receiver_id === user.id;

    return (
      <Pressable
        style={[styles.row, { borderColor: colors.borderColor }]}
        onPress={() => router.push(`/messages/${item.otherUserId}`)}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.textWrapper}>
          <ThemedText style={styles.name}>{fullName}</ThemedText>
          <ThemedText
            style={[
              styles.preview,
              isUnread && { fontWeight: '700', color: colors.title },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.content}
          </ThemedText>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

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
        <FlatList
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  textWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  preview: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2B62E5',
  },
});
