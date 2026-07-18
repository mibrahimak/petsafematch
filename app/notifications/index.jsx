import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useCallback, useContext } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { useNotificationStore } from '../../src/store/useNotificationStore';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} sa önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR');
};

const NotificationIcon = ({ type }) => {
  if (type === 'favorite') {
    return <FontAwesome name='heart' size={20} color='#EF4444' />;
  }
  if (type === 'match') {
    return <Ionicons name='paw' size={20} color='#2563EB' />;
  }
  return <Ionicons name='notifications' size={20} color='#6B7280' />;
};

const NotificationsScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const notifications = useNotificationStore((state) => state.notifications);
  const loading = useNotificationStore((state) => state.loading);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const handleNotificationPress = useCallback(
    async (notification) => {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      const listingId = notification.data?.listing_id;
      if (listingId) {
        router.push({ pathname: '/ilan/[id]', params: { id: listingId } });
      }
    },
    [markAsRead, router]
  );

  const handleMarkAllRead = useCallback(() => {
    if (user?.id) {
      markAllAsRead(user.id);
    }
  }, [user?.id, markAllAsRead]);

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.is_read ? colors.background : colors.cardBg,
            borderColor: colors.borderColor,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          <NotificationIcon type={item.type} />
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={[styles.body, { color: colors.text + '99' }]}>
            {item.body}
          </ThemedText>
          <ThemedText style={[styles.time, { color: colors.text + '66' }]}>
            {formatDate(item.created_at)}
          </ThemedText>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </Pressable>
    ),
    [colors, handleNotificationPress]
  );

  return (
    <ThemedView style={styles.container} safe>
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={colors.title} />
        </Pressable>
        <ThemedText style={styles.headerTitle} title>
          Bildirimler
        </ThemedText>
        {notifications.some((n) => !n.is_read) && (
          <Pressable onPress={handleMarkAllRead}>
            <ThemedText style={styles.markAllText}>Tümünü oku</ThemedText>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size='large'
          color='#2563EB'
          style={styles.loader}
        />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name='notifications-off-outline'
            size={48}
            color={colors.text + '44'}
          />
          <ThemedText style={[styles.emptyText, { color: colors.text + '66' }]}>
            Henüz bildiriminiz yok
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  markAllText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
