import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { useNotificationStore } from '../../src/store/useNotificationStore';
import { useTheme } from '../../hooks/useTheme';
import { groupNotifications } from '../../utils/notificationGrouping';

import ThemedView from '../../components/ThemedView';
import NotificationHeader from '../../components/notifications/NotificationHeader';
import NotificationFilterBar from '../../components/notifications/NotificationFilterBar';
import NotificationGroupHeader from '../../components/notifications/NotificationGroupHeader';
import SwipeableNotificationRow from '../../components/notifications/SwipeableNotificationRow';
import NotificationEmptyState from '../../components/notifications/NotificationEmptyState';
import NotificationFooterHint from '../../components/notifications/NotificationFooterHint';

const NotificationsScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const swipeableRefs = useRef({});

  const notifications = useNotificationStore((state) => state.notifications);
  const loading = useNotificationStore((state) => state.loading);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore(
    (state) => state.deleteNotification
  );
  const deleteAllNotifications = useNotificationStore(
    (state) => state.deleteAllNotifications
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((notification) => !notification.is_read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const sections = useMemo(
    () => groupNotifications(filteredNotifications),
    [filteredNotifications]
  );

  const handleNotificationPress = useCallback(
    async (notification) => {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      const listingId = notification.data?.listing_id;
      const isMutual = notification.data?.is_mutual;
      const matchedUserId = notification.data?.matched_user_id;

      if (isMutual && matchedUserId) {
        router.push({
          pathname: '/messages/[id]',
          params: {
            id: matchedUserId,
            myPetId: notification.data?.my_pet_id ?? '',
            matchedPetId: notification.data?.matched_pet_id ?? '',
          },
        });
        return;
      }

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

  const handleDeleteAll = useCallback(() => {
    if (!user?.id || notifications.length === 0) return;

    Alert.alert(
      'Tüm bildirimleri sil',
      'Tüm bildirimlerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteAllNotifications(user.id),
        },
      ]
    );
  }, [user?.id, notifications.length, deleteAllNotifications]);

  const handleDeleteNotification = useCallback(
    (notificationId) => {
      if (user?.id) {
        deleteNotification(notificationId, user.id);
      }
    },
    [user?.id, deleteNotification]
  );

  const handleSwipeableWillOpen = useCallback((notificationId) => {
    Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
      if (id !== notificationId && ref?.close) {
        ref.close();
      }
    });
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <SwipeableNotificationRow
        notification={item}
        swipeableRef={(ref) => {
          swipeableRefs.current[item.id] = ref;
        }}
        onPress={handleNotificationPress}
        onDelete={handleDeleteNotification}
        onSwipeableWillOpen={() => handleSwipeableWillOpen(item.id)}
      />
    ),
    [handleNotificationPress, handleDeleteNotification, handleSwipeableWillOpen]
  );

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <NotificationGroupHeader label={section.label} count={section.data.length} />
    ),
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <ThemedView style={styles.container} safe>
      <NotificationHeader
        unreadCount={unreadCount}
        hasNotifications={notifications.length > 0}
        onBack={() => router.back()}
        onMarkAllRead={handleMarkAllRead}
        onDeleteAll={handleDeleteAll}
      />

      <NotificationFilterBar
        activeFilter={activeFilter}
        unreadCount={unreadCount}
        onFilterChange={setActiveFilter}
      />

      {loading ? (
        <ActivityIndicator
          size='large'
          color={colors.primary}
          style={styles.loader}
        />
      ) : filteredNotifications.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {notifications.length > 0 ? <NotificationFooterHint /> : null}
    </ThemedView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
