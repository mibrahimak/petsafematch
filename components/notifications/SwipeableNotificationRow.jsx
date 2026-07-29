import { memo, useCallback, useRef } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import NotificationTypeIcon from './NotificationTypeIcon';
import { formatNotificationDate } from '../../utils/notificationGrouping';

const ACTION_WIDTH = 80;

const SwipeableNotificationRow = ({
  notification,
  onPress,
  onDelete,
  onSwipeableWillOpen,
  swipeableRef,
}) => {
  const { colors } = useTheme();
  const localSwipeableRef = useRef(null);
  const isUnread = !notification.is_read;

  const setSwipeableRef = useCallback(
    (ref) => {
      localSwipeableRef.current = ref;
      if (typeof swipeableRef === 'function') {
        swipeableRef(ref);
      }
    },
    [swipeableRef]
  );

  const closeSwipeable = useCallback(() => {
    localSwipeableRef.current?.close();
  }, []);

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      'Bildirimi sil',
      'Bu bildirimi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel', onPress: closeSwipeable },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            onDelete(notification.id);
            closeSwipeable();
          },
        },
      ]
    );
  }, [notification.id, onDelete, closeSwipeable]);

  const renderRightActions = useCallback(
    () => (
      <View style={styles.actionsRow}>
        <Pressable style={styles.deleteAction} onPress={handleDeletePress}>
          <Ionicons name='trash-outline' size={22} color='#FFF' />
          <ThemedText style={styles.actionText}>Sil</ThemedText>
        </Pressable>
      </View>
    ),
    [handleDeletePress]
  );

  return (
    <Swipeable
      ref={setSwipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={onSwipeableWillOpen}
      overshootRight={false}
    >
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: colors.uiBackground,
            borderColor: isUnread ? colors.primary + '44' : colors.borderColor,
          },
        ]}
        onPress={() => onPress(notification)}
      >
        {isUnread ? (
          <View
            style={[styles.accentBar, { backgroundColor: colors.primary }]}
          />
        ) : null}

        <NotificationTypeIcon type={notification.type} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText
              style={[
                styles.title,
                { fontWeight: isUnread ? '600' : '400' },
              ]}
              numberOfLines={2}
            >
              {notification.title}
            </ThemedText>
            {isUnread ? (
              <View
                style={[styles.unreadDot, { backgroundColor: colors.primary }]}
              />
            ) : null}
          </View>

          {notification.body ? (
            <ThemedText
              style={[styles.body, { color: colors.text }]}
              numberOfLines={2}
            >
              {notification.body}
            </ThemedText>
          ) : null}

          <ThemedText style={[styles.time, { color: colors.label }]}>
            {formatNotificationDate(notification.created_at)}
          </ThemedText>
        </View>
      </Pressable>
    </Swipeable>
  );
};

export default memo(SwipeableNotificationRow);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 10,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  deleteAction: {
    width: ACTION_WIDTH,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginLeft: 8,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
